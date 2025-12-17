import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/appError";
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

  const userId = (req.user as JwtPayload)?.userId;
  console.log("userid:", userId);

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorize");
  }
  const wallet = await TransactionService.deposit(userId, amount);

  console.log(wallet);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Deposit successful",
    data: wallet,
  });
});

const withdraw = catchAsync(async (req: Request, res: Response) => {
  const { amount } = withdrawSchema.parse(req.body);

  const userId = (req.user as JwtPayload).userId;

  const wallet = await TransactionService.withdraw(userId, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Withdraw successful",
    data: wallet,
  });
});

const transfer = catchAsync(async (req: Request, res: Response) => {
  const { receiverId, amount } = transferSchema.parse(req.body);

  const senderId = (req.user as JwtPayload).userId;

  const result = await TransactionService.transfer(
    senderId,
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
  const userId = (req.user as JwtPayload).userId;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const type = req.query.type as string | undefined;
  const range = req.query.range ? Number(req.query.range) : undefined;

  const search = req.query.search as string | undefined;
  const sort = req.query.sort as string | undefined;

  const result = await TransactionService.getMyTransactions(
    userId,
    page,
    limit,
    type,
    range,
    search,
    sort
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Transaction  history retrieved",
    data: result,
  });
});

const cashIn = catchAsync(async (req: Request, res: Response) => {
  const { receiverId, amount } = transferSchema.parse(req.body);
  const agentId = (req.user as JwtPayload).userId;
  const wallet = await TransactionService.cashIn(agentId, receiverId, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cash-in successful",
    data: wallet,
  });
});

const cashOut = catchAsync(async (req: Request, res: Response) => {
  const { receiverId, amount } = transferSchema.parse(req.body);
  const agentId = (req.user as JwtPayload).userId;
  const wallet = await TransactionService.cashOut(agentId, receiverId, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cash-out successful",
    data: wallet,
  });
});

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const result = await TransactionService.getAllTransactions(page, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All transactions retrieved",
    data: result,
  });
});

export const TransactionController = {
  deposit,
  withdraw,
  transfer,
  getMyTransactions,
  cashIn,
  cashOut,
  getAllTransactions,
};
