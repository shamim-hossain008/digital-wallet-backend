import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { transactionsType } from "../../types/transaction.types";
import { CommissionPayoutModel } from "../commission/commissionPayout.model";
import { TransactionModel } from "../transaction/transaction.model";

const getTransactionSummary = async () => {
  const totalTransactions = await TransactionModel.countDocuments();

  const counts = await Promise.all(
    transactionsType.map(async (type) => ({
      type,
      count: await TransactionModel.countDocuments({ type }),
    }))
  );

  const totalVolumeAgg = await TransactionModel.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const summary: Record<string, number> = {
    totalTransactions,
    totalVolume: totalVolumeAgg[0]?.total || 0,
  };
  counts.forEach(({ type, count }) => {
    summary[`total_${type.toLocaleLowerCase()}`] = count;
  });

  return summary;
};

// Commission Summary
const getCommissionSummary = async (
  fromData?: string,
  toDate?: string,
  status?: string,
  page: number = 1,
  limit: number = 10
) => {
  const matchStage: any = {
    type: { $in: ["CASH_IN", "CASH_OUT"] },
  };
  if (fromData && toDate) {
    matchStage.createdAt = {
      $gte: new Date(fromData),
      $lte: new Date(toDate),
    };
  }

  if (status) {
    matchStage.status = status;
  }
  const skip = (page - 1) * limit;

  const [payouts, totalCount] = await Promise.all([
    TransactionModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$sender",
          totalCommission: { $sum: "$commission" },
          transactionCount: { $sum: 1 },
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "agent",
        },
      },

      {
        $unwind: "$agent",
      },
      {
        $project: {
          _id: 0,
          agentId: "$agent._id",
          name: "$agent.name",
          email: "$agent.email",
          totalCommission: 1,
          transactionCount: 1,
        },
      },
    ]),

    TransactionModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$sender",
        },
      },
      { $count: "total" },
    ]),
  ]);

  return {
    total: totalCount[0]?.total || 0,
    page,
    limit,
    payouts,
  };
};

// Create CommissionPayout '

const createCommissionPayout = async (payload: {
  agentId: string;
  amount: number;
  fromDate?: string;
  toDate?: string;
  adminId: string;
}) => {
  // Prevent double payment (same agent + same date range)
  const existing = await CommissionPayoutModel.findOne({
    agent: payload.agentId,
    fromDate: payload.fromDate,
    toDate: payload.toDate,
    status: "PAID",
  });

  if (existing) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Commission already paid for this period"
    );
  }

  return CommissionPayoutModel.create({
    agent: payload.agentId,
    amount: payload.amount,
    fromDate: payload.fromDate,
    toDate: payload.toDate,
    status: "PAID",
    paidAt: new Date(),
    paidBy: payload.adminId,
  });
};

const getCommissionHistory = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    CommissionPayoutModel.find()
      .populate("agent", "name email")
      .populate("paidBy", "name email")
      .sort({ createAt: -1 })
      .skip(skip)
      .limit(limit),

    CommissionPayoutModel.countDocuments(),
  ]);

  return { data, page, limit, total };
};

export const AdminService = {
  getTransactionSummary,
  getCommissionSummary,
  createCommissionPayout,
  getCommissionHistory,
};
