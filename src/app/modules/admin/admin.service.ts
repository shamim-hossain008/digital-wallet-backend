import bcrypt from "bcrypt";
import httpStatus from "http-status-codes";
import cloudinary from "../../config/cloudinary";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { transactionsType } from "../../types/transaction.types";
import { Role } from "../auth/auth.interface";
import { CommissionPayoutModel } from "../commission/commissionPayout.model";
import { TransactionModel } from "../transaction/transaction.model";
import { IsActive } from "../user/user.interface";
import { UserModel } from "../user/user.model";
import { WalletModel } from "../wallet/wallet.model";

const getAdminDashboard = async () => {
  const [totalUsers, totalAgents, totalTransactions] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ role: "AGENT" }),
    TransactionModel.countDocuments(),
  ]);

  // Total Volume:sum of all transactions amount
  const totalVolumeAgg = await TransactionModel.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const totalVolume = totalVolumeAgg[0]?.total || 0;

  // Transaction trend(group by day of week)
  const trendAgg = await TransactionModel.aggregate([
    {
      $group: {
        _id: { $dayOfWeek: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const transactionTrend = trendAgg.map((t) => ({
    name: dayNames[t._id - 1],
    count: t.count,
  }));

  //  Volume breakdown by type
  const volumeAgg = await TransactionModel.aggregate([
    {
      $group: {
        _id: "$type",
        value: { $sum: "$amount" },
      },
    },
  ]);

  const volumeData = volumeAgg.map((v) => ({
    name: v._id,
    value: v.value,
  }));

  // Status distribution
  const statusAgg = await TransactionModel.aggregate([
    {
      $group: {
        _id: "$status",
        value: { $sum: 1 },
      },
    },
  ]);
  const statusData = statusAgg.map((s) => ({
    name: s._id,
    value: s.value,
  }));

  return {
    totalUsers,
    totalAgents,
    totalTransactions,
    totalVolume,
    transactionTrend,
    volumeData,
    statusData,
  };
};

const getAdminSummary = async () => {
  // Total Counts
  const totalUsers = await UserModel.countDocuments();
  const totalAgents = await UserModel.countDocuments({ role: "AGENT" });
  const totalTransactions = await TransactionModel.countDocuments();

  // Transaction type breakdown
  const counts = await Promise.all(
    transactionsType.map(async (type) => ({
      type,
      count: await TransactionModel.countDocuments({ type }),
    })),
  );

  // Transaction volume
  const totalVolumeAgg = await TransactionModel.aggregate([
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  // Pending commissions
  const pendingCommissions = await CommissionPayoutModel.countDocuments({
    status: "pending",
  });

  // Build summary object
  const summary: Record<string, number> = {
    totalUsers,
    totalAgents,
    totalTransactions,
    totalVolume: totalVolumeAgg[0]?.total || 0,
    pendingCommissions,
  };

  counts.forEach(({ type, count }) => {
    summary[`total_${type.toLocaleLowerCase()}`] = count;
  });

  return summary;
};

/* ================= AGENTS ================= */
const getAllAgents = async ({
  page = 1,
  limit = 10,
  search,
  status,
}: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const query: any = { role: "AGENT" };
  if (search) query.name = { $regex: search, $options: "i" };

  if (status) {
    query.isActive = status;
  }

  const agents = await UserModel.find(query)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await UserModel.countDocuments(query);

  return {
    data: agents,
    meta: { page, limit, total },
  };
};

// Commission Summary(unpaid only)
const getCommissionSummary = async (
  fromDate?: string,
  toDate?: string,
  status?: string,
  page: number = 1,
  limit: number = 10,
) => {
  const matchStage: any = {
    type: { $in: ["CASH_IN", "CASH_OUT"] },
  };

  if (fromDate && toDate) {
    matchStage.createdAt = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  }

  if (status) {
    matchStage.status = status;
  }

  const skip = (page - 1) * limit;

  const [payouts, totalCount] = await Promise.all([
    TransactionModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$sender",
          totalCommission: { $sum: "$commission" },
          transactionCount: { $sum: 1 },
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "agent",
        },
      },
      { $unwind: "$agent" },

      //  lookup commission payouts
      {
        $lookup: {
          from: "commissionpayouts",
          localField: "_id",
          foreignField: "agent",
          as: "payoutRecords",
        },
      },
      {
        $addFields: {
          isPaid: {
            $anyElementTrue: {
              $map: {
                input: "$payoutRecords",
                as: "p",
                in: { $eq: ["$$p.status", "PAID"] },
              },
            },
          },
        },
      },
      {
        $match: {
          isPaid: { $ne: true },
        },
      },
      {
        $project: {
          _id: 0,
          agentId: "$agent._id",
          name: "$agent.name",
          email: "$agent.email",
          totalCommission: 1,
          transactionCount: 1,
          isPaid: 1,
        },
      },
    ]),

    TransactionModel.aggregate([
      { $match: matchStage },
      { $group: { _id: "$sender" } },
      { $count: "total" },
    ]),
  ]);

  return {
    total: totalCount[0]?.total || 0,
    page,
    limit,
    payouts,
  };
};

// Create CommissionPayout '

const createCommissionPayout = async (payload: {
  agentId: string;
  amount: number;
  fromDate?: string;
  toDate?: string;
  adminId: string;
}) => {
  // Prevent double payment (same agent + same date range)
  const existing = await CommissionPayoutModel.findOne({
    agent: payload.agentId,
    fromDate: payload.fromDate,
    toDate: payload.toDate,
    status: "PAID",
  });

  if (existing) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Commission already paid for this period",
    );
  }

  return CommissionPayoutModel.create({
    agent: payload.agentId,
    amount: payload.amount,
    fromDate: payload.fromDate,
    toDate: payload.toDate,
    status: "PAID",
    paidAt: new Date(),
    paidBy: payload.adminId,
  });
};

