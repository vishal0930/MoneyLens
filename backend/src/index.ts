import "dotenv/config"
import express, { NextFunction, Request, Response } from "express";
import cors from "cors"
import { Env } from "./config/env.config";
import { HTTPSTATUS } from "./config/http.config";
import { BadRequestException } from "./utils/app-error";
import { asyncHandler } from "./middlewares/asyncHandler.middlerware";
import connctDatabase from "./config/database.config";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import { passportAuthenticateJwt } from "./config/passport.config"
import transactionRoutes from "./routes/transaction.route";
import scanRoutes from "./routes/scan.routes";
import reportRoutes from "./routes/report.route";
import analyticsRoutes from "./routes/analytics.route";
import { initializeCrons } from "./cron";

const app = express();
const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIXED CORS
app.use(
  cors({
    origin: [
      Env.FRONTEND_ORIGIN, // from .env (localhost)
      "https://moneylens-phi.vercel.app" // Vercel frontend
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


// -----------------------------------------

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes);
app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes);

app.use("/api", scanRoutes);

app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);

app.get(
  "/",
  asyncHandler(async (req, res) => {
    res.status(HTTPSTATUS.OK).json({
      message: "Hello welcome",
    });
  })
);

app.listen(Env.PORT, async () => {
  await connctDatabase();
  if (Env.NODE_ENV === "development") {
    await initializeCrons();
  }
  console.log(`Server running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});
