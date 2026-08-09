import { connectDB } from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import { createToken, setAuthCookie } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, age, password } = req.body;

  if (!name || !email || !age || !password) {
    return res.status(400).json({ error: "All fields are required: name, email, age, password." });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  if (age < 1 || age > 150) {
    return res.status(400).json({ error: "Please enter a valid age." });
  }

  await connectDB();

  // Check if email already exists
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists. Please log in instead." });
  }

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    age: parseInt(age),
    password: hashedPassword,
  });

  // Generate JWT and set cookie
  const token = createToken(user);
  setAuthCookie(res, token);

  return res.status(201).json({
    success: true,
    user: { id: user._id, name: user.name, email: user.email, age: user.age },
  });
}
