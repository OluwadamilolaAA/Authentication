import jwt, { Secret, JwtPayload } from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as Secret;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as Secret;

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES as string;
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES as string;

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
