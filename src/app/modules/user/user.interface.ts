import { Types } from "mongoose";
import { Role } from "../auth/auth.interface";

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IAuthProvider {
  provider: "google" | "credentials"; // "Google", "Credential"
  providerId: string;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  picture?: string | null;
  picturePublicId?: string | null;
  phone?: string | null;
  address?: string;
  isDeleted?: boolean;
  isActive?: IsActive;
  isVerified?: boolean;
  isSuspended?: boolean;
  isApproved?: boolean;
  role: Role;
  auths: IAuthProvider[];
}
