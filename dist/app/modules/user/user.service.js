"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const env_1 = require("../../config/env");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const auth_interface_1 = require("../auth/auth.interface");
const user_model_1 = require("./user.model");
// get All users
const getAllUsers = async () => {
    return user_model_1.UserModel.find({ isDeleted: false });
};
// get single user
const getSingleUser = async (id) => {
    const user = await user_model_1.UserModel.findById(id).select("-password");
    return {
        data: user,
    };
};
//  update user
const updatedUser = async (userId, payload, decodedToken) => {
    const ifUserExist = await user_model_1.UserModel.findById(userId);
    if (!ifUserExist) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (payload.email) {
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "Email cannot be Updated");
    }
    if (payload.role === auth_interface_1.Role.USER || decodedToken.role === auth_interface_1.Role.AGENT)
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
    if (payload.role === auth_interface_1.Role.AGENT && decodedToken.role === auth_interface_1.Role.ADMIN) {
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
    }
    if (payload.isActive || payload.isDeleted || payload.isVerified) {
        if (decodedToken.role === auth_interface_1.Role.USER || decodedToken.role === auth_interface_1.Role.AGENT) {
            throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "You are not authorized");
        }
    }
    //  pass hashing
    if (payload.password) {
        payload.password = await bcryptjs_1.default.hash(payload.password, env_1.envVars.BCRYPT_SALT_ROUND);
    }
    const newUpdateUser = await user_model_1.UserModel.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });
    return newUpdateUser;
};
const getMe = async (userId) => {
    const user = await user_model_1.UserModel.findById(userId).select("-password");
    return {
        data: user,
    };
};
// Delete user
const deleteUser = async (id) => {
    return user_model_1.UserModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};
exports.UserService = {
    getAllUsers,
    getSingleUser,
    updatedUser,
    deleteUser,
    getMe,
};
//# sourceMappingURL=user.service.js.map