"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = require("mongoose");
const auth_interface_1 = require("../auth/auth.interface");
const user_interface_1 = require("./user.interface");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: Object.values(auth_interface_1.Role), default: auth_interface_1.Role.USER },
    phone: { type: String },
    picture: { type: String },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
        type: String,
        enum: Object.values(user_interface_1.IsActive),
        default: user_interface_1.IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
}, {
    timestamps: true,
    versionKey: false,
});
exports.UserModel = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=user.model.js.map