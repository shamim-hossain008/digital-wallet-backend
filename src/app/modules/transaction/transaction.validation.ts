import z from "zod";

export const depositSchema = z.object({
  amount: z.number().min(10, "Minimum deposit is $10"),
});

export const withdrawSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
});

export const transferSchema = z.object({
  receiverId: z.string().length(24, "Invalid receiver ID"),
  amount: z.number().positive("Amount must be greater than zero"),
});

