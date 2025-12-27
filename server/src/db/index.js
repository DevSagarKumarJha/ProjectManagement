import mongoose from "mongoose";

/**
 * Establishes a connection to the MongoDB database.
 *
 * - Uses the MongoDB connection URI from environment variables
 * - Terminates the process if the connection fails
 *
 * @async
 * @function connectDB
 * @throws {Error} If the MongoDB connection attempt fails
 * @returns {Promise<void>} Resolves when the database connection is established
 */
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection error", error);
        process.exit(1);
    }
};

export default connectDB;
