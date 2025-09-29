import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { TransactionService } from "./transaction.service";
import {
  depositSchema,
  transferSchema,
  withdrawSchema,
} from "./transaction.validation";

const deposit = catchAsync(async (req: Request, res: Response) => {
  const { amount } = depositSchema.parse(req.body);
  const wallet = await TransactionService.deposit(req.user!.userId, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Deposit successful",
    data: wallet,
  });
});

const withdraw = catchAsync(async (req: Request, res: Response) => {
  const { amount } = withdrawSchema.parse(req.body);
  const wallet = await TransactionService.withdraw(req.user!.userId, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraw successful",
    data: wallet,
  });
});

const transfer = catchAsync(async (req: Request, res: Response) => {
  const { receiverId, amount } = transferSchema.parse(req.body);
  const result = await TransactionService.transfer(
    req.user!.userId,
    receiverId,
    amount
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Transfer successful",
    data: result,
  });
});

const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const transactions = await TransactionService.getMyTransactions(
    req.user!.userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Transaction  history retrieved",
    data: transactions,
  });
});
export const TransactionController = {
  deposit,
  withdraw,
  transfer,
  getMyTransactions,
};
