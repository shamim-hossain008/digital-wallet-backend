import { Types } from "mongoose";
import { IAuthUser } from "./auth.interface";
export declare const AuthService: {
    register: (payload: IAuthUser) => Promise<import("mongoose").Document<unknown, {}, import("../user/user.interface").IUser, {}, {}> & import("../user/user.interface").IUser & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    login: (email: string, password: string) => Promise<{
        accessToken: string;
        refreshToken: string;
        user: import("mongoose").Document<unknown, {}, import("../user/user.interface").IUser, {}, {}> & import("../user/user.interface").IUser & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
    }>;
    approveAgent: (agentId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../user/user.interface").IUser, {}, {}> & import("../user/user.interface").IUser & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    suspendAgent: (agentId: string) => Promise<(import("mongoose").Document<unknown, {}, import("../user/user.interface").IUser, {}, {}> & import("../user/user.interface").IUser & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
};
//# sourceMappingURL=auth.service.d.ts.map