import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { Parser } from "json2csv";
import { IAuthJwtPayload } from "../../types/auth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

const getTransactionSummary = catchAsync(
  async (req: Request, res: Response) => {
    const summary = await AdminService.getTransactionSummary();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Transaction summary retrieved",
      data: summary,
    });
  }
);

// commission Summary

const getCommissionSummary = catchAsync(async (req: Request, res: Response) => {
  const { fromDate, toDate, status, page, limit } = req.query;

  const payouts = await AdminService.getCommissionSummary(
    fromDate as string,
    toDate as string,
    status as string,
    Number(page) || 1,
    Number(limit) || 10
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Commission  summary retrieved",
    data: payouts,
  });
});

// CSV Export

const exportCommissionCSV = catchAsync(async (req: Request, res: Response) => {
  const { fromDate, toDate, status } = req.query as {
    fromDate?: string;
    toDate?: string;
    status?: string;
  };

  const payouts = await AdminService.getCommissionSummary(
    fromDate,
    toDate,
    status,
    1,
    10000
  );

  const parser = new Parser();
  const csv = parser.parse(payouts.payouts);

  res.header("Content-Type", "text/csv");
  res.attachment("commission_payouts.csv");
  res.send(csv);
});

// Pay commission
const payCommission = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req.user as IAuthJwtPayload).sub;
  const { agentId, amount, fromDate, toDate } = req.body;

  const payout = await AdminService.createCommissionPayout({
    agentId,
    amount,
    fromDate,
    toDate,
    adminId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Commission payout created",
    data: payout,
  });
});

const getCommissionHistory = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  const history = await AdminService.getCommissionHistory(
    Number(page),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Commission history retrieved",
    data: history,
  });
});

export const AdminController = {
  getTransactionSummary,
  getCommissionSummary,
  exportCommissionCSV,
  payCommission,
  getCommissionHistory,
};
