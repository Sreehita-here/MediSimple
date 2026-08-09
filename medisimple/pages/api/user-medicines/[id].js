import { connectDB } from "../../../lib/mongodb";
import UserMedicine from "../../../models/UserMedicine";
import { getOrSetDeviceId } from "../../../lib/deviceId";
import { getAuthUser } from "../../../lib/auth";

export default async function handler(req, res) {
  const authUser = getAuthUser(req);
  const deviceId = getOrSetDeviceId(req, res);
  const { id } = req.query;
  await connectDB();

  const queryCriteria = authUser
    ? { _id: id, userId: authUser.userId }
    : { _id: id, deviceId, userId: { $exists: false } };

  const med = await UserMedicine.findOne(queryCriteria);
  if (!med) return res.status(404).json({ error: "Medicine not found" });

  if (req.method === "PATCH") {
    if (req.body && req.body.action === "addReminder" && req.body.time) {
      if (!med.reminderTimes) med.reminderTimes = [];
      if (!med.reminderTimes.includes(req.body.time)) {
        med.reminderTimes.push(req.body.time);
        await med.save();
      }
      return res.status(200).json({ medicine: med });
    }

    // Move to stopped
    med.status = "stopped";
    med.stopDate = new Date();
    await med.save();
    return res.status(200).json({ medicine: med });
  }

  if (req.method === "DELETE") {
    await UserMedicine.deleteOne({ _id: id, deviceId });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
