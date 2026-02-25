import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  refreshToken?: string;
  googleId?: string;
  provider?: "local" | "google";
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    refreshToken: { type: String },
    googleId: { type: String },
    provider: { type: String, enum: ["local", "google"], default: "local" }
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model<IUser>("User", userSchema);
