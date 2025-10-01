import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { WalletModel } from "../wallet/wallet.model";
import { TransactionType } from "./transaction.interface";
import { TransactionModel } from "./transaction.model";

const deposit = async (userId: string, amount: number) => {
  const wallet = await WalletModel.findOne({ user: userId });
  if (!wallet || wallet.isBlocked)
    throw new AppError(httpStatus.FORBIDDEN, "Wallet not accessible");
  wallet.balance = Number(wallet.balance) + amount;
  await wallet.save();

  await TransactionModel.create({
    receiver: userId,
    amount,
    type: TransactionType.DEPOSIT,
  });

  return wallet;
};

const withdraw = async (userId: string, amount: number) => {
  const wallet = await WalletModel.findOne({ user: userId });
  if (!wallet || wallet.isBlocked)
    throw new AppError(httpStatus.FORBIDDEN, "Wallet not accessible");
  if (Number(wallet.balance) < amount)
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");

  wallet.balance = Number(wallet.balance) - amount;

  await wallet.save();

  await TransactionModel.create({
    sender: userId,
    amount,
    type: TransactionType.WITHDRAW,
  });
  return wallet;
};

const transfer = async (
  senderId: string,
  receiverId: string,
  amount: number
) => {
  const senderWallet = await WalletModel.findOne({ user: senderId });
  const receiverWallet = await WalletModel.findOne({ user: receiverId });

  if (!senderWallet || senderWallet.isBlocked)
    throw new AppError(httpStatus.FORBIDDEN, "Sender wallet blocked");
  if (!receiverWallet || receiverWallet.isBlocked)
    throw new AppError(httpStatus.FORBIDDEN, "Receiver wallet blocked");
  if (Number(senderWallet.balance) < amount)
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");

  senderWallet.balance = Number(senderWallet.balance) - amount;

  receiverWallet.balance = Number(receiverWallet.balance) + amount;

  await Promise.all([
    senderWallet.save(),
    receiverWallet.save(),
    TransactionModel.create({
      sender: senderId,
      receiver: receiverId,
      amount,
      type: TransactionType.TRANSFER,
    }),
  ]);
  return { senderWallet, receiverWallet };
};

const getMyTransactions = async (userId: string) => {
  if (!userId) {
    throw new AppError(httpStatus.BAD_REQUEST, "User ID is required");
  }

  const transactions = await TransactionModel.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .sort({ Timestamp: -1 })
    .populate("sender", "email role")
    .populate("receiver", "email role");

  return transactions;
};

const cashIn = async (agentId: string, userId: string, amount: number) => {
  const userWallet = await WalletModel.findOne({ user: userId });
  if (!userWallet || userWallet.isBlocked)
    throw new AppError(httpStatus.FORBIDDEN, "User wallet  blocked");

  userWallet.balance = Number(userWallet.balance) + amount;
  await Promise.all([
    userWallet.save(),
    TransactionModel.create({
      sender: agentId,
      receiver: userId,
      amount,
      type: TransactionType.CASH_IN,
    }),
  ]);
  return userWallet;
};

const cashOut = async (agentId: string, userId: string, amount: number) => {
  const userWallet = await WalletModel.findOne({ user: userId });
  if (!userWallet || userWallet.isBlocked)
    throw new AppError(httpStatus.FORBIDDEN, "User wallet blocked ");

  if (Number(userWallet.balance) < amount)
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");

  userWallet.balance = Number(userWallet.balance) - amount;

  await Promise.all([
    userWallet.save(),
    TransactionModel.create({
      sender: userId,
      receiver: agentId,
      amount,
      type: TransactionType.CASH_OUT,
    }),
  ]);
  return userWallet;
};

const getAllTransactions = async () => {
  return TransactionModel.find()
    .sort("-timestamp")
    .populate("sender", "email role")
    .populate("receiver", "email role");
};
export const TransactionService = {
  deposit,
  withdraw,
  transfer,
  getMyTransactions,
  cashIn,
  cashOut,
  getAllTransactions,
};
