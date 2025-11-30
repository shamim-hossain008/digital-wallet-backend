import { Response } from "express";

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  const isProduction = process.env.NODE_ENV === "production";

  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
};
