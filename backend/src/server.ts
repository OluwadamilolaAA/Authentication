import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "./config/passport";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import { connectDB } from "./config/db";
import { errorHandler, notFound } from "./middlewares/error.middleware";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowlist = new Set([
        "http://localhost:5173",
        "http://localhost:3000",
        process.env.CLIENT_URL,
      ]);
      if (!origin || allowlist.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
