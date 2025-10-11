import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { IPaginatedResponse } from "../../interfaces/pagination.interface";
import { logAction } from "../../utils/logger";
import { IWallet } from "./wallet.interface";
import { WalletModel } from "./wallet.model";
import { Types } from "mongoose";

const createWallet = async (userId: string): Promise<IWallet> => {
  const existing = await WalletModel.findOne({ user: userId });
  if (existing)
    throw new AppError(httpStatus.CONFLICT, "Wallet already exists");

  const wallet = await WalletModel.create({ user: userId });

  logAction("Wallet created", userId, { WalletId: wallet._id });

  return wallet;
};

const getWalletByUser = async (userId: string): Promise<IWallet | null> => {
  return WalletModel.findOne({ user: userId });
};

const blockWallet = async (
  adminId: string,
  userId: string
): Promise<IWallet | null> => {
  const wallet = await WalletModel.findOneAndUpdate(
    { user: new Types.ObjectId (userId) },
    { isBlocked: true },
    { new: true }
  );
  
  if(!wallet) {
    throw new AppError(httpStatus.NOT_FOUND,"Wallet not found")
  }

  if (wallet) {
    logAction("Wallet blocked", adminId, { target: userId });
  }

  return wallet;
};

const unblockWallet = async (
  adminId: string,
  userId: string
): Promise<IWallet | null> => {
  const wallet = await WalletModel.findOneAndUpdate(
    { user: userId },
    { isBlocked: false },
    { new: true }
  );

  if (wallet) {
    logAction("Wallet unblocked", adminId, { target: userId });
  }

  return wallet;
};
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
