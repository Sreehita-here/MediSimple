import { randomUUID } from "crypto";

const COOKIE_NAME = "medisimple_device_id";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function getOrSetDeviceId(req, res) {
  const existing = req.cookies?.[COOKIE_NAME];
  if (existing) return existing;

  const id = randomUUID();
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${id}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax`
  );
  return id;
}
