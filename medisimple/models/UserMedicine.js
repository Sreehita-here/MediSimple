import mongoose from "mongoose";

const UserMedicineSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    name: { type: String, required: true },
    strength: { type: String, required: true },
    frequency: { type: String },
    startDate: { type: Date, default: Date.now },
    stopDate: { type: Date },
    status: { type: String, enum: ["active", "stopped"], default: "active" },
    reminderTimes: { type: [String], default: [] }, // e.g. ["08:00", "14:00", "20:00"]
  },
  { timestamps: true }
);

export default mongoose.models.UserMedicine ||
  mongoose.model("UserMedicine", UserMedicineSchema);
