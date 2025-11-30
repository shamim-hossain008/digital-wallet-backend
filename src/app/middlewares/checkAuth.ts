import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/appError";
import { IsActive } from "../modules/user/user.interface";
import { UserModel } from "../modules/user/user.model";
import { verifyToken } from "../utils/jwt";

export const checkAuth =
  (...authRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    //for testing
    console.log("====================================");
    console.log("🔐 CHECK AUTH MIDDLEWARE TRIGGERED");
    console.log("URL:", req.method, req.originalUrl);

    console.log("Headers:", req.headers);
    console.log("Authorization Header:", req.headers.authorization);

    try {
      const authHeader = req.headers.authorization;

      // Token Logs
      if (!authHeader) {
        console.log("❌ No Authorization header found");
        throw new AppError(httpStatus.FORBIDDEN, "No token received");
      }

      const accessToken = authHeader?.split(" ")[1]; // Extract token
      console.log("Access Token:", accessToken);

      if (!accessToken) {
        console.log("❌ Authorization header exists but token missing");

        throw new AppError(httpStatus.FORBIDDEN, "No token received");
      }
      const verifiedToken = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as JwtPayload;

      console.log("✅ Token Decoded:", verifiedToken);

      // const isUserExist = await UserModel.findOne({
      //   email: verifiedToken.email,
      // });
      const isUserExist = await UserModel.findById(verifiedToken.UserId);
      // console.log("user found", isUserExist);
      // const isUserExist = await UserModel.findById(verifiedToken.id);

      if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "User dose not exist");
      }
      if (!isUserExist.isVerified) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
      }

      if (
        isUserExist.isActive === IsActive.BLOCKED ||
        isUserExist.isActive === IsActive.INACTIVE
      ) {
        throw new AppError(
          httpStatus.BAD_REQUEST,
          `User is ${isUserExist.isActive}`
        );
      }

      if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
      }

      {
        if (isUserExist.role === "AGENT" && isUserExist.isSuspended) {
          throw new AppError(httpStatus.FORBIDDEN, "Agent is suspended");
        }
      }

      if (!authRoles.includes(verifiedToken.role)) {
        throw new AppError(
          403,
          "You are not permitted to view this route!!!!!!!"
        );
      }

      req.user = verifiedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
