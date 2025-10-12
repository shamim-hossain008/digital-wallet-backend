"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = require("mongoose");
const env_1 = require("../../config/env");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const jwt_1 = require("../../utils/jwt");
const user_model_1 = require("../user/user.model");
const wallet_model_1 = require("../wallet/wallet.model");
const wallet_service_1 = require("../wallet/wallet.service");
const register = async (payload) => {
    console.log("Incoming role:", payload.role);
    const isUserExist = await user_model_1.UserModel.findOne({ email: payload.email });
    if (isUserExist) {
        throw new appError_1.default(http_status_codes_1.default.CONFLICT, "Email already registered");
    }
    const saltRounds = parseInt(env_1.envVars.BCRYPT_SALT_ROUND);
    const hashedPassword = await bcryptjs_1.default.hash(payload.password, saltRounds);
    const user = await user_model_1.UserModel.create({ ...payload, password: hashedPassword });
    //   todo
    //  created wallet with 50tk bonus balance
    if (user.role === "USER" || user.role === "AGENT") {
        await wallet_service_1.WalletService.createWallet(user._id.toString());
    }
    return user;
};
const login = async (email, password) => {
    const user = await user_model_1.UserModel.findOne({ email });
    if (!user)
        throw new Error("User not found");
    if (!user.password) {
        throw new appError_1.default(http_status_codes_1.default.INTERNAL_SERVER_ERROR, "User password is missing");
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error("Invalid credentials");
    const payload = { id: user._id.toString(), role: user.role };
    const accessToken = (0, jwt_1.generateToken)(payload, env_1.envVars.JWT_ACCESS_SECRET, env_1.envVars.JWT_ACCESS_EXPIRES);
    const refreshToken = (0, jwt_1.generateToken)(payload, env_1.envVars.JWT_REFRESH_SECRET, env_1.envVars.JWT_REFRESH_EXPIRES);
    return { accessToken, refreshToken, user };
};
const approveAgent = async (agentId) => {
    const agent = await user_model_1.UserModel.findByIdAndUpdate(agentId, { isApproved: true, isSuspended: false }, { new: true });
    if (agent) {
        await wallet_model_1.WalletModel.findOneAndUpdate({ user: new mongoose_1.Types.ObjectId(agentId) }, { isBlocked: false }, { new: true });
    }
    return agent;
};
const suspendAgent = async (agentId) => {
    const agent = await user_model_1.UserModel.findById(agentId);
    if (!agent) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
    }
    if (!agent.isApproved) {
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "Agent must be approved before suspension");
    }
    const updateAgent = await user_model_1.UserModel.findByIdAndUpdate(agentId, { isSuspended: true }, { new: true });
    if (updateAgent) {
        await wallet_model_1.WalletModel.findOneAndUpdate({ user: new mongoose_1.Types.ObjectId(agentId) }, { isBlocked: true }, { new: true });
    }
    return updateAgent;
};
exports.AuthService = {
    register,
    login,
    approveAgent,
    suspendAgent,
};
//# sourceMappingURL=auth.service.js.map