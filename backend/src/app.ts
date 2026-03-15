import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import swaggerUi from "swagger-ui-express";

import passport from "./config/passport";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import { errorHandler, notFound } from "./middlewares/error.middleware";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";

const app = express();

const allowedOrigins = new Set(
  [
    "http://localhost:5173",
    "http://localhost:3000",
    env.clientUrl,
    env.frontendUrl,
    ...env.corsOrigins,
  ].filter(Boolean),
);

app.disable("x-powered-by");
if (env.isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(morgan(env.isProduction ? "combined" : "dev"));
app.use(cookieParser());
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(
  session({
    name: "sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;



















