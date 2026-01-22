import { model, Schema } from "mongoose";
import { Role } from "../auth/auth.interface";
import { IsActive, IUser } from "./user.interface";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: function () {
        // Require password only if auths array is empty
        return !this.auths || this.auths.length === 0;
      },
    },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    phone: { type: String, default: null },
    picture: { type: String, default: null },
    picturePublicId: { type: String, default: null },
    address: { type: String },
    isDeleted: { type: Boolean, default: false },
    isActive: {
      type: String,
      enum: Object.values(IsActive),
      default: IsActive.ACTIVE,
    },
    isVerified: { type: Boolean, default: true },
    isSuspended: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },

    auths: {
      type: [
        {
          provider: { type: String },
          providerId: { type: String },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const UserModel = model<IUser>("User", userSchema);
