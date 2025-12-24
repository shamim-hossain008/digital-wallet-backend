import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AgentService } from "./agent.service";
import { IAuthJwtPayload } from "../../types/auth";

const getAgentDashboard = catchAsync(async (req: Request, res: Response) => {
  const agentId = (req.user as IAuthJwtPayload).sub;

  const dashboard = await AgentService.getAgentDashboard(agentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agent dashboard retrieved retrieved. successfully",
    data: dashboard,
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
  const agentId = (req.user as JwtPayload).id;
  const { identifier, amount } = req.body;

  const result = await AgentController.cashOut(agentId, identifier, amount);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Cash out successful",
    data: result,
  });
});
export const AgentController = {
  getAgentDashboard,
  cashIn,
  cashOut,
};
