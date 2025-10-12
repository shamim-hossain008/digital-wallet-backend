"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferSchema = exports.withdrawSchema = exports.depositSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.depositSchema = zod_1.default.object({
    amount: zod_1.default.number().positive("Amount must be greater than zero"),
});
exports.withdrawSchema = zod_1.default.object({
    amount: zod_1.default.number().positive("Amount must be greater then zero"),
});
exports.transferSchema = zod_1.default.object({
    receiverId: zod_1.default.string().length(24, "Invalid receiver ID"),
    amount: zod_1.default.number().positive("Amount must be greater then zero"),
});
//# sourceMappingURL=transaction.validation.js.map