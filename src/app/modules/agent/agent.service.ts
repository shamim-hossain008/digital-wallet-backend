import { Types } from "mongoose";
import { TransactionModel } from "../transaction/transaction.model";

const getAgentDashboard = async (agentId: string) => {
  const totalCashIns = await TransactionModel.countDocuments({
    type: "CASH_IN",
    sender: new Types.ObjectId(agentId),
  });
  const totalCashOuts = await TransactionModel.countDocuments({
    type: "CASH_OUT",
    sender: new Types.ObjectId(agentId),
  });

  const commissionEarned = await TransactionModel.aggregate([
    {
      $match: {
        sender: new Types.ObjectId(agentId),
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
    $or: [{ sender: agentId }, { receiver: agentId }],
  })
    .sort({ timestamp: -1 })
    .limit(5)
    .select("type amount commission timestamp");

  return {
    totalCashIns,
    totalCashOuts,
    commissionEarned: commissionEarned[0]?.total || 0,
    recentTransactions,
  };
};

export const AgentService = {
  getAgentDashboard,
};
