"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const transaction_service_1 = require("./transaction.service");
const transaction_validation_1 = require("./transaction.validation");
const deposit = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { amount } = transaction_validation_1.depositSchema.parse(req.body);
    const wallet = await transaction_service_1.TransactionService.deposit(req.user._id.toString(), amount);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Deposit successful",
        data: wallet,
    });
});
const withdraw = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { amount } = transaction_validation_1.withdrawSchema.parse(req.body);
    const userId = req.user.id;
    const wallet = await transaction_service_1.TransactionService.withdraw(userId, amount);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Withdraw successful",
        data: wallet,
    });
});
const transfer = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { receiverId, amount } = transaction_validation_1.transferSchema.parse(req.body);
    const senderId = req.user.id;
    const result = await transaction_service_1.TransactionService.transfer(senderId, receiverId, amount);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Transfer successful",
        data: result,
    });
});
const getMyTransactions = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const transactions = await transaction_service_1.TransactionService.getMyTransactions(userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Transaction  history retrieved",
        data: transactions,
    });
});
const cashIn = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { receiverId, amount } = transaction_validation_1.transferSchema.parse(req.body);
    const agentId = req.user.id;
    const wallet = await transaction_service_1.TransactionService.cashIn(agentId, receiverId, amount);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Cash-in successful",
        data: wallet,
    });
});
const cashOut = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { receiverId, amount } = transaction_validation_1.transferSchema.parse(req.body);
    const agentId = req.user.id;
    const wallet = await transaction_service_1.TransactionService.cashOut(agentId, receiverId, amount);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Cash-out successful",
        data: wallet,
    });
});
const getAllTransactions = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await transaction_service_1.TransactionService.getAllTransactions(page, limit);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "All transactions retrieved",
        data: result,
    });
});
exports.TransactionController = {
    deposit,
    withdraw,
    transfer,
    getMyTransactions,
    cashIn,
    cashOut,
    getAllTransactions,
};
//# sourceMappingURL=transaction.controller.js.map