import express from "express";
import morgan from "morgan";

import { env } from "./configs/env.config.js";

const app = express();

// Logging Middleware
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

export default app;
