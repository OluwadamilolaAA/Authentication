import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  refreshToken?: string;
  googleId?: string;
  provider?: "local" | "google";

  // Email verification
  isVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpireAt?: Date;

  // Password reset
  resetOtp?: string;
  resetOtpExpireAt?: Date;
  resetOtpLastSentAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    refreshToken: { type: String },
    googleId: { type: String },
    provider: { type: String, enum: ["local", "google"], default: "local" },

    // Email verification
    isVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpireAt: { type: Date },

    // Password reset
    resetOtp: { type: String },
    resetOtpExpireAt: { type: Date },
    resetOtpLastSentAt: { type: Date, default: new Date(0) },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model<IUser>("User", userSchema);
