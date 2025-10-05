import { TransactionModel } from "../transaction/transaction.model";

const getAgentDashboard = async (agentId: string) => {
  const totalCashIns = await TransactionModel.countDocuments({
    type: "CASH_IN",
    sender: agentId,
  });
  const totalCashOuts = await TransactionModel.countDocuments({
    type: "CASH_OUT",
    sender: agentId,
  });

  const commissionEarned = await TransactionModel.aggregate([
    {
      $match: {
        sender: agentId,
        type: { $in: ["CASH_IN", "CASH_OUT"] },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$commission" },
      },
    },
  ]);
  return {
    totalCashIns,
    totalCashOuts,
    commissionEarned: commissionEarned[0]?.total || 0,
  };
};

export const AgentService = {
  getAgentDashboard,
};
