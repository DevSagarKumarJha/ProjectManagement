import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

/**
 * Generates and persists access & refresh tokens for a user
 *
 * @async
 * @function generateAccessAndRefreshToken
 * @param {import("mongoose").Types.ObjectId | string} userId - User document ID
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
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
 * Register a new user
 *
 * @async
 * @function registerUser
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @throws {ApiError} 400 - If required fields are missing
 * @throws {ApiError} 409 - If user with email or username already exists
 * @returns {Promise<void>} JSON response with created user data
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
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
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

const login = asyncHandler(async (req, res) => {
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

    const options ={
        httpOnly: true,
        secure: true
    }

    res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200,{user:loggedInUser, accessToken, refreshToken}, "User logged in successfully" ));
});

export { registerUser, login };
