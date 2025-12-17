import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { IAuthJwtPayload } from "../../types/auth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { WalletService } from "./wallet.service";

const getMyWallet = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user as IAuthJwtPayload;
  if (!userId?.sub) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
  }
  const wallet = await WalletService.getWalletByUser(userId.sub);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Wallet retrieved successfully",
    data: wallet,
  });
});

// Admin: Block user's wallet
const blockWallet = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req.user as IAuthJwtPayload)?.sub;
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
  const adminId = (req.user as IAuthJwtPayload)?.sub;
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

// Admin get all wallets (paginated)
const getAllWallets = catchAsync(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

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