const getCommissionHistory = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    CommissionPayoutModel.find()
      .populate("agent", "name email")
      .populate("paidBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    CommissionPayoutModel.countDocuments(),
  ]);

  return { data: records, page, limit, total };
};

const toggleUserBlock = async (
  userId: string,
  isActive: "ACTIVE" | "INACTIVE",
) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { isActive },
    { new: true },
  );

  if (!user) {
    throw new AppError(httpStatus.BAD_GATEWAY, "User not found");
  }

  // updated wallet block status base on user status
  await WalletModel.findOneAndUpdate(
    {
      user: user._id,
    },
    { isBlocked: isActive === IsActive.INACTIVE },
    { new: true },
  );

  return user;
};

// Get Admin Profile
const getAdminProfile = async (adminId: string) => {
  const admin = await UserModel.findById(adminId).select("-password");

  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }
  return admin;
};
// Admin updated profile
const updatedAdminProfile = async (
  adminId: string,
  payload: {
    name?: string;
    phone?: string;
    picture?: string;
    picturePublicId?: string;
  },
) => {
  const admin = await UserModel.findById(adminId).select("-password");

  if (!admin) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }

  // new picture provided, remove old
  if (payload.picture && payload.picturePublicId && admin.picturePublicId) {
    try {
      await cloudinary.uploader.destroy(admin.picturePublicId);
    } catch (error) {
      console.error("Failed to remove old picture:", error);
    }
  }

  if (payload.name !== undefined) {
    admin.name = payload.name;
  }

  if (payload.phone !== undefined) {
    admin.phone = payload.phone;
  }

  if (payload.picture && payload.picturePublicId) {
    admin.picture = payload.picture;
    admin.picturePublicId = payload.picturePublicId;
  }

  await admin.save();
  return admin.toObject({ versionKey: false });
};

// removeAdminPicture
const removeAdminPicture = async (adminId: string) => {
  const admin = await UserModel.findById(adminId);
  if (!admin) throw new AppError(httpStatus.NOT_FOUND, "Admin not found");

  if (admin.picturePublicId) {
    try {
      await cloudinary.uploader.destroy(admin.picturePublicId);
    } catch (error) {
      console.error("Failed to remove picture:", error);
    }
  }

  admin.picture = null;
  admin.picturePublicId = null;
  await admin.save();

  return admin.toObject({ versionKey: false });
};

const changeAdminPassword = async (
  adminId: string,
  oldPassword: string,
  newPassword: string,
) => {
  const admin = await UserModel.findById(adminId).select("+password");
  if (!admin) throw new AppError(httpStatus.NOT_FOUND, "Admin not found ");
  if (!admin.password) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Admin has no password set",
    );
  }

  const isMatch = await bcrypt.compare(oldPassword, admin.password);
  if (!isMatch)
    throw new AppError(httpStatus.BAD_REQUEST, "Old password incorrect");

  admin.password = await bcrypt.hash(newPassword, envVars.BCRYPT_SALT_ROUND);

  await admin.save();

  return null;
};

const updateUserRole = async (userId: string, role: Role) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { role },
    { new: true },
  );
  return user;
};

export const AdminService = {
  getAdminDashboard,
  getAdminSummary,
  getAllAgents,
  getCommissionSummary,
  createCommissionPayout,
  getCommissionHistory,
  toggleUserBlock,
  updateUserRole,
  getAdminProfile,
  updatedAdminProfile,
  removeAdminPicture,
  changeAdminPassword,
};
