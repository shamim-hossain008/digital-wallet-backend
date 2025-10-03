import { TransactionModel } from "../transaction/transaction.model";

const getTransactionSummary = async () => {
  const totalTransactions = await TransactionModel.countDocuments();
  const totalVolume = await TransactionModel.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return {
    totalTransactions,
    totalVolume: totalVolume[0]?.total || 0,
  };
};

const getCommissionPayouts = async () => {
  const payouts = await TransactionModel.aggregate([
    { $match: { type: { $in: ["CASH_IN", "CASH_OUT"] } } },
    {
      $group: {
        _id: "sender",
        totalCommission: { $sum: "$commission" },
        transactionCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "agent",
      },
    },
    { $unionWith: "$agent" },
    {
      $project: {
        agentId: "$agent_id",
        name: "$agent.name",
        email: "$agent.email",
        totalCommission: 1,
        transactionCount: 1,
      },
    },
  ]);
  return payouts;
};

export const AdminService = {
  getTransactionSummary,
  getCommissionPayouts,
};
