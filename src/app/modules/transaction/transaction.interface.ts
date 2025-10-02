import { Types } from "mongoose";

export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
  TRANSFER = "TRANSFER",
  CASH_IN = "CASH_IN",
  CASH_OUT = "CASH_OUT",
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
