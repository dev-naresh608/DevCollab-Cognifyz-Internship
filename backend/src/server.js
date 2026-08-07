import express from "express";
import { connectDB } from "./configs/database.config.js";
import { env } from "./configs/env.config.js";
// Server Setup.

const app = express();

async function startServer() {
  try {
    await connectDB();
    app.listen(env.PORT, () =>
      console.log(`server started on PORT: ${env.PORT}`),
    );
  } catch (error) {
    console.error("Failed to start server");
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
