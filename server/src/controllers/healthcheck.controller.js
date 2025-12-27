import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

/**
 * Health check endpoint controller.
 *
 * - Used to verify if the server is up and responding
 * - Returns a standard API response with HTTP 200
 * - Wrapped with asyncHandler for centralized error handling
 *
 * @async
 * @function healthCheck
 * @param {import("express").Request} req - Express request object
 * @param {import("express").Response} res - Express response object
 * @returns {Promise<void>} JSON response indicating server health
 */
const healthCheck = asyncHandler(async(req,res)=>{
    res.status(200).json(
        new ApiResponse(200, { message: "Server is running" }),
    );
})

/**
 * 
const healthCheck =async (req, res) => {
    const user = await getUser();
    try {
        res.status(200).json(
            
        );
    } catch (error) {
        next(error)
    }
};
*/


export {healthCheck};