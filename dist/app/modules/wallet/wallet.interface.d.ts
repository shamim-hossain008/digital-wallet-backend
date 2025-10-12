import { Types } from "mongoose";
export interface IWallet {
    _id: Types.ObjectId;
    user: Types.ObjectId;
    balance: Number;
    isBlocked?: boolean;
}
//# sourceMappingURL=wallet.interface.d.ts.map