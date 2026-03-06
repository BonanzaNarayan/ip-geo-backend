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
  const forwardedHeader = req.headers["x-forwarded-for"];

  if (typeof forwardedHeader === "string" && forwardedHeader.length > 0) {
    const firstForwardedIp = forwardedHeader.split(",")[0];
    return normalizeIp(firstForwardedIp);
  }

  return normalizeIp(req.ip || req.socket?.remoteAddress || "");
}

export { normalizeIp };
