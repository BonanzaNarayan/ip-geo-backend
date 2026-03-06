import { getIpGeo } from "../../lib/geo_data.js";
import { getClientIp } from "../../lib/grab_ip.js";
import { aj } from "../../services/aj.js";

export async function getGeoIPController(req, res, next) {
  try {
     const decision = await aj.protect(req);

      if (decision.isDenied()) {
        return res.status(429).json({
          error: "Too many requests",
          retryAfter: 60,  // seconds
        });
      }
      const ip = await getClientIp(req);
      if (!ip) {
        return res.status(400).json({ message: "Unable to determine client IP" });
      }

      const geo = await getIpGeo(ip);
      if (!geo) {
        return res.status(404).json({
          message: "No geolocation data found for IP",
          data: { ip },
        });
      }

      return res.status(200).json({
        timestamp: Date.now(),
        data: {
          ip,
          geo,
        },
      });
  }
  catch (error) {
    return next(error);
  }
}
