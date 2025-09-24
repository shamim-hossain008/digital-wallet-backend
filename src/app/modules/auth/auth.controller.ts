import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

const register = catchAsync(async (req: Request, res: Response) => {
  const user = await AuthService.register(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "User registered successfully",
    data: user,
  });
});
const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await AuthService.login(email, password);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Login successfully",
    data: result,
  });
});

export const AuthController = {
  register,
  login,
};
