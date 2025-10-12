import { Types } from "mongoose";
import { Role } from "../auth/auth.interface";
export declare enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}
export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    picture?: string;
    address?: string;
    isDeleted?: boolean;
    isActive?: IsActive;
    isVerified?: boolean;
    isSuspended?: boolean;
    isApproved?: boolean;
    role: Role;
}
//# sourceMappingURL=user.interface.d.ts.map