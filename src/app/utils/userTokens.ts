import httpStatus from "http-status-codes";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/appError";
import { IsActive, IUser } from "../modules/user/user.interface";
import { UserModel } from "../modules/user/user.model";
import { IAuthJwtPayload } from "../types/auth";
import { generateToken, verifyToken } from "./jwt";

export const createUserTokens = (user: IUser) => {
  const payload: IAuthJwtPayload = {
    sub: user._id.toString(),
    role: user.role,
  };

  // Access Token
  const accessToken = generateToken(
    payload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  // Refresh Token (⚠ uses REFRESH secret)
  const refreshToken = generateToken(
    payload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES
  );

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Verify refresh token and generate a NEW access token
 */
export const createNewAccessTokenWithRefreshToken = async (
  refreshToken: string
) => {
  const decoded = verifyToken(
    refreshToken,
    envVars.JWT_REFRESH_SECRET
  ) as IAuthJwtPayload;

  if (!decoded.sub) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  const existingUser = await UserModel.findById(decoded.sub);

  if (!existingUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
  }

  if (
    existingUser.isActive === IsActive.BLOCKED ||
    existingUser.isActive === IsActive.INACTIVE
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `User is ${existingUser.isActive}`
    );
  }

  if (existingUser.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
  }

  const payload: IAuthJwtPayload = {
    sub: existingUser._id.toString(),

    role: existingUser.role,
  };

  // New Access Token (⚠ correct expiry)
  const newAccessToken = generateToken(
    payload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  return newAccessToken;
};
