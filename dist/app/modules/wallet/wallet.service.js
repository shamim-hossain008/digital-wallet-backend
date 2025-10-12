"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const logger_1 = require("../../utils/logger");
const wallet_model_1 = require("./wallet.model");
const mongoose_1 = require("mongoose");
const createWallet = async (userId) => {
    const existing = await wallet_model_1.WalletModel.findOne({ user: userId });
    if (existing)
        throw new appError_1.default(http_status_codes_1.default.CONFLICT, "Wallet already exists");
    const wallet = await wallet_model_1.WalletModel.create({ user: userId });
    (0, logger_1.logAction)("Wallet created", userId, { WalletId: wallet._id });
    return wallet;
};
const getWalletByUser = async (userId) => {
    return wallet_model_1.WalletModel.findOne({ user: userId });
};
const blockWallet = async (adminId, userId) => {
    const wallet = await wallet_model_1.WalletModel.findOneAndUpdate({ user: new mongoose_1.Types.ObjectId(userId) }, { isBlocked: true }, { new: true });
    if (!wallet) {
        throw new appError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    if (wallet) {
        (0, logger_1.logAction)("Wallet blocked", adminId, { target: userId });
    }
    return wallet;
};
const unblockWallet = async (adminId, userId) => {
    const wallet = await wallet_model_1.WalletModel.findOneAndUpdate({ user: userId }, { isBlocked: false }, { new: true });
    if (wallet) {
        (0, logger_1.logAction)("Wallet unblocked", adminId, { target: userId });
    }
    return wallet;
};
const getAllWallets = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const wallets = await wallet_model_1.WalletModel.find()
        .skip(skip)
        .limit(limit)
        .populate("user", "email role");
    const total = await wallet_model_1.WalletModel.countDocuments();
    return { total, page, limit, data: wallets };
};
exports.WalletService = {
    createWallet,
    getWalletByUser,
    blockWallet,
    unblockWallet,
    getAllWallets,
};
//# sourceMappingURL=wallet.service.js.map