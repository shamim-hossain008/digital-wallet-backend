"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const wallet_service_1 = require("./wallet.service");
const getMyWallet = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user._id?.toString();
    if (!userId) {
        throw new appError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid token payload");
    }
    const wallet = await wallet_service_1.WalletService.getWalletByUser(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Wallet retrieved successfully",
        data: wallet,
    });
});
const blockWallet = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const adminId = req.user._id?.toString();
    const userId = req.user._id?.toString();
    if (!adminId) {
        throw new appError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid token payload");
    }
    const wallet = await wallet_service_1.WalletService.blockWallet(adminId, userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "wallet blocked successFully",
        data: wallet,
    });
});
const unblockWallet = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const adminId = req.user._id?.toString();
    const userId = req.params.userId;
    if (!adminId) {
        throw new appError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid token payload");
    }
    const wallet = await wallet_service_1.WalletService.unblockWallet(adminId, userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Wallet unblocked successfully",
        data: wallet,
    });
});
const getAllWallets = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await wallet_service_1.WalletService.getAllWallets(page, limit);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "All wallets retrieved successfully",
        data: result,
    });
});
exports.WalletController = {
    getMyWallet,
    blockWallet,
    unblockWallet,
    getAllWallets,
};
//# sourceMappingURL=wallet.controller.js.map