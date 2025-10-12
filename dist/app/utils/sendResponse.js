"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResponse = void 0;
const sendResponse = (res, response) => {
    const { statusCode, success, message, data, meta } = response;
    res.status(statusCode).json({
        statusCode,
        success,
        message,
        meta,
        data,
    });
};
exports.sendResponse = sendResponse;
//# sourceMappingURL=sendResponse.js.map