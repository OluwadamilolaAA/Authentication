import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseList = (value: string | undefined): string[] => {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not defined in environment variables`);
  }
  return value;
};

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";

const sessionSecret = process.env.SESSION_SECRET ?? "dev-insecure-session-secret";
if (isProduction && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required in production");
}

export const env = {
  nodeEnv,
  isProduction,
  port: parseNumber(process.env.PORT, 4000),
  mongoUrl: requireEnv("MONGO_URL"),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  corsOrigins: parseList(process.env.CORS_ORIGINS),
  sessionSecret,
  jwtAccessSecret: requireEnv("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: requireEnv("JWT_REFRESH_SECRET"),
  accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES ?? "15m",
  refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES ?? "7d",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
};
