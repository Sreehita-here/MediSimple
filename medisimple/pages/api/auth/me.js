import { getAuthUser } from "../../../lib/auth";

export default function handler(req, res) {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ authenticated: false });
  }
  return res.status(200).json({
    authenticated: true,
    user: { id: user.userId, name: user.name, email: user.email },
  });
}
