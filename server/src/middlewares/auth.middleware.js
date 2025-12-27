import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

/**
 * Verifies a JWT access token and attaches the authenticated user to the request.
 *
 * - Extracts the access token from cookies or the Authorization header
 * - Validates the token using the access token secret
 * - Fetches the associated user and excludes sensitive fields
 * - Attaches the user document to `req.user` on success
 *
 * @async
 * @function verifyJWT
 * @param {import("express").Request} req - Express request object containing cookies and headers
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware function
 * @throws {ApiError} 401 - If the token is missing, invalid, or the user does not exist
 * @returns {Promise<void>} Calls `next()` if authentication succeeds
 */

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
        );

        if(!user) throw new ApiError("Invalid access token");

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid access token");
    }
});
