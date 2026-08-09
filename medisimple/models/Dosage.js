import mongoose from "mongoose";

const DosageSchema = new mongoose.Schema({
  medicineName: { type: String, required: true, index: true },
  safeSingleDose: { type: String },
  safeDailyRange: { type: String, required: true },
  maxPerDay: { type: String },
  source: { type: String, required: true },
});

export default mongoose.models.Dosage ||
  mongoose.model("Dosage", DosageSchema);
