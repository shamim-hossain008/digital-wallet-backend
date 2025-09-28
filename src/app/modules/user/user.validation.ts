import z from "zod";
import { Role } from "../auth/auth.interface";

export const registerUserZodSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name too short. Minimum 2 characters long." })
    .max(50, { message: "Name too long." })
    .refine((val) => typeof val === "string", {
      message: "Name must be a string",
    }),

  email: z.string().email("Invalid email address!!"),

  // 1 uppercase ,1 special character, 1 digit, 8 characters min
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 digit.",
    })
    .regex(/^(?=.*[!@#$%^&*(),.?":{}|<>])/, {
      message: "Password must contain at least 1 special character.",
    }),

  address: z
    .string()
    .refine((val) => typeof val === "string", {
      message: "Address must be a string",
    })
    .max(200, { message: "Address can't exceed 200 characters." })
    .optional(),

  phone: z.string().optional(),
});

// Update User zodSchema
export const updatedUserZodSchema = z.object({
  name: z
    .string()
    .refine((val) => typeof val === "string", {
      message: "Name must be a string",
    })
    .min(2, { message: "Name too short. Minimum 2 character long" })
    .max(50, { message: "Name too long" })
    .optional(),

  // 1 uppercase ,1 special character, 1 digit, 8 characters min
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 digit.",
    })
    .regex(/^(?=.*[!@#$%^&*(),.?":{}|<>])/, {
      message: "Password must contain at least 1 special character.",
    })
    .optional(),

  phone: z.string().optional(),

  role: z
    // enum(["ADMIN", "GUIDE", "USER", "SUPER_ADMIN"])
    .enum(Object.values(Role) as [string])
    .optional(),

  isActive: z
    .enum(["active", "inactive", "blocked"])
    .default("active")
    .optional(),

  isDelete: z
    .boolean()
    .refine((val) => typeof val === "boolean", {
      message: "isDelete must be true or false",
    })
    .optional(),

  isVerified: z
    .boolean({ message: "isVerified must be true or false" })
    .optional(),

  address: z
    .string()
    .refine((val) => typeof val === "string", {
      message: "Address must be string",
    })
    .max(200, { message: "Address can't exceed 200 characters." })
    .optional(),
});
