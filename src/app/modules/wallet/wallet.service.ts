import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
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
const getAllWallets = async (): Promise<IWallet[]> => {
  return WalletModel.find().populate("user", "email role");
};

export const WalletService = {
  createWallet,
  getWalletByUser,
  blockWallet,
  unblockWallet,
  getAllWallets,
};
