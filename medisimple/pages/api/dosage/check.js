import { connectDB } from "../../../lib/mongodb";
import Dosage from "../../../models/Dosage";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function parseRange(rangeStr) {
  const match = rangeStr?.match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return null;
  return { min: Number(match[1]), max: Number(match[2]) };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { medicineName, dailyDoseMg } = req.body;
  if (!medicineName || !dailyDoseMg) {
    return res.status(400).json({ error: "medicineName and dailyDoseMg are required" });
  }

  await connectDB();
  const dosage = await Dosage.findOne({ medicineName: { $regex: `^${medicineName}$`, $options: "i" } });

  if (dosage) {
    const range = parseRange(dosage.safeDailyRange);
    let status = "unknown";
    let explanation = `Reference range: ${dosage.safeDailyRange}.`;
    if (range) {
      if (dailyDoseMg < range.min) {
        status = "warning";
        explanation = `Your dose (${dailyDoseMg}mg) is below the typical range (${dosage.safeDailyRange}). This may be intentional — confirm with your doctor.`;
      } else if (dailyDoseMg > range.max) {
        status = "danger";
        explanation = `Your dose (${dailyDoseMg}mg) exceeds the typical safe range (${dosage.safeDailyRange}).`;
      } else {
        status = "safe";
        explanation = `Your dose (${dailyDoseMg}mg) is within the typical safe range (${dosage.safeDailyRange}).`;
      }
    }
    return res.status(200).json({
      source: "database", status, explanation,
      safeDailyRange: dosage.safeDailyRange, maxPerDay: dosage.maxPerDay, dbSource: dosage.source,
    });
  }

  if (!GROQ_API_KEY) {
    return res.status(200).json({
      source: "none", status: "unknown",
      explanation: "This medicine isn't in our verified dosage database. Please ask your doctor or pharmacist to confirm your dose.",
    });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: `You are checking medication dosage safety. ONLY use well-established FDA/WHO dosage guidelines you are highly confident about. If you are not confident about the exact safe range for this medicine, respond with status "unknown" and say to ask a doctor — do NOT guess a number. Respond ONLY with JSON: {"status": "safe|warning|danger|unknown", "explanation": "string", "safeDailyRange": "string or null"}` },
          { role: "user", content: `Medicine: ${medicineName}. User's daily dose: ${dailyDoseMg}mg. Is this safe?` },
        ],
      }),
    });
    if (!groqRes.ok) throw new Error(`Groq responded ${groqRes.status}`);
    const completion = await groqRes.json();
    const parsed = JSON.parse(completion.choices[0].message.content.trim());
    return res.status(200).json({ source: "groq", ...parsed });
  } catch (err) {
    console.error("Dosage fallback error:", err);
    return res.status(200).json({ source: "none", status: "unknown", explanation: "Unable to verify this dose automatically. Please ask your doctor." });
  }
}
