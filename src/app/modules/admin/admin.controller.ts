import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { Parser } from "json2csv";
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

const getCommissionPayouts = catchAsync(async (req: Request, res: Response) => {
  const { fromDate, toDate, status } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const payouts = await AdminService.getCommissionPayouts(
    fromDate as string,
    toDate as string,
    status as string,
    page,
    limit
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Commission payout summary retrieved",
    data: payouts,
  });
});

const exportCommissionCSV = catchAsync(async (req: Request, res: Response) => {
  const { fromDate, toDate, status } = req.query as {
    fromDate?: string;
    toDate?: string;
    status?: string;
  };

  const payouts = await AdminService.getCommissionPayouts(
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

export const AdminController = {
  getTransactionSummary,
  getCommissionPayouts,
  exportCommissionCSV,
};
