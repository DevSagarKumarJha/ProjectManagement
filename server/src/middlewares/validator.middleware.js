import { validationResult } from "express-validator";
import { ApiError } from "../utils/api-error.js";

/**
 * Express middleware to validate request data using express-validator
 * @function validate
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @param {import("express").NextFunction} next - Express next middleware
 * @throws {ApiError} 422 - If validation fails
 * @returns {void}
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) return next();

  const extractedErrors = errors.array().map((err) => ({
    [err.path]: err.msg,
  }));

  throw new ApiError(
    422,
    "Received data is not valid",
    extractedErrors
  );
};
