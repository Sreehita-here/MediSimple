import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "medisimple_jwt_secret_key_2024";
const COOKIE_NAME = "medisimple_token";
const ONE_WEEK = 60 * 60 * 24 * 7;

// Create a JWT token for a user
export function createToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Set the auth cookie on the response
export function setAuthCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; Max-Age=${ONE_WEEK}; HttpOnly; SameSite=Lax`
  );
}

// Clear the auth cookie
export function clearAuthCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
  );
}

// Verify the token from the request and return the user payload (or null)
export function getAuthUser(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // { userId, email, name }
  } catch {
    return null;
  }
}

// Middleware-style helper: returns the user or sends 401
export function requireAuth(req, res) {
  const user = getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "Not authenticated. Please log in." });
    return null;
  }
  return user;
}
