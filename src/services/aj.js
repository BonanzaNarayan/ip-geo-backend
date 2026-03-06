import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import dotenv from 'dotenv'

dotenv.config()

export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
        mode: "LIVE",
        refillRate: 10,   // refill 10 tokens every 60 seconds
        interval: 60,     // 1 minute window
        capacity: 20,     // burst allowance of 20 requests
    })
  ],
});