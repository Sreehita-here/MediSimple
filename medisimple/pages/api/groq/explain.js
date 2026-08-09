const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const REQUIRED_FIELDS = ["name", "strength", "whatItDoes", "howToTake", "sideEffects", "storage", "callDoctorIf"];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { medicineName, strength, language = "English" } = req.body;
  if (!medicineName) {
    return res.status(400).json({ error: "medicineName is required" });
  }

  if (!GROQ_API_KEY) {
    return res.status(503).json({ error: "Groq API not configured. Add GROQ_API_KEY to .env.local" });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a medical information assistant providing educational information about medicines. 
CRITICAL RULES:
1. Only provide information you are highly confident about from established medical sources (FDA, WHO, standard pharmacology).
2. If you are uncertain about ANY detail, leave that field empty or omit it — do NOT guess and NEVER write "ask your doctor", "consult a physician", or similar placeholder phrases.
3. NEVER invent side effects, interactions, or dosage information.
4. Respond in ${language}.
5. Respond ONLY with valid JSON in exactly this shape:
{
  "name": "string",
  "strength": "string",
  "condition": "string (what condition this treats)",
  "whatItDoes": "string (1-2 plain language sentences)",
  "howToTake": ["string", "string"],
  "dontDo": ["string"],
  "sideEffects": {
    "common": ["string"],
    "lessCommon": ["string"],
    "serious": ["string"]
  },
  "tellDoctor": ["string"],
  "interactions": ["string"],
  "callDoctorIf": ["string"],
  "storage": "string",
  "source": "groq"
}`,
          },
          {
            role: "user",
            content: `Explain the medicine: ${medicineName}${strength ? ` ${strength}` : ""}. Provide educational information only. If you are not confident about any specific detail, omit it. Do not use placeholders like "ask your doctor" in the text.`,
          },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errBody = await groqRes.text();
      console.error("Groq API error:", groqRes.status, errBody);
      return res.status(502).json({ error: "AI service temporarily unavailable. Please try again." });
    }

    const completion = await groqRes.json();
    const raw = completion.choices?.[0]?.message?.content?.trim();
    if (!raw) {
      return res.status(502).json({ error: "Empty response from AI service." });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return res.status(502).json({ error: "AI returned malformed data. Please try again." });
    }

    // Helper to sanitize any remaining "ask your doctor" or similar placeholder phrases
    const cleanString = (str) => {
      if (!str) return "";
      const regex = /(ask\s+your\s+doctor|consult\s+(your\s+)?doctor|consult\s+a\s+physician|consult\s+physician|ask\s+a\s+doctor)/gi;
      return str.replace(regex, "").trim();
    };

    const sanitize = (val) => {
      if (typeof val === "string") {
        return cleanString(val);
      }
      if (Array.isArray(val)) {
        return val
          .map(sanitize)
          .filter(item => typeof item === "string" ? item.length > 5 : true); // Filter out empty/trivial fragments
      }
      if (typeof val === "object" && val !== null) {
        const resObj = {};
        for (const [k, v] of Object.entries(val)) {
          resObj[k] = sanitize(v);
        }
        return resObj;
      }
      return val;
    };

    const sanitizedData = sanitize(parsed);

    // Apply safe defaults for required fields if they got cleared
    if (!sanitizedData.whatItDoes || sanitizedData.whatItDoes.length < 5) {
      sanitizedData.whatItDoes = `Information on ${sanitizedData.name || medicineName} can be obtained from your pharmacist or prescription sheet.`;
    }
    if (!sanitizedData.storage || sanitizedData.storage.length < 5) {
      sanitizedData.storage = "Store in a cool, dry place away from direct sunlight.";
    }
    if (!sanitizedData.howToTake || sanitizedData.howToTake.length === 0) {
      sanitizedData.howToTake = ["Swallow with water precisely as directed on your prescription label."];
    }
    if (!sanitizedData.callDoctorIf || sanitizedData.callDoctorIf.length === 0) {
      sanitizedData.callDoctorIf = ["If you experience severe reactions or worsening symptoms."];
    }

    // Validate required fields
    for (const field of REQUIRED_FIELDS) {
      if (!sanitizedData[field]) {
        return res.status(502).json({ error: `AI response missing required field: ${field}. Please try again.` });
      }
    }

    return res.status(200).json({ source: "groq", data: sanitizedData });
  } catch (err) {
    console.error("Groq explain error:", err);
    return res.status(502).json({ error: "Failed to get AI explanation. Please check your connection and try again." });
  }
}
