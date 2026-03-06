function normalizeIp(input) {
  if (typeof input !== "string") {
    return "";
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("::ffff:")) {
    return trimmed.replace("::ffff:", "");
  }

  return trimmed;
}

export function getClientIp(req) {
  // 1. X-Forwarded-For — most common proxy header (Nginx, AWS, Railway, Render)
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    return normalizeIp(forwarded.split(",")[0].trim());
  }

  // 2. X-Real-IP — set by Nginx directly
  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim().length > 0) {
    return normalizeIp(realIp.trim());
  }

  // 3. Cloudflare
  const cfIp = req.headers["cf-connecting-ip"];
  if (typeof cfIp === "string" && cfIp.trim().length > 0) {
    return normalizeIp(cfIp.trim());
  }

  // 4. Fallback to Express req.ip or raw socket
  return normalizeIp(req.ip || req.socket?.remoteAddress || "");
}

export { normalizeIp };
