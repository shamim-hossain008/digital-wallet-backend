"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewAccessTokenWithRefreshToken = exports.createUserTokens = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const env_1 = require("../config/env");
const appError_1 = __importDefault(require("../errorHelpers/appError"));
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const jwt_1 = require("./jwt");
const createUserTokens = (user) => {
    const payload = {
        userId: String(user._id),
        email: user.email,
        role: user.role,
    };
    // Access Token
    const accessToken = (0, jwt_1.generateToken)(payload, env_1.envVars.JWT_ACCESS_SECRET, env_1.envVars.JWT_ACCESS_EXPIRES);
    // Refresh Token (⚠ uses REFRESH secret)
    const refreshToken = (0, jwt_1.generateToken)(payload, env_1.envVars.JWT_REFRESH_SECRET, env_1.envVars.JWT_REFRESH_EXPIRES);
    return {
        accessToken,
        refreshToken,
    };
};
exports.createUserTokens = createUserTokens;
/**
 * Verify refresh token and generate a NEW access token
 */
const createNewAccessTokenWithRefreshToken = async (refreshToken) => {
    const decoded = (0, jwt_1.verifyToken)(refreshToken, env_1.envVars.JWT_REFRESH_SECRET);
    const existingUser = await user_model_1.UserModel.findOne({
        email: decoded.email,
    });
    if (!existingUser) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "User does not exist");
    }
    if (existingUser.isActive === user_interface_1.IsActive.BLOCKED ||
        existingUser.isActive === user_interface_1.IsActive.INACTIVE) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, `User is ${existingUser.isActive}`);
    }
    if (existingUser.isDeleted) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is deleted");
    }
    const payload = {
        userId: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
    };
    // New Access Token (⚠ correct expiry)
    const newAccessToken = (0, jwt_1.generateToken)(payload, env_1.envVars.JWT_ACCESS_SECRET, env_1.envVars.JWT_ACCESS_EXPIRES);
    return newAccessToken;
};
exports.createNewAccessTokenWithRefreshToken = createNewAccessTokenWithRefreshToken;
//# sourceMappingURL=userTokens.js.map