"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatedUserZodSchema = exports.registerUserZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const auth_interface_1 = require("../auth/auth.interface");
exports.registerUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string()
        .min(2, { message: "Name too short. Minimum 2 characters long." })
        .max(50, { message: "Name too long." })
        .refine((val) => typeof val === "string", {
        message: "Name must be a string",
    }),
    email: zod_1.default.string().email("Invalid email address!!"),
    // 1 uppercase ,1 special character, 1 digit, 8 characters min
    password: zod_1.default
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
    role: zod_1.default
        // enum(["ADMIN", "GUIDE", "USER", "SUPER_ADMIN"])
        .enum(Object.values(auth_interface_1.Role))
        .optional(),
    address: zod_1.default
        .string()
        .refine((val) => typeof val === "string", {
        message: "Address must be a string",
    })
        .max(200, { message: "Address can't exceed 200 characters." })
        .optional(),
    phone: zod_1.default.string().optional(),
});
// Update User zodSchema
exports.updatedUserZodSchema = zod_1.default.object({
    name: zod_1.default
        .string()
        .refine((val) => typeof val === "string", {
        message: "Name must be a string",
    })
        .min(2, { message: "Name too short. Minimum 2 character long" })
        .max(50, { message: "Name too long" })
        .optional(),
    // 1 uppercase ,1 special character, 1 digit, 8 characters min
    password: zod_1.default
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
    phone: zod_1.default.string().optional(),
    role: zod_1.default
        // enum(["ADMIN", "GUIDE", "USER", "SUPER_ADMIN"])
        .enum(Object.values(auth_interface_1.Role))
        .optional(),
    isActive: zod_1.default
        .enum(["active", "inactive", "blocked"])
        .default("active")
        .optional(),
    isDelete: zod_1.default
        .boolean()
        .refine((val) => typeof val === "boolean", {
        message: "isDelete must be true or false",
    })
        .optional(),
    isVerified: zod_1.default
        .boolean({ message: "isVerified must be true or false" })
        .optional(),
    address: zod_1.default
        .string()
        .refine((val) => typeof val === "string", {
        message: "Address must be string",
    })
        .max(200, { message: "Address can't exceed 200 characters." })
        .optional(),
});
//# sourceMappingURL=user.validation.js.map