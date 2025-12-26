import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";
import crypto from "crypto";

/**
 * Generates and persists access and refresh tokens for a user.
 *
 * - Creates new JWT access and refresh tokens
 * - Stores the refresh token in the user document
 *
 * @async
 * @function generateAccessAndRefreshToken
 * @param {import("mongoose").Types.ObjectId | string} userId - User document ID
 * @returns {Promise<{ accessToken: string, refreshToken: string }>} Generated tokens
 * @throws {ApiError} 500 - If token generation or persistence fails
 */

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access token",
        );
    }
};

/**
 * Registers a new user and sends an email verification link.
 *
 * - Creates a new user account
 * - Generates an email verification token
 * - Sends a verification email to the user
 *
 * @async
 * @function registerUser
 * @param {import("express").Request} req - Express request object containing user registration data
 * @param {import("express").Response} res - Express response object
 * @throws {ApiError} 400 - If required fields are missing
 * @throws {ApiError} 409 - If a user with the same email or username already exists
 * @throws {ApiError} 500 - If user creation or email sending fails
 * @returns {Promise<void>} Sends a JSON response with the created user data
 */

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, fullname, password } = req.body;
    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });

    if (existingUser)
        throw new ApiError(
            409,
            "User with email or username already exists",
            [],
        );

    const user = await User.create({
        email,
        password,
        username,
        fullname,
        isEmailVerified: false,
    });

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
        ),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if (!createdUser)
        throw new ApiError(
            500,
            "Something went wrong while registering a user",
        );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                { user: createdUser },
                "User registered successfully And verification email has been sent on your email",
            ),
        );
});

/**
 * Authenticates a user and issues access and refresh tokens.
 *
 * - Validates user credentials
 * - Generates new access and refresh tokens
 * - Sets tokens in HTTP-only cookies
 *
 * @async
 * @function loginUser
 * @param {import("express").Request} req - Express request object containing login credentials
 * @param {import("express").Response} res - Express response object
 * @throws {ApiError} 400 - If required credentials are missing
 * @throws {ApiError} 401 - If credentials are invalid
 * @throws {ApiError} 404 - If the user does not exist
 * @returns {Promise<void>} Sends a JSON response confirming successful login
 */

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email) throw new ApiError(400, "Username or email is required");
    if (!password) throw new ApiError(400, "password is required");

    const user = await User.findOne({ email });

    if (!user) throw new ApiError(404, "User doesn't exists");

    const isMatch = await user.isPasswordCorrect(password);

    if (!isMatch) throw new ApiError(401, "!Invalid username or password");

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
        user._id,
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully",
            ),
        );
});

/**
 * Logs out the currently authenticated user.
 *
 * - Removes the stored refresh token from the database
 * - Clears access and refresh token cookies from the client
 *
 * @async
 * @function logoutUser
 * @param {import("express").Request} req - Express request object containing the authenticated user (`req.user`)
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>} Sends a JSON response confirming successful logout
 */

const logoutUser = asyncHandler(async (req, res) => {
    console.log(req.user._id);

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        { new: true },
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

/**
 * Returns the currently authenticated user's data.
 *
 * @async
 * @function getCurrentUser
 * @param {import("express").Request} req - Express request object containing the authenticated user (`req.user`)
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with the current user data
 */

const getCurrentUser = asyncHandler(async (req, res) => {
    res.status(200).json(
        new ApiResponse(
            200,
            { user: req.user },
            "Current user fetched successfully",
        ),
    );
});

/**
 * Verifies a user's email address using a verification token.
 *
 * - Validates the email verification token
 * - Marks the user's email as verified
 * - Clears email verification token fields
 *
 * @async
 * @function verifyUserEmail
 * @param {import("express").Request} req - Express request object containing the verification token in params
 * @param {import("express").Response} res - Express response object
 * @throws {ApiError} 400 - If the token is missing, invalid, or expired
 * @returns {Promise<void>} Sends a JSON response confirming email verification
 */

const verifyUserEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken)
        throw new ApiError(400, "Email verification token is missing");

    const hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() },
    });

    if (!user) throw new ApiError(400, "Token is invalid or expired");

    ((user.emailVerificationToken = undefined),
        (user.emailVerificationExpiry = undefined));
    user.isEmailVerified = true;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { isEmailVerified: true },
                "Email is verified",
            ),
        );
});

/**
 * Resends email verification link to an unverified user.
 *
 * - Fetches the authenticated user from the database
 * - Prevents resending if the email is already verified
 * - Generates a new temporary verification token
 * - Stores the hashed token and expiry on the user document
 * - Sends a verification email containing the raw token
 *
 * @async
 * @function resendEmailVerification
 * @param {import("express").Request} req - Express request object (expects authenticated user in req.user)
 * @param {import("express").Response} res - Express response object
 * @throws {ApiError} 404 - If user does not exist
 * @throws {ApiError} 409 - If email is already verified
 * @returns {Promise<void>} JSON response confirming email dispatch
 */
const resendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) throw new ApiError(404, "User not found");

    if (user.isEmailVerified)
        throw new ApiError(409, "Email is already verified");

    const { unHashedToken, hashedToken, tokenExpiry } =
        user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unHashedToken}`,
        ),
    });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Mail has been sent to your email id"));
});
// const getCurrentUser = asyncHandler(async (req, res)=>{

// })

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    verifyUserEmail,
    resendEmailVerification,
};
