import mongoose from "mongoose";
import { env } from "./env.config.js";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(env.DATABASE_URL);

    console.log(`✅ MongoDB Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB");
    console.error(error.message);

    process.exit(1);
  }
};
