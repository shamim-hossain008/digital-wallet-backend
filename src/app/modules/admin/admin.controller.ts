import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { Parser } from "json2csv";
import { IAuthJwtPayload } from "../../types/auth";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminService } from "./admin.service";

const getAdminDashboard = catchAsync(async (req: Request, res: Response) => {
  const data = await AdminService.getAdminDashboard();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin dashboard data retrieved",
    data,
  });
});

const getAdminSummary = catchAsync(async (req: Request, res: Response) => {
  const summary = await AdminService.getAdminSummary();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin summary retrieved",
    data: summary,
  });
});

/* ================= AGENTS ================= */
const getAllAgents = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, status } = req.query;

  const agents = await AdminService.getAllAgents({
    page: Number(page),
    limit: Number(limit),
    search: search as string,
    status: status as string,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Agents retrieved successfully",
    data: agents.data,
    meta: agents.meta,
  });
});

// commission Summary

const getCommissionSummary = catchAsync(async (req: Request, res: Response) => {
  const { fromDate, toDate, status, page, limit } = req.query;

  const payouts = await AdminService.getCommissionSummary(
    fromDate as string,
    toDate as string,
    status as string,
    Number(page) || 1,
    Number(limit) || 10,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Commission  summary retrieved",
    data: payouts,
  });
});

// CSV Export

const exportCommissionCSV = catchAsync(async (req: Request, res: Response) => {
  const { fromDate, toDate, status } = req.query as {
    fromDate?: string;
    toDate?: string;
    status?: string;
  };

  const payouts = await AdminService.getCommissionSummary(
    fromDate,
    toDate,
    status,
    1,
    10000,
  );

  const parser = new Parser();
  const csv = parser.parse(payouts.payouts);

  res.header("Content-Type", "text/csv");
  res.attachment("commission_payouts.csv");
  res.send(csv);
});

// Pay commission
const payCommission = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req.user as IAuthJwtPayload).sub;
  const { agentId, amount, fromDate, toDate } = req.body;

  const payout = await AdminService.createCommissionPayout({
    agentId,
    amount,
    fromDate,
    toDate,
    adminId,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Commission payout created",
    data: payout,
  });
});

const getCommissionHistory = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query;

  const history = await AdminService.getCommissionHistory(
    Number(page),
    Number(limit),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Commission history retrieved",
    data: history,
  });
});

const toggleUserBlock = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const user = await AdminService.toggleUserBlock(userId as string, isActive);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User ${
      isActive === "ACTIVE" ? "unblocked" : "blocked"
    } successfully`,
    data: user,
  });
});
// get Admin Profile
const getAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req.user as IAuthJwtPayload).sub;
  const result = await AdminService.getAdminProfile(adminId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin profile fetched",
    data: result,
  });
});

// Updated Admin Profile
const updatedAdminProfile = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req.user as IAuthJwtPayload).sub;

  // multer-storage-cloudinary provides:
  // req.file.path -> secure_url
  // req.file.filename -> public_id
  const payload = {
    ...req.body,
    picture: req.file?.path,
    picturePublicId: req.file?.filename,
  };

  const result = await AdminService.updatedAdminProfile(adminId, payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

// Remove Admin Picture
const removeAdminPicture = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req.user as IAuthJwtPayload).sub;
  const result = await AdminService.removeAdminPicture(adminId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile picture removed successfully",
    data: result,
  });
});

// change password
const changeAdminPassword = catchAsync(async (req: Request, res: Response) => {
  const adminId = (req.user as IAuthJwtPayload).sub;

  const { oldPassword, newPassword } = req.body;

  await AdminService.changeAdminPassword(adminId, oldPassword, newPassword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: null,
  });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;

  const user = await AdminService.updateUserRole(userId as string, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User role updated to ${role}`,
    data: user,
  });
});
export const AdminController = {
  getAdminSummary,
  getCommissionSummary,
  exportCommissionCSV,
  payCommission,
  getCommissionHistory,
  getAdminDashboard,
  getAllAgents,
  toggleUserBlock,
  updatedAdminProfile,
  updateUserRole,
  getAdminProfile,
  removeAdminPicture,
  changeAdminPassword,
};
