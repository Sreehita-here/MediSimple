import { connectDB } from "../../../lib/mongodb";
import Medicine from "../../../models/Medicine";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const { name } = req.query;
  await connectDB();

  const medicine = await Medicine.findOne({ name: { $regex: `^${name}$`, $options: "i" } });
  if (!medicine) {
    return res.status(404).json({
      error: "Medicine not found in our verified database",
      suggestion: "Please check the spelling or try just the medicine name",
    });
  }
  return res.status(200).json({ medicine });
}
