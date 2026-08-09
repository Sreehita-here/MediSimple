import { connectDB } from "../../../lib/mongodb";
import UserMedicine from "../../../models/UserMedicine";
import { getOrSetDeviceId } from "../../../lib/deviceId";
import { getAuthUser } from "../../../lib/auth";

export default async function handler(req, res) {
  const authUser = getAuthUser(req);
  const deviceId = getOrSetDeviceId(req, res);
  await connectDB();

  const queryCriteria = authUser
    ? { userId: authUser.userId }
    : { deviceId, userId: { $exists: false } };

  if (req.method === "GET") {
    const all = await UserMedicine.find(queryCriteria).sort({ createdAt: -1 });
    const active = all.filter((m) => m.status === "active");
    const stopped = all.filter((m) => m.status === "stopped");
    return res.status(200).json({ active, stopped });
  }

  if (req.method === "POST") {
    const { name, strength, frequency, reminderTimes } = req.body;
    if (!name || !strength) {
      return res.status(400).json({ error: "name and strength are required" });
    }
    const medData = { deviceId, name, strength, frequency, reminderTimes };
    if (authUser) {
      medData.userId = authUser.userId;
    }
    const med = await UserMedicine.create(medData);
    return res.status(201).json({ medicine: med });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
