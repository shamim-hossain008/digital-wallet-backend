import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { IAuthJwtPayload } from "../../types/auth";
import { FilterType } from "../../types/filterType";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AgentService } from "./agent.service";

const getAgentDashboard = catchAsync(async (req: Request, res: Response) => {
  const agentId = (req.user as IAuthJwtPayload).sub;

  const filter = (req.query.filter as FilterType) || "all";
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const dashboard = await AgentService.getAgentDashboard(
    agentId,
    filter,
    page,
    limit,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent dashboard retrieved retrieved. successfully",
    data: dashboard,
  });
});

// All agent Transactions
const getAgentTransactions = catchAsync(async (req: Request, res: Response) => {
  const agentId = (req.user as IAuthJwtPayload).sub;

  const filter = req.query.filter as FilterType;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const search = String(req.query.search) || "";

  const result = await AgentService.getAgentTransactions(
    agentId,
    filter,
    page,
    limit,
    search,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent transactions retrieved successfully",
    data: result,
  });
});

// cash-in
const cashIn = catchAsync(async (req: Request, res: Response) => {
  const agentId = (req.user as IAuthJwtPayload).sub;
  const { identifier, amount } = req.body;

  const result = await AgentService.cashIn(agentId, identifier, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cash in successful",
    data: result,
  });
});

// cash-out
const cashOut = catchAsync(async (req: Request, res: Response) => {
  const agentId = (req.user as IAuthJwtPayload).sub;
  const { identifier, amount } = req.body;

  const result = await AgentService.cashOut(agentId, identifier, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cash out successful",
    data: result,
  });
});

// get agent profile
const getAgentProfile = catchAsync(async (req, res) => {
  const agentId = (req.user as IAuthJwtPayload).sub;

  const profile = await AgentService.getAgentProfile(agentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: profile,
  });
});

// updatedAgentProfile
const updatedAgentProfile = catchAsync(async (req, res) => {
  const agentId = (req.user as IAuthJwtPayload).sub;

  const payload = {
    ...req.body,
    picture: req.file?.path,
    picturePublicId: req.file?.filename,
  };

  const result = await AgentService.updateAgentProfile(agentId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

// Remove Agent picture
const removeAgentPicture = catchAsync(async (req: Request, res: Response) => {
  const agentId = (req.user as IAuthJwtPayload).sub;
  const result = await AgentService.removeAgentPicture(agentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile picture removed successfully",
    data: result,
  });
});

// updated password
const changeAgentPassword = catchAsync(async (req, res) => {
  const agentId = (req.user as IAuthJwtPayload).sub;

  const { oldPassword, newPassword } = req.body;

  await AgentService.changeAgentPassword(agentId, oldPassword, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password change successfully",
    data: null,
  });
});

export const AgentController = {
  getAgentDashboard,
  getAgentTransactions,
  getAgentProfile,
  updatedAgentProfile,
  removeAgentPicture,
  changeAgentPassword,
  cashIn,
  cashOut,
};
