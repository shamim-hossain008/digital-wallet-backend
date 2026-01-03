import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import passport from "passport";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { catchAsync } from "../../utils/catchAsync";
import { logAction } from "../../utils/logger";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserTokens } from "../../utils/userTokens";
import { IUser } from "../user/user.interface";

import { IAuthJwtPayload } from "../../types/auth";
import { AuthService } from "./auth.service";

const register = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.register(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: user,
  });
});

// const login = catchAsync(async (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   console.log("Login request body:", req.body);

//   const result = await AuthService.login(email, password);

//   // res.cookie("refreshToken", result.refreshToken, {
//   //   httpOnly: true,
//   //   secure: false,
//   //   sameSite: "lax",
//   // });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "Login successfully",
//     data: result,
//   });
// });

// *****

const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return next(new AppError(401, err));
      }

      if (!user) {
        return next(new AppError(401, info.message || "Unauthorized"));
      }

      const userTokens = await createUserTokens({
        _id: user._id,
        role: user.role,
      });

      const rest = user;

      setAuthCookie(res, userTokens);

      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User Logged in Successfully",
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
        },
      });
    })(req, res, next);
  }
);

// New accessToken
const getNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) { 
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "No refresh token received from cookies"
      );
    }
    const tokenInfo = await AuthService.getNewAccessToken(
      refreshToken as string
    );

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "New Access Token Received Successfully",
      data: tokenInfo,
    });
  }
);

const googleCallbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? (req.query.state as string) : "";

    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
    }

    const user = req.user as IUser | undefined;

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }
    if (!user._id) {
      // Runtime fallback for TypeScript safety
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "User ID missing");
    }

    const tokenInfo = await createUserTokens({
      _id: user._id,
      role: user.role,
    });

    setAuthCookie(res, tokenInfo);

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
  }
);

// user logout

const logout = catchAsync(async (req: Request, res: Response) => {
  // Clear access token cookie
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  // Clear refresh token cooke
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Logged Out Successfully",
    data: null,
  });
});

// ADMIN – APPROVE AGENT

const approveAgent = catchAsync(async (req: Request, res: Response) => {
  const agentId = req.params.id;
  if (!agentId)
    throw new AppError(httpStatus.BAD_REQUEST, "Agent ID is required");

  // Safe user id extraction
  const userId =
    (req.user as IAuthJwtPayload)?.sub || (req.user as IUser)?._id?.toString();

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid user");
  }

  const agent = await AuthService.approveAgent(agentId);
  logAction("Agent approved", userId, { target: agentId });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent approved",
    data: agent,
  });
});

// ADMIN – SUSPEND AGENT

const suspendAgent = catchAsync(async (req: Request, res: Response) => {
  const agentId = req.params.id;

  if (!agentId)
    throw new AppError(httpStatus.BAD_REQUEST, "Agent ID is required");

  const userId =
    (req.user as IAuthJwtPayload)?.sub || (req.user as IUser)?._id?.toString();

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid user");
  }

  const agent = await AuthService.suspendAgent(agentId);

  logAction("Agent suspended", userId, { target: agentId });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent suspended",
    data: agent,
  });
});

export const AuthController = {
  register,
  // login,
  logout,
  approveAgent,
  suspendAgent,
  credentialsLogin,
  getNewAccessToken,
  googleCallbackController,
};
