import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
const app = express();


app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

export default app;

import { connectDB } from "./config/db";

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );
});
