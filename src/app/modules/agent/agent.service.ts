import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { FilterType } from "../../types/filterType";
import { getStartDate } from "../../utils/dateFilters";
import { TransactionModel } from "../transaction/transaction.model";
import { UserModel } from "../user/user.model";
import { WalletModel } from "../wallet/wallet.model";

const getAgentDashboard = async (
  agentId: string,
  filter: FilterType = "all",
  page = 1,
  limit = 10
) => {
  const agentObjectId = new Types.ObjectId(agentId);

  const agentWallet = await WalletModel.findOne({ user: agentObjectId });

  if (!agentWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
  }

  // date filter
  const startDate = getStartDate(filter);

  const dateMatch = startDate ? { timestamp: { $gte: startDate } } : {};

  const baseMatch = {
    sender: agentObjectId,
    ...dateMatch,
  };

  // aggregations
  const cashInAgg = await TransactionModel.aggregate([
    { $match: { ...baseMatch, type: "CASH_IN" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const cashOutAgg = await TransactionModel.aggregate([
    { $match: { ...baseMatch, type: "CASH_OUT" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const commissionEarned = await TransactionModel.aggregate([
    {
      $match: {
        sender: agentObjectId,
        type: { $in: ["CASH_IN", "CASH_OUT"] },
        ...dateMatch,
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$commission" },
      },
    },
  ]);

  const txQuery: any = {
    $or: [{ sender: agentObjectId }, { receiver: agentObjectId }],
    ...dateMatch,
  };

  const totalTransactions = await TransactionModel.countDocuments(txQuery);

  const recentTransactions = await TransactionModel.find(txQuery)

    .sort({ timestamp: -1 })
    .skip((page - 1) * 1)
    .limit(limit)
    .select("_id type amount commission timestamp");

  return {
    walletBalance: Number(agentWallet?.balance || 0),
    totalCashIns: cashInAgg[0]?.total || 0,
    totalCashOuts: cashOutAgg[0]?.total || 0,
    commissionEarned: commissionEarned[0]?.total || 0,

    recentTransactions: {
      meta: {
        page,
        limit,
        total: totalTransactions,
        totalPage: Math.ceil(totalTransactions / limit),
      },
      data: recentTransactions,
    },
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
  if (amount < 10) {
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

  // find user
  const userWallet = await WalletModel.findOne({ user: user._id });

  if (!userWallet || userWallet.isBlocked) {
    throw new AppError(httpStatus.NOT_FOUND, "User wallet not available");
  }

  const agentBalance = Number(agentWallet.balance);
  const userBalance = Number(userWallet.balance);

  // added commission
  const commissionRate = 0.005;
  const commission = amount * commissionRate;
  const totalDeduction = amount + commission;

  // user must have amount + commission
  if (userBalance < totalDeduction) {
    throw new AppError(httpStatus.BAD_REQUEST, "Insufficient user balance");
  }

  // updated balance
  agentWallet.balance = agentBalance + amount;
  userWallet.balance = userBalance - amount;

  await agentWallet.save();
  await userWallet.save();

  return TransactionModel.create({
    sender: agentObjectId,
    receiver: user._id,
    amount,
    commission,
    type: "CASH_OUT",
    timestamp: new Date(),
  });
};

// Get all agent Transactions
const getAgentTransactions = async (
  agentId: string,
  filter: FilterType = "all",
  page: number,
  limit: number,
  search: string
) => {
  const agentObjectId = new Types.ObjectId(agentId);

  // Date filter
  const startDate = getStartDate(filter);

  const query: any = {
    $or: [{ sender: agentObjectId }, { receiver: agentObjectId }],
    timestamp: { $gte: startDate },
  };

  if (search) {
    const users = await UserModel.find({
      $or: [
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    query.$or = [
      { sender: { $in: users.map((u) => u._id) } },
      { receiver: { $in: users.map((u) => u._id) } },
    ];
  }

  const transactions = await TransactionModel.find(query)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("_id type amount commission sender receiver timestamp");

  const total = await TransactionModel.countDocuments(query);

  return {
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: transactions,
  };
};

// get agent profile
const getAgentProfile = async (agentId: string) => {
  const agent = await UserModel.findById(agentId).select("-password");

  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }

  const wallet = await WalletModel.findOne({ user: agentId });

  return {
    ...agent.toObject(),
    walletBalance: Number(wallet?.balance || 0),
    recentTransactions: [],
  };
};

// Update agent profile
const updateAgentProfile = async (
  agentId: string,
  payload: { name?: string; phone?: string; picture?: string }
) => {
  const agent = await UserModel.findByIdAndUpdate(agentId, payload, {
    new: true,
  }).select("-password");

  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }

  return agent;
};

//change password
const changeAgentPassword = async (
  agentId: string,
  oldPassword: string,
  newPassword: string
) => {
  const agent = await UserModel.findById(agentId).select("+password");

  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }

  if (!agent.password) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Agent has no password set"
    );
  }

  const isMatch = await bcrypt.compare(oldPassword, agent.password);

  if (!isMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, "old password incorrect");
  }

  agent.password = await bcrypt.hash(newPassword, envVars.BCRYPT_SALT_ROUND);

  await agent.save();

  return null;
};

export const AgentService = {
  getAgentDashboard,
  getAgentTransactions,
  changeAgentPassword,
  cashIn,
  cashOut,
  getAgentProfile,
  updateAgentProfile,
};
