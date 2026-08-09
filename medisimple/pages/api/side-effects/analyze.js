import { connectDB } from "../../../lib/mongodb";
import Medicine from "../../../models/Medicine";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { medicineName, reportedEffects = [], daysSinceStart, severity } = req.body;
  if (!medicineName || reportedEffects.length === 0) {
    return res.status(400).json({ error: "medicineName and reportedEffects are required" });
  }

  await connectDB();
  const medicine = await Medicine.findOne({ name: { $regex: `^${medicineName}$`, $options: "i" } });
  let known = [];
  let callDoctorIf = [];
  let groqKeyUsed = GROQ_API_KEY;

  if (!medicine) {
    // Attempt fallback online cross-check
    const FALLBACK_KEY = process.env.GROQ_API_KEY_FALLBACK;
    groqKeyUsed = FALLBACK_KEY; // Use fallback key for the second step as well if needed
    try {
      const fallbackRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${FALLBACK_KEY}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a medical assistant. Provide the common, less common, and serious side effects, and when to call a doctor for the provided medicine. Respond ONLY with valid JSON exactly matching this structure:
{
  "common": ["string"],
  "lessCommon": ["string"],
  "serious": ["string"],
  "callDoctorIf": ["string"]
}`,
            },
            {
              role: "user",
              content: `Medicine: ${medicineName}`,
            },
          ],
        }),
      });
      if (!fallbackRes.ok) throw new Error("Fallback LLM failed");
      const completion = await fallbackRes.json();
      const fallbackData = JSON.parse(completion.choices[0].message.content.trim());
      
      known = [
        ...(fallbackData.common || []).map((s) => ({ effect: s, tier: "common" })),
        ...(fallbackData.lessCommon || []).map((s) => ({ effect: s, tier: "lessCommon" })),
        ...(fallbackData.serious || []).map((s) => ({ effect: s, tier: "serious" })),
      ];
      callDoctorIf = fallbackData.callDoctorIf || [];
    } catch (err) {
      console.error("Fallback Groq check failed:", err);
      return res.status(404).json({
        error: "Medicine not found in our verified database and online cross-check failed.",
        suggestion: "Ask your doctor about these symptoms directly.",
      });
    }
  } else {
    known = [
      ...medicine.sideEffects.common.map((s) => ({ effect: s, tier: "common" })),
      ...medicine.sideEffects.lessCommon.map((s) => ({ effect: s, tier: "lessCommon" })),
      ...medicine.sideEffects.serious.map((s) => ({ effect: s, tier: "serious" })),
    ];
    callDoctorIf = medicine.callDoctorIf || [];
  }

  const classified = reportedEffects.map((reported) => {
    const match = known.find((k) => k.effect.toLowerCase().includes(reported.toLowerCase()));
    return { reported, documented: !!match, tier: match?.tier || null };
  });

  const anySerious = classified.some((c) => c.tier === "serious");
  const anyUndocumented = classified.some((c) => !c.documented);

  let groqNote = null;
  if (groqKeyUsed) {
    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKeyUsed}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          temperature: 0.3,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You give brief, reassuring but honest guidance about medication side effects. You are given a FIXED list of documented side effects — do not add any side effect not in that list. Respond ONLY with JSON: {"careAdvice": ["string"], "additionalCallDoctorIf": ["string"]}`,
            },
            {
              role: "user",
              content: `Medicine: ${medicineName}. Documented side effects: ${JSON.stringify(known)}. Patient is currently experiencing: ${reportedEffects.join(", ")} (day ${daysSinceStart}, severity: ${severity}). Give practical, non-alarming self-care advice and clear signs to call a doctor, using ONLY the documented list above.`,
            },
          ],
        }),
      });
      if (groqRes.ok) {
        const completion = await groqRes.json();
        groqNote = JSON.parse(completion.choices[0].message.content.trim());
      }
    } catch (err) {
      console.error("Side effect Groq note failed:", err);
    }
  }

  return res.status(200).json({
    assessment: anySerious ? "serious" : anyUndocumented ? "unclear" : "normal",
    classified,
    callDoctorIf: callDoctorIf,
    careAdvice: groqNote?.careAdvice || null,
    additionalCallDoctorIf: groqNote?.additionalCallDoctorIf || null,
  });
}
