"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const user_service_1 = require("./user.service");
const getAllUsers = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const users = await user_service_1.UserService.getAllUsers();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Users retrieved successfully",
        data: users,
    });
});
// single user
const getSingleUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "User ID is required");
    }
    const result = await user_service_1.UserService.getSingleUser(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.CREATED,
        message: "User retrieved successfully",
        data: result.data,
    });
});
// updated user
const updatedUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.params.id;
    const verifiedToken = req.user;
    const payload = req.body;
    const user = await user_service_1.UserService.updatedUser(userId, payload, verifiedToken);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User updated successfully",
        data: user,
    });
});
const getMe = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const decodedToken = req.user;
    const result = await user_service_1.UserService.getMe(decodedToken.id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "Your profile retrieved successfully",
        data: result.data,
    });
});
// delete user
const deleteUser = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const id = req.params.id;
    if (!id) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "User ID is required");
    }
    const result = await user_service_1.UserService.deleteUser(id);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: http_status_codes_1.default.OK,
        message: "User deleted successFully",
        data: result,
    });
});
exports.UserController = {
    getAllUsers,
    getSingleUser,
    updatedUser,
    deleteUser,
    getMe,
};
//# sourceMappingURL=user.controller.js.map