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

const getCommissionPayouts = async (
  fromData?: string,
  toDate?: string,
  status?: string,
  page: number = 1,
  limit: number = 1
) => {
  const matchStage: any = {
    type: { $in: ["CASH_IN", "CASH_OUT"] },
  };
  if (fromData && toDate) {
    matchStage.createAt = {
      $get: new Date(fromData),
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
export const AdminService = {
  getTransactionSummary,
  getCommissionPayouts,
};
