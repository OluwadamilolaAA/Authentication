import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

const ACCESS_SECRET = env.jwtAccessSecret;
const REFRESH_SECRET = env.jwtRefreshSecret;
const ACCESS_EXPIRES = env.accessTokenExpires;
const REFRESH_EXPIRES = env.refreshTokenExpires;

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
};
