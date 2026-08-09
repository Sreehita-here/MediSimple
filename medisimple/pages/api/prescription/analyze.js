import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fileBase64, mimeType } = req.body;

  if (!fileBase64 || !mimeType) {
    return res.status(400).json({ error: "Missing file data. Please upload an image or PDF." });
  }

  const prompt = `You are a medical prescription analyzer. Analyze the attached medical prescription image or document and extract ALL medications listed.

For EACH medication found, extract:
- "name": The generic or brand name of the medicine
- "strength": The dosage/strength (e.g., "500mg", "10mg"). If not visible, use ""
- "frequency": How often to take it (e.g., "Twice daily", "Once at bedtime"). If not visible, use ""
- "duration": How long to take it (e.g., "7 days", "1 month"). If not visible, use ""
- "instructions": Any special instructions (e.g., "Take with food", "Before meals"). If not visible, use ""

Also extract:
- "doctorName": The prescribing doctor's name if visible, otherwise ""
- "patientName": The patient's name if visible, otherwise ""
- "date": The prescription date if visible, otherwise ""
- "diagnosis": The diagnosis or condition if mentioned, otherwise ""

IMPORTANT: 
- Return ONLY valid JSON in the exact structure requested, no markdown wrapper, no conversational text.
- If you cannot read or find any medicines, return {"medicines":[],"error":"Could not read prescription clearly"}
- Do NOT hallucinate medicines. Only extract what is clearly written.

Return format:
{
  "medicines": [
    {"name":"...","strength":"...","frequency":"...","duration":"...","instructions":"..."}
  ],
  "doctorName": "...",
  "patientName": "...",
  "date": "...",
  "diagnosis": "..."
}`;

  // Helper to parse JSON string safely
  const parseResponseText = (text) => {
    let jsonStr = text.trim();
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    // Find first outer curly bracket if parse fails
    try {
      return JSON.parse(jsonStr);
    } catch {
      const objMatch = text.match(/\{[\s\S]*\}/);
      if (objMatch) {
        return JSON.parse(objMatch[0]);
      }
      throw new Error("Invalid JSON structure returned by AI");
    }
  };

  // --- Step 1: Try Google Gemini ---
  if (GEMINI_API_KEY) {
    try {
      console.log("Prescription Analysis: Attempting Gemini...");
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: fileBase64,
                },
              },
            ],
          },
        ],
      });

      const parsed = parseResponseText(response.text || "");
      console.log("Prescription Analysis: Gemini Success!");
      return res.status(200).json({
        success: true,
        data: parsed,
        source: "gemini",
      });
    } catch (geminiError) {
      console.warn("Gemini execution failed or quota exceeded:", geminiError.message || geminiError);
      
      // If we don't have Groq key, fail immediately
      if (!GROQ_API_KEY) {
        return res.status(502).json({
          error: `Gemini analysis failed: ${geminiError.message || "Quota Exceeded"}. Please configure a backup Groq API Key or try again later.`,
        });
      }

      // If it's a PDF, Groq Vision doesn't support it, so warn user
      if (mimeType === "application/pdf") {
        return res.status(502).json({
          error: "Gemini quota exceeded. The backup analyzer (Groq) does not support PDF files directly. Please upload your prescription as an Image (JPG, PNG) instead.",
        });
      }
    }
  }

  // --- Step 2: Fallback to Groq Vision ---
  if (GROQ_API_KEY) {
    try {
      console.log("Prescription Analysis: Falling back to Groq Vision...");
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen/qwen3.6-27b",
          temperature: 0.1,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${fileBase64}`,
                  },
                },
              ],
            },
          ],
        }),
      });

      if (!groqRes.ok) {
        const errText = await groqRes.text();
        throw new Error(`Groq API returned status ${groqRes.status}: ${errText}`);
      }

      const completion = await groqRes.json();
      const rawText = completion.choices?.[0]?.message?.content?.trim();
      
      if (!rawText) {
        throw new Error("Empty response from Groq Vision API");
      }

      const parsed = parseResponseText(rawText);
      console.log("Prescription Analysis: Groq Vision Fallback Success!");
      return res.status(200).json({
        success: true,
        data: parsed,
        source: "groq-vision",
      });
    } catch (groqError) {
      console.error("Backup Groq Vision analysis also failed:", groqError.message || groqError);
      return res.status(502).json({
        error: `Both Gemini and Groq analyzers failed. Gemini Error: rate limits. Groq Error: ${groqError.message || "Failed to parse image"}.`,
      });
    }
  }

  return res.status(500).json({
    error: "No configured API Keys (Gemini/Groq) found to analyze prescription.",
  });
}
