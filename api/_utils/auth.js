import crypto from "crypto";

export function parseCookies(req) {
  const header = req.headers.cookie || "";
  const out = {};
  header.split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx > -1) {
      const k = pair.slice(0, idx).trim();
      const v = decodeURIComponent(pair.slice(idx + 1).trim());
      out[k] = v;
    }
  });
  return out;
}

export function signToken(payload, secret) {
  // very small HMAC token: base64(payload).hex(hmac)
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return `${body}.${sig}`;
}

export function verifyToken(token, secret) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp && Date.now() > payload.exp) return null;
  return payload;
}

export function requireAdmin(req) {
  const cookieName = process.env.ADMIN_COOKIE_NAME || "tsl_admin";
  const secret = process.env.ADMIN_TOKEN_SECRET;
  const cookies = parseCookies(req);
  const token = cookies[cookieName];
  const payload = verifyToken(token, secret);
  return payload && payload.role === "admin";
}

export function setAuthCookie(res, token) {
  const cookieName = process.env.ADMIN_COOKIE_NAME || "tsl_admin";
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `${cookieName}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${60 * 60 * 8}`, // 8 hours
  ];
  if (isProd) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}

export function clearAuthCookie(res) {
  const cookieName = process.env.ADMIN_COOKIE_NAME || "tsl_admin";
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `${cookieName}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (isProd) parts.push("Secure");
  res.setHeader("Set-Cookie", parts.join("; "));
}
