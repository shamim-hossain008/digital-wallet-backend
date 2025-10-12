"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModel = void 0;
const mongoose_1 = require("mongoose");
const transaction_interface_1 = require("./transaction.interface");
const TransactionSchema = new mongoose_1.Schema({
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    commission: { type: Number },
    type: {
        type: String,
        enum: Object.values(transaction_interface_1.TransactionType),
        required: true,
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED"],
        default: "COMPLETED",
    },
    timestamp: { type: Date, default: Date.now },
}, {
    timestamps: true,
    versionKey: false,
});
exports.TransactionModel = (0, mongoose_1.model)("Transaction", TransactionSchema);
//# sourceMappingURL=transaction.model.js.map