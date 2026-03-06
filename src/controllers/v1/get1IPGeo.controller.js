import { getIpGeo, isValidIp } from "../../lib/geo_data.js";
import { normalizeIp } from "../../lib/grab_ip.js";
import { aj } from "../../services/aj.js";

export async function get1GeoIPController(req, res, next) {
  try {
      const decision = await aj.protect(req);
      
      if (decision.isDenied()) {
        return res.status(429).json({
          error: "Too many requests",
          retryAfter: 60,  // seconds
        });
      }
      const ip = normalizeIp(req.params.ip);

      if (!isValidIp(ip)) {
        return res.status(400).json({ message: "Invalid IP address provided" });
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
