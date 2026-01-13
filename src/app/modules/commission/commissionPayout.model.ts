import { model, Schema, Types } from "mongoose";

const commissionPayoutSchema = new Schema(
  {
    agent: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    fromDate: Date,
    toDate: Date,

    status: {
      type: String,
      enum: ["PENDING", "PAID"],
      default: "PENDING",
    },

    paidAt: Date,

    paidBy: {
      type: Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const CommissionPayoutModel = model(
  "CommissionPayout",
  commissionPayoutSchema
);
