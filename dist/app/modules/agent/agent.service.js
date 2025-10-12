"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const mongoose_1 = require("mongoose");
const transaction_model_1 = require("../transaction/transaction.model");
const getAgentDashboard = async (agentId) => {
    const totalCashIns = await transaction_model_1.TransactionModel.countDocuments({
        type: "CASH_IN",
        sender: new mongoose_1.Types.ObjectId(agentId),
    });
    const totalCashOuts = await transaction_model_1.TransactionModel.countDocuments({
        type: "CASH_OUT",
        sender: new mongoose_1.Types.ObjectId(agentId),
    });
    const commissionEarned = await transaction_model_1.TransactionModel.aggregate([
        {
            $match: {
                sender: new mongoose_1.Types.ObjectId(agentId),
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
    const recentTransactions = await transaction_model_1.TransactionModel.find({
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
exports.AgentService = {
    getAgentDashboard,
};
//# sourceMappingURL=agent.service.js.map