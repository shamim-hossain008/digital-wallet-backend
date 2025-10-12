import z from "zod";
export declare const registerUserZodSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>;
    address: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updatedUserZodSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<{
        [x: string]: string;
    }>>;
    isActive: z.ZodOptional<z.ZodDefault<z.ZodEnum<{
        active: "active";
        inactive: "inactive";
        blocked: "blocked";
    }>>>;
    isDelete: z.ZodOptional<z.ZodBoolean>;
    isVerified: z.ZodOptional<z.ZodBoolean>;
    address: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=user.validation.d.ts.map