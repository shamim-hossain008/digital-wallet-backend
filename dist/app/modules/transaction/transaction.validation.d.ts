import z from "zod";
export declare const depositSchema: z.ZodObject<{
    amount: z.ZodNumber;
}, z.core.$strip>;
export declare const withdrawSchema: z.ZodObject<{
    amount: z.ZodNumber;
}, z.core.$strip>;
export declare const transferSchema: z.ZodObject<{
    receiverId: z.ZodString;
    amount: z.ZodNumber;
}, z.core.$strip>;
//# sourceMappingURL=transaction.validation.d.ts.map