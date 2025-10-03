import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { IPaginatedResponse } from "../../interfaces/pagination.interface";
import { IWallet } from "./wallet.interface";
import { WalletModel } from "./wallet.model";

const createWallet = async (userId: string): Promise<IWallet> => {
  const existing = await WalletModel.findOne({ user: userId });
  if (existing)
    throw new AppError(httpStatus.CONFLICT, "Wallet already exists");

  return WalletModel.create({ user: userId });
};

const getWalletByUser = async (userId: string): Promise<IWallet | null> => {
  return WalletModel.findOne({ user: userId });
};

const blockWallet = async (userId: string): Promise<IWallet | null> => {
  return WalletModel.findOneAndUpdate({ user: userId }, { isBlocked: true });
};

const unblockWallet = async (userId: string): Promise<IWallet | null> => {
  return WalletModel.findOneAndUpdate(
    { user: userId },
    { isBlocked: false },
    { new: true }
  );
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
