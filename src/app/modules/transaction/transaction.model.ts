import { model, Schema } from "mongoose";
import { ITransaction, TransactionType } from "./transaction.validation";

const TransactionSchema = new Schema<ITransaction>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    receiver: { type: Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED"],
      default: "COMPLETED",
    },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const TransactionModel = model<ITransaction>(
  "Transaction",
  TransactionSchema
);
