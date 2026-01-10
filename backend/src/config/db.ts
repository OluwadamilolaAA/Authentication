import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URL; 

if (!MONGO_URI) {
  throw new Error("MONGO_URL is not defined in .env");
}

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
