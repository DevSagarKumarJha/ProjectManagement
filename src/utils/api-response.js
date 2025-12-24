/**
 * Standard API response wrapper
 *
 * @class ApiResponse
 */
class ApiResponse {
    /**
     * Creates an API response object
     *
     * @param {number} statusCode - HTTP status code (e.g. 200, 201, 400)
     * @param {*} data - Response payload (can be object, array, or null)
     * @param {string} [message="Success"] - Human-readable response message
     */
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}

export { ApiResponse };
