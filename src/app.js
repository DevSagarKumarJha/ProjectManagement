import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";

/**
 * Express application instance.
 *
 * Configures:
 * - JSON and URL-encoded body parsing
 * - Static file serving
 * - Cookie parsing
 * - CORS policy
 * - API route mounting
 *
 * @module app
 */
const app = express();

/**
 * Parse incoming JSON requests with a size limit.
 */
app.use(express.json({ limit: "16kb" }));

/**
 * Parse URL-encoded payloads with extended syntax support.
 */
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

/**
 * Serve static assets from the `public` directory.
 */
app.use(express.static("public"));

/**
 * Parse cookies attached to incoming requests.
 */
app.use(cookieParser());

/**
 * Enable Cross-Origin Resource Sharing (CORS).
 *
 * - Allows configured client origins
 * - Supports credentials (cookies)
 * - Restricts allowed HTTP methods and headers
 */
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(", ") || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);

/**
 * Health check routes.
 *
 * Base path: `/api/v1/health-check`
 */
app.use("/api/v1/health-check/", healthCheckRouter);

/**
 * Authentication and user-related routes.
 *
 * Base path: `/api/v1/auth`
 */
app.use("/api/v1/auth/", authRouter);

/**
 * Root route for basic server availability check.
 *
 * @route GET /
 * @returns {string} Base response message
 */
app.get("/", (req, res) => {
    res.send("Base camp");
});

export default app;
