import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";

/**
 * Health check routes.
 *
 * Used to verify server availability and basic uptime.
 *
 * Base path: `/api/v1/health`
 *
 * @module routes/health
 */
const router = Router();

/**
 * Check API health status.
 *
 * @route GET /
 * @returns {ApiResponse} 200 - Server is running and healthy
 */
router.route("/").get(healthCheck);

export default router;
