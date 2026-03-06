import express from "express";
import { getGeoIPController } from "../../controllers/v1/geoIp.controller.js";
import { get1GeoIPController } from "../../controllers/v1/get1IPGeo.controller.js";

const V1router = express.Router();

V1router.get("/", getGeoIPController);

V1router.get("/lookup/:ip", get1GeoIPController);

// Backward-compatible route for previous clients.
V1router.get("/:ip", get1GeoIPController);

export default V1router;
