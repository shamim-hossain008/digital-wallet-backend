import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WalletService } from "./wallet.service";

const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
  }
  const wallet = await WalletService.getWalletByUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wallet retrieved successfully",
    data: wallet,
  });
});

const blockWallet = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user?.userId;
  const userId = req.params.userId;

  if (!adminId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
  }
  const wallet = await WalletService.blockWallet(adminId, userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "wallet blocked successFully",
    data: wallet,
  });
});

const unblockWallet = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user?.userId;
  const userId = req.params.userId;

  if (!adminId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
  }
  const wallet = await WalletService.unblockWallet(adminId, userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wallet unblocked successfully",
    data: wallet,
  });
});

const getAllWallets = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await WalletService.getAllWallets(page, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All wallets retrieved successfully",
    data: result,
  });
});

export const WalletController = {
  getMyWallet,
  blockWallet,
  unblockWallet,
  getAllWallets,
};
