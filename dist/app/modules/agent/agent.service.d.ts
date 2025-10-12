import { Types } from "mongoose";
export declare const AgentService: {
    getAgentDashboard: (agentId: string) => Promise<{
        totalCashIns: number;
        totalCashOuts: number;
        commissionEarned: any;
        recentTransactions: (import("mongoose").Document<unknown, {}, import("../transaction/transaction.interface").ITransaction, {}, {}> & import("../transaction/transaction.interface").ITransaction & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
};
//# sourceMappingURL=agent.service.d.ts.map