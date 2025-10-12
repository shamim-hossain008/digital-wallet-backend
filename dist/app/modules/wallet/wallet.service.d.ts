import { IPaginatedResponse } from "../../interfaces/pagination.interface";
import { IWallet } from "./wallet.interface";
export declare const WalletService: {
    createWallet: (userId: string) => Promise<IWallet>;
    getWalletByUser: (userId: string) => Promise<IWallet | null>;
    blockWallet: (adminId: string, userId: string) => Promise<IWallet | null>;
    unblockWallet: (adminId: string, userId: string) => Promise<IWallet | null>;
    getAllWallets: (page?: number, limit?: number) => Promise<IPaginatedResponse<IWallet>>;
};
//# sourceMappingURL=wallet.service.d.ts.map