import { z } from "zod";
export declare const createWalletSchema: z.ZodObject<{
    userId: z.ZodString;
}, z.core.$strip>;
export declare const updateWalletSchema: z.ZodObject<{
    balance: z.ZodOptional<z.ZodNumber>;
    isBlocked: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
//# sourceMappingURL=wallet.validation.d.ts.map