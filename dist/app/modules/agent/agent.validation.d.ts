import { z } from "zod";
export declare const approveAgentSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strip>;
export declare const suspendAgentSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strip>;
export declare const agentDashboardFilterSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        BLOCKED: "BLOCKED";
    }>>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=agent.validation.d.ts.map