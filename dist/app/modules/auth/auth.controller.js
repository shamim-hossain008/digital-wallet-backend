"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const passport_1 = __importDefault(require("passport"));
const env_1 = require("../../config/env");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const catchAsync_1 = require("../../utils/catchAsync");
const logger_1 = require("../../utils/logger");
const sendResponse_1 = require("../../utils/sendResponse");
const setCookie_1 = require("../../utils/setCookie");
const userTokens_1 = require("../../utils/userTokens");
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
// const login = catchAsync(async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   console.log("Login request body:", req.body);
//   const result = await AuthService.login(email, password);
//   // res.cookie("refreshToken", result.refreshToken, {
//   //   httpOnly: true,
//   //   secure: false,
//   //   sameSite: "lax",
//   // });
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Login successfully",
//     data: result,
//   });
// });
// *****
const credentialsLogin = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    passport_1.default.authenticate("local", async (err, user, info) => {
        if (err) {
            return next(new appError_1.default(401, err));
        }
        if (!user) {
            return next(new appError_1.default(401, info.message || "Unauthorized"));
        }
        const userTokens = await (0, userTokens_1.createUserTokens)({
            _id: user._id,
            role: user.role,
        });
        const rest = user;
        (0, setCookie_1.setAuthCookie)(res, userTokens);
        (0, sendResponse_1.sendResponse)(res, {
            success: true,
            statusCode: http_status_codes_1.default.OK,
            message: "User Logged in Successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest,
            },
        });
    })(req, res, next);
});
// New accessToken
const getNewAccessToken = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "No refresh token received from cookies");
    }
    const tokenInfo = await auth_service_1.AuthService.getNewAccessToken(refreshToken);
    (0, setCookie_1.setAuthCookie)(res, tokenInfo);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "New Access Token Received Successfully",
        data: tokenInfo,
    });
});
const googleCallbackController = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    let redirectTo = req.query.state ? req.query.state : "";
    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1);
    }
    const user = req.user;
    if (!user) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    if (!user._id) {
        // Runtime fallback for TypeScript safety
        throw new appError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "User ID missing");
    }
    const tokenInfo = await (0, userTokens_1.createUserTokens)({
        _id: user._id,
        role: user.role,
    });
    (0, setCookie_1.setAuthCookie)(res, tokenInfo);
    res.redirect(`${env_1.envVars.FRONTEND_URL}/${redirectTo}`);
});
// user logout
const logout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User Logged Out Successfully",
        data: null,
    });
});
// ADMIN – APPROVE AGENT
const approveAgent = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const agentId = req.params.id;
    if (!agentId)
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent ID is required");
    // Safe user id extraction
    const userId = req.user?.id || req.user?._id?.toString();
    if (!userId) {
        throw new appError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid user");
    }
    const agent = await auth_service_1.AuthService.approveAgent(agentId);
    (0, logger_1.logAction)("Agent approved", userId, { target: agentId });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Agent approved",
        data: agent,
    });
});
// ADMIN – SUSPEND AGENT
const suspendAgent = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const agentId = req.params.id;
    if (!agentId)
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent ID is required");
    const userId = req.user?.id || req.user?._id?.toString();
    if (!userId) {
        throw new appError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid user");
    }
    const agent = await auth_service_1.AuthService.suspendAgent(agentId);
    (0, logger_1.logAction)("Agent suspended", userId, { target: agentId });
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Agent suspended",
        data: agent,
    });
});
exports.AuthController = {
    register,
    // login,
    logout,
    approveAgent,
    suspendAgent,
    credentialsLogin,
    getNewAccessToken,
    googleCallbackController,
};
//# sourceMappingURL=auth.controller.js.map