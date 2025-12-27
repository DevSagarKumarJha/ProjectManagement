import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

/**
 * Loads environment variables from the `.env` file.
 */
dotenv.config({
    path: "./.env",
});

/**
 * Application port.
 *
 * Falls back to `8000` if not provided via environment variables.
 *
 * @constant {number}
 */
const port = process.env.PORT || 8000;

/**
 * Initializes the application.
 *
 * - Establishes a connection to MongoDB
 * - Starts the HTTP server after successful database connection
 *
 * @function startServer
 * @throws {Error} If database connection fails
 */
connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`The server is running at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });
