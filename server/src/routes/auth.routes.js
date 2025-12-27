import { Router } from "express";
import {
    changeCurrentPassword,
    forgotPasswordRequest,
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    resendEmailVerification,
    resetForgotPassword,
    verifyUserEmail,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
    userChangePasswordValidator,
    userForgotPasswordValidator,
    userLoginValidator,
    userRegisterValidator,
    userResetForgotPasswordValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

/**
 * Authentication & user-related routes
 *
 * Mounted at: /api/v1/auth
 *
 * @module routes/auth
 */
const router = Router();

/* ========================================================================== */
/*                               PUBLIC ROUTES                                */
/* ========================================================================== */

/**
 * Register a new user
 *
 * @route POST /register
 * @access Public
 */
router.post("/register", userRegisterValidator(), validate, registerUser);

/**
 * Login user and issue tokens
 *
 * @route POST /login
 * @access Public
 */
router.post("/login", userLoginValidator(), validate, loginUser);

/**
 * Refresh access token using refresh token
 *
 * @route POST /refresh-token
 * @access Public
 */
router.post("/refresh-token", refreshAccessToken);

/**
 * Verify email address
 *
 * @route GET /verify-email/:verificationToken
 * @access Public
 */
router.get("/verify-email/:verificationToken", verifyUserEmail);

/**
 * Request password reset email
 *
 * @route POST /forgot-password
 * @access Public
 */
router.post(
    "/forgot-password",
    userForgotPasswordValidator(),
    validate,
    forgotPasswordRequest,
);

/**
 * Reset password using reset token
 *
 * @route POST /reset-password/:resetToken
 * @access Public
 */
router.post(
    "/reset-password/:resetToken",
    userResetForgotPasswordValidator(),
    validate,
    resetForgotPassword,
);

/* ========================================================================== */
/*                              PROTECTED ROUTES                               */
/* ========================================================================== */

/**
 * Logout current user
 *
 * @route POST /logout
 * @access Private
 */
router.post("/logout", verifyJWT, logoutUser);

/**
 * Get currently authenticated user
 *
 * @route GET /me
 * @access Private
 */
router.get("/me", verifyJWT, getCurrentUser);

/**
 * Resend email verification link
 *
 * @route POST /resend-email-verification
 * @access Private
 */
router.post("/resend-email-verification", verifyJWT, resendEmailVerification);

/**
 * Change current user's password
 *
 * @route POST /change-password
 * @access Private
 */
router.post(
    "/change-password",
    verifyJWT,
    userChangePasswordValidator(),
    validate,
    changeCurrentPassword,
);

export default router;
