import { signToken, setAuthCookie } from "../_utils/auth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const { password } = req.body || {};
  if (!password) return res.status(400).json({ ok: false });

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: "Invalid password" });
  }

  const token = signToken(
    { role: "admin", exp: Date.now() + 1000 * 60 * 60 * 8 }, // 8 hours
    process.env.ADMIN_TOKEN_SECRET
  );

  setAuthCookie(res, token);
  return res.status(200).json({ ok: true });
}
