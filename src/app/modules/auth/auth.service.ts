import bcrypt from "bcryptjs";
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/appError";
import { generateToken } from "../../utils/jwt";
import { createNewAccessTokenWithRefreshToken } from "../../utils/userTokens";
import { UserModel } from "../user/user.model";
import { WalletModel } from "../wallet/wallet.model";
import { WalletService } from "../wallet/wallet.service";
import { IAuthUser } from "./auth.interface";

const getNewAccessToken = async (refreshToken: string) => {
  const newAccessToken = await createNewAccessTokenWithRefreshToken(
    refreshToken
  );

  return {
    accessToken: newAccessToken,
  };
};

// REGISTER USER

const register = async (payload: IAuthUser) => {
  const isUserExist = await UserModel.findOne({ email: payload.email });
  if (isUserExist) {
    throw new AppError(httpStatus.CONFLICT, "Email already registered");
  }
  const saltRounds = parseInt(envVars.BCRYPT_SALT_ROUND);
  const hashedPassword = await bcrypt.hash(payload.password, saltRounds);

  const user = await UserModel.create({ ...payload, password: hashedPassword });

  //   todo
  //  created wallet with 50tk bonus balance
  if (user.role === "USER" || user.role === "AGENT") {
    await WalletService.createWallet(user._id.toString());
  }

  return user;
};

//LOGIN USER (Email + Password)

const login = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email });

  if (!user) throw new Error("User not found");

  if (!user.password) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "User password is missing"
    );
  }
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) throw new Error("Invalid credentials");

  const payload = {
    sub: user._id.toString(),
    role: user.role,
  };

  const accessToken = generateToken(
    payload,
    envVars.JWT_ACCESS_SECRET,
    envVars.JWT_ACCESS_EXPIRES
  );

  const refreshToken = generateToken(
    payload,
    envVars.JWT_REFRESH_SECRET,
    envVars.JWT_REFRESH_EXPIRES
  );

  return { accessToken, refreshToken, user };
};

// ADMIN — APPROVE AGENT

const approveAgent = async (agentId: string) => {
  const agentObjectId = new Types.ObjectId(agentId);

  const agent = await UserModel.findByIdAndUpdate(agentObjectId);

  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }
  // approve agent and ensure correct role
  agent.role = "AGENT";
  agent.isApproved = true;
  agent.isSuspended = false;
  await agent.save();

  await WalletModel.findOneAndUpdate(
    { user: agentObjectId }, // wallet must belong to same user
    {
      $setOnInsert: {
        user: agentObjectId,
        balance: 50, // initial bonus
        isBlocked: false,
      },
      $set: {
        isBlocked: false, // unblock if existed
      },
    },
    {
      upsert: true,
      new: true,
    }
  );

  return agent;
};

const suspendAgent = async (agentId: string) => {
  const agent = await UserModel.findById(agentId);
  if (!agent) {
    throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
  }
  if (!agent.isApproved) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Agent must be approved before suspension"
    );
  }

  const updateAgent = await UserModel.findByIdAndUpdate(
    agentId,
    { isSuspended: true },
    { new: true }
  );
  if (updateAgent) {
    await WalletModel.findOneAndUpdate(
      { user: new Types.ObjectId(agentId) },
      { isBlocked: true },
      { new: true }
    );
  }

  return updateAgent;
};
export const AuthService = {
  register,
  login,
  approveAgent,
  suspendAgent,
  getNewAccessToken,
};
