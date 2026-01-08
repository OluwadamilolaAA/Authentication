import bcrypt from "bcrypt";
import User from "../models/user.model";
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/token";

export const registerUser = async (name: string, email: string, password: string) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() }); 
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(), 
    password: hashedPassword,
  });

  const { password: _pass, ...userWithoutPassword } = user.toObject(); 
  return userWithoutPassword;
};

export const registerAdminUser = async (name: string, email: string, password: string) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "admin"  
  });

  const { password: _pass, refreshToken: _rt, __v: _v, ...userWithoutSensitive } = user.toObject();
  return userWithoutSensitive;
};


export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw new Error("User not found");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
  const refreshToken = generateRefreshToken({ id: user._id.toString() });

  
  user.refreshToken = refreshToken;
  await user.save();

  const { password: _pass, refreshToken: _rt, ...userWithoutSensitive } = user.toObject();
  return { accessToken, refreshTokenCookie: refreshToken, user: userWithoutSensitive };
};
