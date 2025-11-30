import { IUser } from "../modules/user/user.interface";
export declare const createUserTokens: (user: Partial<IUser>) => {
    accessToken: string;
    refreshToken: string;
};
/**
 * Verify refresh token and generate a NEW access token
 */
export declare const createNewAccessTokenWithRefreshToken: (refreshToken: string) => Promise<string>;
//# sourceMappingURL=userTokens.d.ts.map