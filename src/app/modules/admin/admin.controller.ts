import { Request, Response } from "express";
import httpStatus from "http-status-codes";
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
  const payouts = await AdminService.getCommissionPayouts();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Commission payout summary retrieved",
    data: payouts,
  });
});

export const AdminController = {
  getTransactionSummary,
  getCommissionPayouts,
};
