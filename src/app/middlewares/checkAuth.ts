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
      // Accept token from Authorization header or cookie fallback
      const authHeader = String(req.headers.authorization || "");
      const cookieToken =
        (req.cookies && (req.cookies.accessToken || req.cookies.token)) ||
        undefined;

      // Token Logs
      if (!authHeader && !cookieToken) {
        console.log("❌ No token provided (header or cookie");
        return next(new AppError(httpStatus.FORBIDDEN, "No token received"));
      }

      const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : authHeader || cookieToken;
      if (!token) {
        console.log("Token missing after parsing header/cookie");
        return next(
          new AppError(httpStatus.UNAUTHORIZED, "Authentication required"),
        );
      }

      console.log(
        "checkAuth: token present (first 10 chars):",
        token.slice(0, 10) + "...",
      );

      // const accessToken = authHeader?.split(" ")[1];
      // console.log("Access Token:", accessToken);

      // if (!accessToken) {
      //   console.log("❌ Authorization header exists but token missing");

      //   throw new AppError(
      //     httpStatus.FORBIDDEN,
      //     "Invalid authorization format",
      //   );
      // }

      // verify token and handle verification error explicitly
      let decoded;

      try {
        decoded = verifyToken(
          token,
          envVars.JWT_ACCESS_SECRET as string,
        ) as IAuthJwtPayload;

        console.log("checkAuth: token decoded:", {
          sub: decoded.sub,
          role: decoded.role,
          exp: decoded.exp,
        });
      } catch (err: any) {
        console.error("checkAuth: jwt.verify error:", err?.message || err);
        // Provide a clear 401 for invalid/expired tokens
        return next(
          new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired token"),
        );
      }

      console.log("✅ Token Decoded:", decoded);

      // Check Required
      if (!decoded?.sub) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token payload");
      }

      req.user = decoded as any
      // Load user and run basic checks
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
          `User is ${isUserExist.isActive}`,
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

      // Role check if roles provided
      if (
        authRoles.length > 0 &&
        decoded.role &&
        !authRoles.includes(decoded.role)
      ) {
        throw new AppError(
          httpStatus.FORBIDDEN,
          "You are not permitted to view this route!!!!!!!",
        );
      }

      req.user = decoded as any;
      return next();
    } catch (err) {
      console.error("checkAuth unexpected error:", err);
      return next(
        new AppError(httpStatus.UNAUTHORIZED, "Authentication required"),
      );
    }
  };
