import { model, Schema } from "mongoose";
import { IWallet } from "./wallet.interface";

const WalletSchema = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 50 }, //Initial bonus
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const WalletModel = model<IWallet>("Wallet", WalletSchema);
