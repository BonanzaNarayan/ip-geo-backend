import { isIP } from "node:net";
import geoip from "geoip-lite";

export function isValidIp(ip) {
  return typeof ip === "string" && isIP(ip) !== 0;
}

/**
 * Fetch enriched geo data from ip-api.com.
 * Used as a fallback when geoip-lite is missing city / region.
 * Free tier: 45 req/min, no key required.
 */
async function fetchFallbackGeo(ip) {
  try {
    const fields =
      "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,mobile,proxy,hosting";

    const res = await fetch(`http://ip-api.com/json/${ip}?fields=${fields}`);

    if (!res.ok) return null;

    const data = await res.json();

    if (data.status !== "success") return null;

    return data;
  } catch {
    return null;
  }
}

/**
 * Merges a geoip-lite result with ip-api.com fallback data.
 * geoip-lite fields take priority; fallback fills any blanks.
 */
function mergeGeoData(local, fallback) {
  return {
    // ── Core ──────────────────────────────────────────────────
    ip:         fallback?.query       || null,
    country:    local?.country        || fallback?.countryCode  || "",
    countryName:fallback?.country     || "",
    region:     local?.region         || fallback?.region       || "",
    regionName: fallback?.regionName  || "",
    city:       local?.city           || fallback?.city         || "",
    zip:        fallback?.zip         || "",

    // ── Coordinates ───────────────────────────────────────────
    lat: fallback?.lat ?? local?.ll?.[0] ?? null,
    lon: fallback?.lon ?? local?.ll?.[1] ?? null,
    ll:  fallback?.lat != null
           ? [fallback.lat, fallback.lon]
           : local?.ll ?? [],

    // ── Meta ──────────────────────────────────────────────────
    timezone: local?.timezone || fallback?.timezone || "",
    eu:       local?.eu       || "0",
    metro:    local?.metro    || 0,
    area:     local?.area     || 0,
    range:    local?.range    || [],

    // ── ISP / Org (only from fallback, geoip-lite doesn't have these) ──
    isp:     fallback?.isp     || "",
    org:     fallback?.org     || "",
    as:      fallback?.as      || "",

    // ── Network flags (fallback only) ─────────────────────────
    mobile:  fallback?.mobile  ?? false,
    proxy:   fallback?.proxy   ?? false,
    hosting: fallback?.hosting ?? false,
  };
}

/**
 * Returns full geo data for a given IP.
 *
 * Strategy:
 *  1. Validate the IP.
 *  2. Look up with geoip-lite (fast, local, offline).
 *  3. If city or region is empty, call ip-api.com to fill the gaps.
 *  4. Merge both sources and return a unified object.
 */
export async function getIpGeo(ip) {
  if (!isValidIp(ip)) return null;

  const local = geoip.lookup(ip); // may be null for unknown IPs

  // If geoip-lite has complete data, still enrich with ISP/org from fallback
  const needsFallback =
    !local ||
    !local.city  ||  local.city.trim()   === "" ||
    !local.region || local.region.trim() === "";

  const fallback = needsFallback ? await fetchFallbackGeo(ip) : null;

  // Nothing found anywhere
  if (!local && !fallback) return null;

  return mergeGeoData(local, fallback);
}