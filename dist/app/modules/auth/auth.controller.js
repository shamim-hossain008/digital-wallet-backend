"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const catchAsync_1 = require("../../utils/catchAsync");
const logger_1 = require("../../utils/logger");
const sendResponse_1 = require("../../utils/sendResponse");
const auth_service_1 = require("./auth.service");
const register = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const user = await auth_service_1.AuthService.register(req.body);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "User registered successfully",
        data: user,
    });
});
const login = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { email, password } = req.body;
    console.log("Login request body:", req.body);
    const result = await auth_service_1.AuthService.login(email, password);
    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
    });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Login successfully",
        data: result,
    });
});
const approveAgent = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const agentId = req.params.id;
    if (!agentId)
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent ID is required");
    const agent = await auth_service_1.AuthService.approveAgent(agentId);
    (0, logger_1.logAction)("Agent approved", req.user.userId, { target: agentId });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Agent approved",
        data: agent,
    });
});
const suspendAgent = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const agentId = req.params.id;
    if (!agentId)
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent ID is required");
    const agent = await auth_service_1.AuthService.suspendAgent(agentId);
    (0, logger_1.logAction)("Agent suspended", req.user.userId, { target: agentId });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Agent suspended",
        data: agent,
    });
});
exports.AuthController = {
    register,
    login,
    approveAgent,
    suspendAgent,
};
//# sourceMappingURL=auth.controller.js.map