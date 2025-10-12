import { JwtPayload } from "jsonwebtoken";
import { IUser } from "./user.interface";
export declare const UserService: {
    getAllUsers: () => Promise<IUser[]>;
    getSingleUser: (id: string) => Promise<{
        data: (import("mongoose").Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
    updatedUser: (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => Promise<(import("mongoose").Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    deleteUser: (id: string) => Promise<IUser | null>;
    getMe: (userId: string) => Promise<{
        data: (import("mongoose").Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        }) | null;
    }>;
};
//# sourceMappingURL=user.service.d.ts.map