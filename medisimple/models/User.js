import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    age: { type: Number, required: true },
    password: { type: String, required: true }, // bcrypt hashed
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
