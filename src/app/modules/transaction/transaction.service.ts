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

  const fee = 5;
  const total = amount + fee;

  if (!senderWallet || senderWallet.isBlocked)
    throw new AppError(httpStatus.FORBIDDEN, "Sender wallet blocked");

  if (!receiverWallet || receiverWallet.isBlocked)
    throw new AppError(httpStatus.FORBIDDEN, "Receiver wallet blocked");

  // if (Number(senderWallet.balance) < amount)
  //   throw new AppError(httpStatus.BAD_REQUEST, "Insufficient balance");

  if (Number(senderWallet.balance) < total) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Insufficient balance including fee"
    );
  }

  senderWallet.balance = Number(senderWallet.balance) - total;

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
  // add commission
  const commissionRate = 0.02;
  const commission = amount * commissionRate;

  userWallet.balance = Number(userWallet.balance) + amount;
  await Promise.all([
    userWallet.save(),

    TransactionModel.create({
      sender: agentId,
      receiver: userId,
      amount,
      commission,
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

const getAllTransactions = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const transactions = await TransactionModel.find()
    .sort("-timestamp")
    .skip(skip)
    .limit(limit)
    .populate("sender", "email role")
    .populate("receiver", "email role");

  const total = await TransactionModel.countDocuments();

  return { total, page, limit, transactions };
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
