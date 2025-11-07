
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
import { getDateRange } from "./utils/date";
import analyticsRoutes from "./routes/analytics.route";
import { processRecurringTransactions } from "./jobs/transaction.job";
import { processReportJob } from "./jobs/report.job";


import { initializeCrons } from "./cron";

const app=express();
const BASE_PATH=Env.BASE_PATH;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes);
app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes);app.use("/api", scanRoutes);

app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException("This is a test error");
    res.status(HTTPSTATUS.OK).json({
      message: "Hello Subcribe to the channel",
    });
  })
);

  app.listen(Env.PORT,async() => {
   await connctDatabase()
     if (Env.NODE_ENV === "development") {
    await initializeCrons();
  }
    console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
   

    
      
  ;

  
  })
