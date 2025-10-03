import { z } from "zod";

export const approveAgentSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
});

export const suspendAgentSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
});

export const agentDashboardFilterSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE", "BLOCKED"]).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});
