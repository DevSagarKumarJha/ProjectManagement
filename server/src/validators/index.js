import { body } from "express-validator";

/**
 * Validation rules for user registration requests.
 *
 * Validates:
 * - Email format and presence
 * - Username format and length
 * - Password strength
 * - Optional full name
 *
 * @function userRegisterValidator
 * @returns {import("express-validator").ValidationChain[]} Array of validation chains
 */
export const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email"),

        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be lowercase")
            .isLength({ min: 3 })
            .withMessage("Username must be at least 3 characters long"),

        body("password")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long")
            .matches(
                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            )
            .withMessage(
                "Password must contain at least one letter, one number, and one special character",
            ),

        body("fullname").optional().trim(),
    ];
};

/**
 * Validation rules for user login requests.
 *
 * Validates:
 * - Optional email format
 * - Required password
 *
 * @function userLoginValidator
 * @returns {import("express-validator").ValidationChain[]} Array of validation chains
 */
export const userLoginValidator = () => {
    return [
        body("email").optional().isEmail().withMessage("Email is invalid"),
        body("password").notEmpty().withMessage("Password is required"),
    ];
};

/**
 * Validation rules for changing the current user's password
 *
 * @function userChangePasswordValidator
 * @returns {import("express-validator").ValidationChain[]}
 *
 * @description
 * Ensures the old password is provided and the new password
 * meets minimum security requirements.
 */
export const userChangePasswordValidator = () => {
    return [
        body("oldPassword")
            .notEmpty()
            .withMessage("Current password is required"),

        body("newPassword")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long")
            .matches(
                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            )
            .withMessage(
                "Password must contain at least one letter, one number, and one special character",
            ),
    ];
};

/**
 * Validation rules for forgot password request
 *
 * @function userForgotPasswordValidator
 * @returns {import("express-validator").ValidationChain[]}
 *
 * @description
 * Validates that a proper email address is provided
 * for initiating a password reset request.
 */
export const userForgotPasswordValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Invalid email"),
    ];
};

/**
 * Validation rules for resetting forgotten password
 *
 * @function userResetForgotPasswordValidator
 * @returns {import("express-validator").ValidationChain[]}
 *
 * @description
 * Ensures the new password meets defined security constraints
 * when resetting a forgotten password.
 */
export const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword")
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long")
            .matches(
                /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
            )
            .withMessage(
                "Password must contain at least one letter, one number, and one special character",
            ),
    ];
};
