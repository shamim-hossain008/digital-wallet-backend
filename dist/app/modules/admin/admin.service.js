"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const transaction_model_1 = require("../transaction/transaction.model");
const getTransactionSummary = async () => {
    const totalTransactions = await transaction_model_1.TransactionModel.countDocuments();
    const types = ["DEPOSIT", "WITHDRAW", "TRANSFER", "CASH_IN", "CASH_OUT"];
    const counts = await Promise.all(types.map((type) => transaction_model_1.TransactionModel.countDocuments({ type }).then((count) => ({
        type,
        count,
    }))));
    const totalVolume = await transaction_model_1.TransactionModel.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const summary = {
        totalTransactions,
        totalVolume: totalVolume[0]?.total || 0,
    };
    counts.forEach(({ type, count }) => {
        summary[`total ${type.slice(0).toLocaleLowerCase()}s`] = count;
    });
    return summary;
};
const getCommissionPayouts = async (fromData, toDate, status, page = 1, limit = 10) => {
    const matchStage = {
        type: { $in: ["CASH_IN", "CASH_OUT"] },
    };
    if (fromData && toDate) {
        matchStage.createAt = {
            $gte: new Date(fromData),
            $lte: new Date(toDate),
        };
    }
    if (status) {
        matchStage.status = status;
    }
    const skip = (page - 1) * limit;
    const [payouts, totalCount] = await Promise.all([
        transaction_model_1.TransactionModel.aggregate([
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
        transaction_model_1.TransactionModel.aggregate([
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
exports.AdminService = {
    getTransactionSummary,
    getCommissionPayouts,
};
//# sourceMappingURL=admin.service.js.map