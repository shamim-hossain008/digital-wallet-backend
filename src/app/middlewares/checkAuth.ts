import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/appError";
import { IsActive } from "../modules/user/user.interface";
import { UserModel } from "../modules/user/user.model";
import { IAuthJwtPayload } from "../types/auth";
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

        throw new AppError(
          httpStatus.FORBIDDEN,
          "Invalid authorization format"
        );
      }

      const decoded = verifyToken(
        accessToken,
        envVars.JWT_ACCESS_SECRET
      ) as IAuthJwtPayload;

      console.log("✅ Token Decoded:", decoded);

      // Check Required
      if (!decoded.sub || !decoded.role) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
      }

      const isUserExist = await UserModel.findById(decoded.sub);

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

      if (authRoles.length > 0 && !authRoles.includes(decoded.role)) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not permitted to view this route!!!!!!!"
        );
      }

      req.user = decoded as any;
      next();
    } catch (error) {
      next(error);
    }
  };
