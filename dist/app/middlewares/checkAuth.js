"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAuth = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const env_1 = require("../config/env");
const appError_1 = __importDefault(require("../errorHelpers/appError"));
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const jwt_1 = require("../utils/jwt");
const checkAuth = (...authRoles) => async (req, res, next) => {
    //for testing
    console.log("====================================");
    console.log("🔐 CHECK AUTH MIDDLEWARE TRIGGERED");
    console.log("URL:", req.method, req.originalUrl);
    console.log("Headers:", req.headers);
    console.log("Authorization Header:", req.headers.authorization);
    try {
        const authHeader = req.headers.authorization;
        // Token Logs
        if (!authHeader) {
            console.log("❌ No Authorization header found");
            throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "No token received");
        }
        const accessToken = authHeader?.split(" ")[1]; // ✅ Extract token
        console.log("Access Token:", accessToken);
        if (!accessToken) {
            console.log("❌ Authorization header exists but token missing");
            throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "No token received");
        }
        const verifiedToken = (0, jwt_1.verifyToken)(accessToken, env_1.envVars.JWT_ACCESS_SECRET);
        console.log("✅ Token Decoded:", verifiedToken);
        // const isUserExist = await UserModel.findOne({
        //   email: verifiedToken.email,
        // });
        const isUserExist = await user_model_1.UserModel.findById(verifiedToken.id);
        // console.log("user found", isUserExist);
        // const isUserExist = await UserModel.findById(verifiedToken.id);
        if (!isUserExist) {
            throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "User dose not exist");
        }
        if (!isUserExist.isVerified) {
            throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is not verified");
        }
        if (isUserExist.isActive === user_interface_1.IsActive.BLOCKED ||
            isUserExist.isActive === user_interface_1.IsActive.INACTIVE) {
            throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, `User is ${isUserExist.isActive}`);
        }
        if (isUserExist.isDeleted) {
            throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is deleted");
        }
        {
            if (isUserExist.role === "AGENT" && isUserExist.isSuspended) {
                throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "Agent is suspended");
            }
        }
        if (!authRoles.includes(verifiedToken.role)) {
            throw new appError_1.default(403, "You are not permitted to view this route!!!!!!!");
        }
        req.user = verifiedToken;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.checkAuth = checkAuth;
//# sourceMappingURL=checkAuth.js.map