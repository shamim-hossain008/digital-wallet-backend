import bcrypt from "bcrypt";
import httpStatus from "http-status-codes";
import cloudinary from "../../config/cloudinary";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { IAuthJwtPayload } from "../../types/auth";
import { TransactionModel } from "../transaction/transaction.model";
import { WalletModel } from "../wallet/wallet.model";
import { IUser } from "./user.interface";
import { UserModel } from "./user.model";

const getAllUsers = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const filters: any = { isDeleted: false };

  // search by name or email
  if (query.search) {
    filters.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
    ];
  }

  // Status filter
  if (query.status === "blocked") {
    filters.isActive = "BLOCKED";
  } else if (query.status === "active") {
    filters.isActive = "ACTIVE";
  }

  const [users, total] = await Promise.all([
    UserModel.find(filters)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    UserModel.countDocuments(filters),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

const getUserProfile = async (id: string) => {
  const user = await UserModel.findById(id).select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
};

const updatedUser = async (
  userId: string,
  payload: Partial<IUser>,
  decodedToken: IAuthJwtPayload,
) => {
  const ifUserExist = await UserModel.findById(userId);

  if (!ifUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (payload.email) {
    throw new AppError(httpStatus.FORBIDDEN, "Email cannot be updated");
  }

  // Authorization checks (adjust Role enum checks to your app logic)
  if (payload.role === "USER" || decodedToken.role === "AGENT") {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  if (payload.role === "AGENT" && decodedToken.role === "ADMIN") {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  if (
    payload.isActive !== undefined ||
    payload.isDeleted !== undefined ||
    payload.isVerified !== undefined
  ) {
    if (decodedToken.role === "USER" || decodedToken.role === "AGENT") {
      throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
    }
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(
      payload.password,
      Number(envVars.BCRYPT_SALT_ROUND),
    );
  }

  const newUpdateUser = await UserModel.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).select("-password");

  return newUpdateUser;
};

const updateUserProfile = async (
  userId: string,
  payload: {
    name?: string;
    phone?: string;
    picture?: string | null;
    picturePublicId?: string | null;
  },
) => {
  const user = await UserModel.findById(userId).select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // remove old picture if new provided
  if (payload.picture && payload.picturePublicId && user.picturePublicId) {
    try {
      await cloudinary.uploader.destroy(user.picturePublicId);
    } catch (error) {
      console.error("Failed to remove old picture", error);
    }
  }

  if (payload.name !== undefined) user.name = payload.name;
  if (payload.phone !== undefined) user.phone = payload.phone;

  if (payload.picture !== undefined) {
    user.picture = payload.picture;
    user.picturePublicId = payload.picturePublicId ?? null;
  }

  await user.save();
  return user.toObject({ versionKey: false });
};

const removeUserPicture = async (userId: string) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (user.picturePublicId) {
    try {
      await cloudinary.uploader.destroy(user.picturePublicId);
    } catch (error) {
      console.error("Failed to remove picture:", error);
    }
  }

  user.picture = null;
  user.picturePublicId = null;

  await user.save();

  return user.toObject({ versionKey: false });
};

const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await UserModel.findById(userId).select("+password");

  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (!user.password) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User has no password set",
    );
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError(httpStatus.BAD_REQUEST, "Old password incorrect");
  }

  user.password = await bcrypt.hash(
    newPassword,
    Number(envVars.BCRYPT_SALT_ROUND),
  );
  await user.save();

  return null;
};

const getMe = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-password").lean();

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const wallet = await WalletModel.findOne({ user: userId }).lean();

  const recentTransactions = await TransactionModel.find({
    $or: [{ sender: userId }, { receiver: userId }],
  })
    .sort({ timestamp: -1 })
    .limit(5)
    .select("type amount status timestamp sender receiver")
    .populate({ path: "sender", select: "_id email role" })
    .populate({ path: "receiver", select: "_id email role" })
    .lean();

  return {
    ...user,
    walletBalance: wallet?.balance ?? 0,
    recentTransactions,
  };
};

const updatedMyProfile = async (
  userId: string,
  payload: Pick<IUser, "name" | "phone">,
) => {
  const user = await UserModel.findByIdAndUpdate(
    userId,
    {
      ...(payload.name && { name: payload.name }),
      ...(payload.phone && { phone: payload.phone }),
    },
    { new: true, runValidators: true },
  ).select("-password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const deleteUser = async (id: string) => {
  return UserModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
};

export const UserService = {
  getAllUsers,
  getUserProfile,
  updatedUser,
  updateUserProfile,
  removeUserPicture,
  changePassword,
  getMe,
  updatedMyProfile,
  deleteUser,
};
