import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import AppError from "../../errorHelpers/appError";
import { TransactionModel } from "../transaction/transaction.model";
import { UserModel } from "../user/user.model";
import { WalletModel } from "../wallet/wallet.model";

const getAgentDashboard = async (agentId: string) => {
  const agentObjectId = new Types.ObjectId(agentId);

  const cashInAgg = await TransactionModel.aggregate([
    { $match: { sender: agentObjectId, type: "CASH_IN" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const cashOutAgg = await TransactionModel.aggregate([
    { $match: { sender: agentObjectId, type: "CASH_OUT" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const commissionEarned = await TransactionModel.aggregate([
    {
      $match: {
        sender: agentObjectId,
        type: "CASH_IN",
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$commission" },
      },
    },
  ]);

  const recentTransactions = await TransactionModel.find({
    $or: [{ sender: agentObjectId }, { receiver: agentObjectId }],
  })
    .sort({ timestamp: -1 })
    .limit(5)
    .select("_id type amount commission timestamp");

  return {
    totalCashIns: cashInAgg[0]?.total || 0,
    totalCashOuts: cashOutAgg[0]?.total || 0,
    commissionEarned: commissionEarned[0]?.total || 0,
    recentTransactions,
  };
};

// cash -in
const cashIn = async (agentId: string, identifier: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const agentObjectId = new Types.ObjectId(agentId);

  const agentWallet = await WalletModel.findOne({ user: agentObjectId });

  if (!agentWallet || agentWallet.isBlocked) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not available");
  }

  // Find user by identifier (email or phone)
  const user = await UserModel.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // get wallets

  const userWallet = await WalletModel.findOne({ user: user._id });

  if (!userWallet || userWallet.isBlocked) {
    throw new AppError(httpStatus.NOT_FOUND, "User wallet not available");
  }

  console.log("My Agent wallet", agentWallet);
  console.log("My user wallet", userWallet);

  const agentBalance = Number(agentWallet.balance);
  const userBalance = Number(userWallet.balance);

  if (agentBalance < amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient agent balance");
  }

  // commission (example:1%)

  const commissionRate = 0.01;
  const commission = amount * commissionRate;

  // Updated balance
  agentWallet.balance = agentBalance - amount + commission;
  userWallet.balance = userBalance + amount;

  await agentWallet.save();
  await userWallet.save();

  // Create transaction
  const transaction = await TransactionModel.create({
    sender: agentObjectId,
    receiver: user._id,
    amount,
    commission,
    type: "CASH_IN",
    timestamp: new Date(),
  });

  return transaction;
};

// cash out
const cashOut = async (agentId: string, identifier: string, amount: number) => {
  if (amount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Amount must be greater than 0");
  }

  const agentObjectId = new Types.ObjectId(agentId);

  const agentWallet = await WalletModel.findOne({ user: agentObjectId });

  if (!agentWallet || agentWallet.isBlocked) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not available");
  }
  
  const user = await UserModel.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const userWallet = await WalletModel.findOne({ user: user._id });

  if (!userWallet || userWallet.isBlocked) {
    throw new AppError(httpStatus.NOT_FOUND, "User wallet not available");
  }

  const agentBalance = Number(agentWallet.balance);
  const userBalance = Number(userWallet.balance);

  if (userBalance < amount) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient user balance");
  }

  agentWallet.balance = agentBalance + amount;
  userWallet.balance = userBalance - amount;

  await agentWallet.save();
  await userWallet.save();

  return TransactionModel.create({
    sender: agentObjectId,
    receiver: user._id,
    amount,
    type: "CASH_OUT",
    timestamp: new Date(),
  });
};

export const AgentService = {
  getAgentDashboard,
  cashIn,
  cashOut,
};
