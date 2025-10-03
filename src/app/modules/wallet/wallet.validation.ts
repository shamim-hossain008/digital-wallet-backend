

import { z } from "zod";

export const createWalletSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const updateWalletSchema = z.object({
  balance: z.number().optional(),
  isBlocked: z.boolean().optional(),
});
