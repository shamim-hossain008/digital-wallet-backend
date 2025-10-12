"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const json2csv_1 = require("json2csv");
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const admin_service_1 = require("./admin.service");
const getTransactionSummary = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const summary = await admin_service_1.AdminService.getTransactionSummary();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Transaction summary retrieved",
        data: summary,
    });
});
const getCommissionPayouts = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { fromDate, toDate, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const payouts = await admin_service_1.AdminService.getCommissionPayouts(fromDate, toDate, status, page, limit);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Commission payout summary retrieved",
        data: payouts,
    });
});
const exportCommissionCSV = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { fromDate, toDate, status } = req.query;
    const payouts = await admin_service_1.AdminService.getCommissionPayouts(fromDate, toDate, status, 1, 10000);
    const parser = new json2csv_1.Parser();
    const csv = parser.parse(payouts.payouts);
    res.header("Content-Type", "text/csv");
    res.attachment("commission_payouts.csv");
    res.send(csv);
});
exports.AdminController = {
    getTransactionSummary,
    getCommissionPayouts,
    exportCommissionCSV,
};
//# sourceMappingURL=admin.controller.js.map