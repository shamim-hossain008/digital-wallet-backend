import { Types } from "mongoose";
export declare enum TransactionType {
    DEPOSIT = "DEPOSIT",
    WITHDRAW = "WITHDRAW",
    TRANSFER = "TRANSFER",
    CASH_IN = "CASH_IN",
    CASH_OUT = "CASH_OUT"
}
export interface ITransaction {
    _id: Types.ObjectId;
    sender?: Types.ObjectId;
    receiver?: Types.ObjectId;
    amount: number;
    commission?: number;
    type: TransactionType;
    status?: "PENDING" | "COMPLETED" | "FAILED";
    timestamp?: Date;
}
//# sourceMappingURL=transaction.interface.d.ts.map