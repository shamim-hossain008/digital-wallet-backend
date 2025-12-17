import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/appError";
import { IPaginatedResponse } from "../../interfaces/pagination.interface";
import { logAction } from "../../utils/logger";
import { IWallet } from "./wallet.interface";
import { WalletModel } from "./wallet.model";

const createWallet = async (userId: string): Promise<IWallet> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid use ID");
  }

  const existingWallet = await WalletModel.findOne({ user: userId });
  if (existingWallet) {
    throw new AppError(httpStatus.CONFLICT, "Wallet already exists");
  }

  const wallet = await WalletModel.create({ user: new Types.ObjectId(userId) });

  logAction("Wallet created", userId, {
    WalletId: wallet._id,
    initialBalance: wallet.balance,
  });

  return wallet;
};

//Get wallet of logged-in user
const getWalletByUser = async (userId: string): Promise<IWallet> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user ID");
  }

  const wallet = await WalletModel.findOne({
    user: new Types.ObjectId(userId),
  });

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  return wallet;
};

//Admin: Block user

const blockWallet = async (
  adminId: string,
  userId: string
): Promise<IWallet> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user ID");
  }

  const wallet = await WalletModel.findOneAndUpdate(
    { user: new Types.ObjectId(userId) },
    { isBlocked: true },
    { new: true }
  );

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (wallet) {
    logAction("Wallet blocked", adminId, { targetUser: userId });
  }

  return wallet;
};

// Admin: UnBlock wallet
const unblockWallet = async (
  adminId: string,
  userId: string
): Promise<IWallet> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid user ID");
  }

  const wallet = await WalletModel.findOneAndUpdate(
    { user: new Types.ObjectId(userId) },
    { isBlocked: false },
    { new: true }
  );

  if (!wallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
  }

  if (wallet) {
    logAction("Wallet unblocked", adminId, { targetUser: userId });
  }

  return wallet;
};

// Admin: Get all wallets (paginated)
const getAllWallets = async (
  page: number = 1,
  limit: number = 10
): Promise<IPaginatedResponse<IWallet>> => {
  const skip = (page - 1) * limit;

  const wallets = await WalletModel.find()
    .skip(skip)
    .limit(limit)
    .populate("user", "email role");

  const total = await WalletModel.countDocuments();

  return { total, page, limit, data: wallets };
};

export const WalletService = {
  createWallet,
  getWalletByUser,
  blockWallet,
  unblockWallet,
  getAllWallets,
};
