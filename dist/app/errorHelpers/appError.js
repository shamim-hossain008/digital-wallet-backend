"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
class AppError extends Error {
    statusCode;
    constructor(statusCode = http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, message, stack = "") {
        super(message);
        this.statusCode = statusCode;
        if (stack) {
            this.stack = stack;
        }
        else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
exports.default = AppError;
//# sourceMappingURL=appError.js.map