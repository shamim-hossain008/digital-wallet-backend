"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const mongoose_1 = require("mongoose");
const appError_1 = __importDefault(require("../../errorHelpers/appError"));
const logger_1 = require("../../utils/logger");
const wallet_model_1 = require("../wallet/wallet.model");
const transaction_interface_1 = require("./transaction.interface");
const transaction_model_1 = require("./transaction.model");
const deposit = async (userId, amount) => {
    const wallet = await wallet_model_1.WalletModel.findOne({ user: userId });
    if (!wallet || wallet.isBlocked)
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "Wallet not accessible");
    wallet.balance = Number(wallet.balance) + amount;
    await wallet.save();
    await transaction_model_1.TransactionModel.create({
        receiver: userId,
        amount,
        type: transaction_interface_1.TransactionType.DEPOSIT,
    });
    return wallet;
};
const withdraw = async (userId, amount) => {
    const wallet = await wallet_model_1.WalletModel.findOne({
        user: new mongoose_1.Types.ObjectId(userId),
    });
    if (!wallet || wallet.isBlocked)
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "Wallet not accessible");
    if (Number(wallet.balance) < amount)
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance");
    wallet.balance = Number(wallet.balance) - amount;
    await wallet.save();
    await transaction_model_1.TransactionModel.create({
        sender: userId,
        amount,
        type: transaction_interface_1.TransactionType.WITHDRAW,
    });
    return wallet;
};
const transfer = async (senderId, receiverId, amount) => {
    const senderWallet = await wallet_model_1.WalletModel.findOne({
        user: new mongoose_1.Types.ObjectId(senderId),
    });
    const receiverWallet = await wallet_model_1.WalletModel.findOne({
        user: new mongoose_1.Types.ObjectId(receiverId),
    });
    const fee = 5;
    const total = amount + fee;
    if (!senderWallet || senderWallet.isBlocked)
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "Sender wallet blocked");
    if (!receiverWallet || receiverWallet.isBlocked)
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "Receiver wallet blocked");
    // if (Number(senderWallet.balance) < amount)
    //   throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");
    if (Number(senderWallet.balance) < total) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance including fee");
    }
    senderWallet.balance = Number(senderWallet.balance) - total;
    receiverWallet.balance = Number(receiverWallet.balance) + amount;
    await Promise.all([
        senderWallet.save(),
        receiverWallet.save(),
        transaction_model_1.TransactionModel.create({
            sender: senderId,
            receiver: receiverId,
            amount,
            type: transaction_interface_1.TransactionType.TRANSFER,
        }),
    ]);
    // for log
    (0, logger_1.logAction)("Transfer", senderId, { receiver: receiverId, amount, fee });
    return { senderWallet, receiverWallet };
};
const getMyTransactions = async (userId) => {
    if (!userId) {
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "User ID is required");
    }
    const transactions = await transaction_model_1.TransactionModel.find({
        $or: [{ sender: userId }, { receiver: userId }],
    })
        .sort({ Timestamp: -1 })
        .populate("sender", "email role")
        .populate("receiver", "email role");
    return transactions;
};
const cashIn = async (agentId, userId, amount) => {
    const userWallet = await wallet_model_1.WalletModel.findOne({ user: userId });
    if (!userWallet || userWallet.isBlocked)
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "User wallet  blocked");
    // add commission
    const commissionRate = 0.02;
    const commission = amount * commissionRate;
    userWallet.balance = Number(userWallet.balance) + amount;
    await Promise.all([
        userWallet.save(),
        transaction_model_1.TransactionModel.create({
            sender: agentId,
            receiver: userId,
            amount,
            commission,
            type: transaction_interface_1.TransactionType.CASH_IN,
        }),
    ]);
    (0, logger_1.logAction)("Cash-in", agentId, { receiver: userId, amount, commission });
    return userWallet;
};
const cashOut = async (agentId, userId, amount) => {
    const userWallet = await wallet_model_1.WalletModel.findOne({ user: userId });
    if (!userWallet || userWallet.isBlocked)
        throw new appError_1.default(http_status_codes_1.default.FORBIDDEN, "User wallet blocked ");
    if (Number(userWallet.balance) < amount)
        throw new appError_1.default(http_status_codes_1.default.BAD_REQUEST, "Insufficient balance");
    userWallet.balance = Number(userWallet.balance) - amount;
    await Promise.all([
        userWallet.save(),
        transaction_model_1.TransactionModel.create({
            sender: userId,
            receiver: agentId,
            amount,
            type: transaction_interface_1.TransactionType.CASH_OUT,
        }),
    ]);
    return userWallet;
};
const getAllTransactions = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const transactions = await transaction_model_1.TransactionModel.find()
        .sort("-timestamp")
        .skip(skip)
        .limit(limit)
        .populate("sender", "email role")
        .populate("receiver", "email role");
    const total = await transaction_model_1.TransactionModel.countDocuments();
    return { total, page, limit, transactions };
};
exports.TransactionService = {
    deposit,
    withdraw,
    transfer,
    getMyTransactions,
    cashIn,
    cashOut,
    getAllTransactions,
};
//# sourceMappingURL=transaction.service.js.map