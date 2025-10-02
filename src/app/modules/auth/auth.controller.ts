import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
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

  const result = await AuthService.login(email, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successfully",
    data: result,
  });
});

const approveAgent = catchAsync(async (req: Request, res: Response) => {
  const agentId = req.params.id;
  if (!agentId)
    throw new AppError(httpStatus.BAD_REQUEST, "Agent ID is required");

  const agent = await AuthService.approveAgent(agentId);

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
  approveAgent,
  suspendAgent,
};
