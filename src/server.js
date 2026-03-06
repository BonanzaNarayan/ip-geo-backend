import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { isSpoofedBot } from "@arcjet/inspect";
import V1router from "./routes/v1/geoip.route.js";

dotenv.config();

const app = express();
const requestedPort = Number(process.env.PORT);
const PORT = Number.isInteger(requestedPort) && requestedPort > 0 ? requestedPort : 5000;

app.set("trust proxy", true);
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "IP Geo API is running",
    version: "v1",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/ip-geo/v1", V1router);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`IP Geo API listening on http://localhost:${PORT}`);
});
