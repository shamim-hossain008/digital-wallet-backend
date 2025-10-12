"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWalletSchema = exports.createWalletSchema = void 0;
const zod_1 = require("zod");
exports.createWalletSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "User ID is required"),
});
exports.updateWalletSchema = zod_1.z.object({
    balance: zod_1.z.number().optional(),
    isBlocked: zod_1.z.boolean().optional(),
});
//# sourceMappingURL=wallet.validation.js.map