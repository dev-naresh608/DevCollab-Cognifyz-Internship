import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { env } from "./configs/env.config.js";
import cors from "cors";

import authRouter from "./modules/auth/auth.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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

app.use(cookieParser());

app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
);

//EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "modules"));

//Routes:
app.use("/api/auth", authRouter);

export default app;
