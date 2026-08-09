import { connectDB } from "../../../lib/mongodb";
import Medicine from "../../../models/Medicine";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const { q } = req.query;
  if (!q || q.length < 2) return res.status(200).json({ results: [] });

  await connectDB();
  const results = await Medicine.find({ name: { $regex: q, $options: "i" } })
    .limit(8)
    .select("name strength commonBrands verified");
  return res.status(200).json({ results });
}
