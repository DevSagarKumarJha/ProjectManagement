import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * User schema definition.
 *
 * Represents application users and handles authentication,
 * authorization, and account verification state.
 */
const userSchema = new Schema(
    {
        /**
         * User avatar information.
         */
        avatar: {
            type: {
                url: String,
                localPath: String,
            },
            default: {
                url: "https://placehold.co/200x200",
                localPath: "",
            },
        },

        /**
         * Unique username used for login and identification.
         */
        username: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        /**
         * Unique email address of the user.
         */
        email: {
            type: String,
            unique: true,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        /**
         * Full name of the user.
         */
        fullname: {
            type: String,
            trim: true,
        },

        /**
         * Hashed user password.
         */
        password: {
            type: String,
            unique: true,
            required: [true, "!Password is required."],
        },

        /**
         * Indicates whether the user's email has been verified.
         */
        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        /**
         * Stored refresh token for session management.
         */
        refreshToken: {
            type: String,
        },

        /**
         * Hashed forgot-password token.
         */
        forgotPasswordToken: {
            type: String,
        },

        /**
         * Expiration time for forgot-password token.
         */
        forgotPasswordExpiry: {
            type: Date,
        },

        /**
         * Hashed email verification token.
         */
        emailVerificationToken: {
            type: String,
        },

        /**
         * Expiration time for email verification token.
         */
        emailVerificationExpiry: {
            type: Date,
        },
    },
    {
        timestamps: true,
    },
);

/**
 * Hashes the user's password before saving if it was modified.
 *
 * @function
 * @name preSavePasswordHash
 * @memberof UserSchema
 */
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

/**
 * Compares a plain text password with the stored hashed password.
 *
 * @async
 * @method isPasswordCorrect
 * @memberof User
 * @param {string} password - Plain text password to verify
 * @returns {Promise<boolean>} Whether the password matches
 */
userSchema.methods.isPasswordCorrect = async function (password) {
    return bcrypt.compare(password, this.password);
};

/**
 * Generates a JWT access token for the user.
 *
 * @method generateAccessToken
 * @memberof User
 * @returns {string} Signed JWT access token
 */
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY },
    );
};

/**
 * Generates a JWT refresh token for the user.
 *
 * @method generateRefreshToken
 * @memberof User
 * @returns {string} Signed JWT refresh token
 */
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );
};

/**
 * Generates a temporary token for email verification or password reset.
 *
 * - Returns an unhashed token (to be sent to the user)
 * - Stores the hashed version in the database
 *
 * @method generateTemporaryToken
 * @memberof User
 * @returns {{
 *   unHashedToken: string,
 *   hashedToken: string,
 *   tokenExpiry: number
 * }} Temporary token data
 */
userSchema.methods.generateTemporaryToken = function () {
    const unHashedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(unHashedToken)
        .digest("hex");

    const tokenExpiry = Date.now() + 20 * 60 * 1000;

    return { unHashedToken, hashedToken, tokenExpiry };
};

/**
 * User model.
 *
 * @type {import("mongoose").Model}
 */
export const User = mongoose.model("User", userSchema);
