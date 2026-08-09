import mongoose from "mongoose";

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  strength: { type: String, required: true },
  commonBrands: [{ type: String }],
  whatItDoes: { type: String, required: true },
  howToTake: [{ type: String }],
  sideEffects: {
    common: [{ type: String }],
    lessCommon: [{ type: String }],
    serious: [{ type: String }],
  },
  storage: { type: String },
  callDoctorIf: [{ type: String }],
  verified: { type: Boolean, default: false },
  source: { type: String, required: true },
});

MedicineSchema.index({ name: "text" });

export default mongoose.models.Medicine ||
  mongoose.model("Medicine", MedicineSchema);
