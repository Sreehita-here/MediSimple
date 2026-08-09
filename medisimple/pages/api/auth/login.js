import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import { createToken, setAuthCookie } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  await connectDB();

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  // Generate JWT and set cookie
  const token = createToken(user);
  setAuthCookie(res, token);

  return res.status(200).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, age: user.age },
  });
}
