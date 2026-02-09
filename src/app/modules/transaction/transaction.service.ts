import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/appError";
import { logAction } from "../../utils/logger";
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
  const wallet = await WalletModel.findOne({
    user: new Types.ObjectId(userId),
  });

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
  amount: number,
) => {
  const senderWallet = await WalletModel.findOne({
    user: new Types.ObjectId(senderId),
  });
  const receiverWallet = await WalletModel.findOne({
    user: new Types.ObjectId(receiverId),
  });

  const fee = 0.05;
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
      "Insufficient balance including fee",
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
  // for log
  logAction("Transfer", senderId, { receiver: receiverId, amount, fee });
  return { senderWallet, receiverWallet };
};

const getMyTransactions = async (
  userId: string,
  page = 1,
  limit = 10,
  type?: string,
  dateRange?: number,
  search?: string,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) => {
  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or missing user id");
  }

  const maybeObjectId = Types.ObjectId.isValid(userId)
    ? new Types.ObjectId(userId)
    : null;

  //  Match sender/receiver as ObjectId OR string
  const senderReceiverOr: any[] = [];
  if (maybeObjectId) {
    senderReceiverOr.push(
      { sender: maybeObjectId },
      { receiver: maybeObjectId },
    );
  }

  senderReceiverOr.push({ sender: userId }, { receiver: userId });
  const parts: any[] = [{ $or: senderReceiverOr }];
  if (type) parts.push({ type });
  if (dateRange) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    parts.push({
      $or: [
        { timestamp: { $gte: startDate } },
        { createdAt: { $gte: startDate } },
      ],
    });
  }
  if (search) {
    const searchRegex = new RegExp(search, "i");
    const amountNum = Number(search);
    const orSearch: any[] = [];
    if (!Number.isNaN(amountNum)) orSearch.push({ amount: amountNum });
    orSearch.push(
      { "sender.email": searchRegex },
      { "receiver.email": searchRegex },
    );
    parts.push({ $or: orSearch });
  }
  const query = parts.length === 1 ? parts[0] : { $and: parts };
  const sortField = sortBy ?? "timestamp";
  const sortQuery: any =
    sortBy && sortOrder
      ? { [sortField]: sortOrder === "asc" ? 1 : -1 }
      : { [sortField]: -1 };

  // Pagination
  const skip = (page - 1) * limit;

  // Query
  const [transactions, total] = await Promise.all([
    TransactionModel.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .populate("sender", "email role")
      .populate("receiver", "email role")
      .lean(),

    TransactionModel.countDocuments(query),
  ]);

  

  const totalPages = Math.ceil(total / limit) || 0;

  return {
    transactions: transactions ?? [],
    total: total ?? 0,
    totalPages,
    page,
    limit,
  };
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

  logAction("Cash-in", agentId, { receiver: userId, amount, commission });
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

const getAllTransactions = async (
  page = 1,
  limit = 10,
  search?: string,
  type?: string,
  status?: string,
  minAmount?: number,
  maxAmount?: number,
) => {
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  if (minAmount !== undefined || maxAmount !== undefined) {
    filter.amount = {};
    if (minAmount !== undefined) filter.amount.$gte = minAmount;
    if (maxAmount !== undefined) filter.amount.$lte = maxAmount;
  }

  if (search) {
    filter.$or = [
      { "sender.email": { $regex: search, $options: "i" } },
      { "receiver.email": { $regex: search, $options: "i" } },
    ];
  }
  const transactions = await TransactionModel.find(filter)
    .sort("-timestamp")
    .skip(skip)
    .limit(limit)
    .populate("sender", "email role")
    .populate("receiver", "email role");

  const total = await TransactionModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  return { total, page, limit, transactions, totalPages };
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
