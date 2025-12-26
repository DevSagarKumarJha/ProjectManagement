import { Router } from "express";
import {
    getCurrentUser,
    loginUser,
    logoutUser,
    registerUser,
    resendEmailVerification,
    verifyUserEmail,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    userLoginValidator,
    userRegisterValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

/**
 * Authentication and user-related routes.
 *
 * Base path: `/api/v1/auth`
 *
 * @module routes/auth
 */
const router = Router();

/**
 * Register a new user.
 *
 * @route POST /register
 * @middleware userRegisterValidator - Validates registration payload
 * @middleware validate - Handles validation errors
 * @returns {ApiResponse} 201 - User registered and verification email sent
 * @throws {ApiError} 400 - Validation error or missing fields
 * @throws {ApiError} 409 - User already exists
 */
router.post("/register", userRegisterValidator(), validate, registerUser);

/**
 * Log in an existing user.
 *
 * @route POST /login
 * @middleware userLoginValidator - Validates login payload
 * @middleware validate - Handles validation errors
 * @returns {ApiResponse} 200 - User authenticated and tokens issued
 * @throws {ApiError} 400 - Missing credentials
 * @throws {ApiError} 401 - Invalid credentials
 * @throws {ApiError} 404 - User not found
 */
router.post("/login", userLoginValidator(), validate, loginUser);

/**
 * Log out the currently authenticated user.
 *
 * @route POST /logout
 * @middleware verifyJWT - Ensures the user is authenticated
 * @returns {ApiResponse} 200 - User logged out successfully
 * @throws {ApiError} 401 - Unauthorized request
 */
router.post("/logout", verifyJWT, logoutUser);

/**
 * Get the currently authenticated user's profile.
 *
 * @route GET /me
 * @middleware verifyJWT - Ensures the user is authenticated
 * @returns {ApiResponse} 200 - Current user data
 * @throws {ApiError} 401 - Unauthorized request
 */
router.get("/me", verifyJWT, getCurrentUser);

/**
 * Verify a user's email address.
 *
 * @route GET /verify-email/:verificationToken
 * @param {string} verificationToken - Email verification token
 * @returns {ApiResponse} 200 - Email verified successfully
 * @throws {ApiError} 400 - Token missing, invalid, or expired
 */
router.get("/verify-email/:verificationToken", verifyUserEmail);

/**
 * Resend email verification link
 *
 * @route POST /api/v1/auth/resend-email-verification
 * @access Private
 *
 * @middleware verifyJWT - Ensures the user is authenticated
 * @controller resendEmailVerification - Generates and sends a new verification email
 */
router.post("/resend-email-verification", verifyJWT, resendEmailVerification);


export default router;
