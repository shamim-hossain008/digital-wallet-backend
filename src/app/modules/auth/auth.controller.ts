import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import passport from "passport";
import AppError from "../../errorHelpers/appError";
import { catchAsync } from "../../utils/catchAsync";
import { logAction } from "../../utils/logger";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setCookie";
import { createUserTokens } from "../../utils/userTokens";
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

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log("Login request body:", req.body);

  const result = await AuthService.login(email, password);

  // res.cookie("refreshToken", result.refreshToken, {
  //   httpOnly: true,
  //   secure: false,
  //   sameSite: "lax",
  // });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successfully",
    data: result,
  });
});

// *****
const credentialsLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return next(new AppError(401, err));
      }

      if (!user) {
        return next(new AppError(401, info.message));
      }

      const userTokens = await createUserTokens(user);

      const { password: pass, ...rest } = user.toObject();

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
const getNewAccessToken = catchAsync(async(req:Request, res:Response, next: NextFunction)=>{
  const refreshToken = req.cookies.refreshToken 
  if(!refreshToken){
    throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received from cookies")
  }
  const tokenInfo = await AuthService.getNewAccessToken(refreshToken as string)

  setAuthCookie(res,tokenInfo) 

  sendResponse(res,{
    success:true,
    statusCode:httpStatus.OK,
    message:"New Access Token Received Successfully",
    data:tokenInfo
  })
})

// user logout

const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
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
  }
);

const approveAgent = catchAsync(async (req: Request, res: Response) => {
  const agentId = req.params.id;
  if (!agentId)
    throw new AppError(httpStatus.BAD_REQUEST, "Agent ID is required");

  const agent = await AuthService.approveAgent(agentId);
  logAction("Agent approved", req.user!.userId, { target: agentId });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent approved",
    data: agent,
  });
});

const suspendAgent = catchAsync(async (req: Request, res: Response) => {
  const agentId = req.params.id;

  if (!agentId)
    throw new AppError(httpStatus.BAD_REQUEST, "Agent ID is required");
  const agent = await AuthService.suspendAgent(agentId);
  logAction("Agent suspended", req.user!.userId, { target: agentId });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent suspended",
    data: agent,
  });
});

export const AuthController = {
  register,
  login,
  logout,
  approveAgent,
  suspendAgent,
  credentialsLogin,
};
