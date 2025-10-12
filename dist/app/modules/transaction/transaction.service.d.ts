import { Types } from "mongoose";
export declare const TransactionService: {
    deposit: (userId: string, amount: number) => Promise<import("mongoose").Document<unknown, {}, import("../wallet/wallet.interface").IWallet, {}, {}> & import("../wallet/wallet.interface").IWallet & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    withdraw: (userId: string, amount: number) => Promise<import("mongoose").Document<unknown, {}, import("../wallet/wallet.interface").IWallet, {}, {}> & import("../wallet/wallet.interface").IWallet & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    transfer: (senderId: string, receiverId: string, amount: number) => Promise<{
        senderWallet: import("mongoose").Document<unknown, {}, import("../wallet/wallet.interface").IWallet, {}, {}> & import("../wallet/wallet.interface").IWallet & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
        receiverWallet: import("mongoose").Document<unknown, {}, import("../wallet/wallet.interface").IWallet, {}, {}> & import("../wallet/wallet.interface").IWallet & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    getMyTransactions: (userId: string) => Promise<(import("mongoose").Document<unknown, {}, import("./transaction.interface").ITransaction, {}, {}> & import("./transaction.interface").ITransaction & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    cashIn: (agentId: string, userId: string, amount: number) => Promise<import("mongoose").Document<unknown, {}, import("../wallet/wallet.interface").IWallet, {}, {}> & import("../wallet/wallet.interface").IWallet & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    cashOut: (agentId: string, userId: string, amount: number) => Promise<import("mongoose").Document<unknown, {}, import("../wallet/wallet.interface").IWallet, {}, {}> & import("../wallet/wallet.interface").IWallet & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getAllTransactions: (page?: number, limit?: number) => Promise<{
        total: number;
        page: number;
        limit: number;
        transactions: (import("mongoose").Document<unknown, {}, import("./transaction.interface").ITransaction, {}, {}> & import("./transaction.interface").ITransaction & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
};
//# sourceMappingURL=transaction.service.d.ts.map