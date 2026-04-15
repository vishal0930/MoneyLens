// backend/src/controllers/report.controller.js
import { asyncHandler } from "../middlewares/asyncHandler.middlerware.js";
import ReportModel, { ReportStatusEnum } from "../models/report.model.js";
import { sendReportEmail } from "../mailers/report.mailer.js";
import { HTTPSTATUS } from "../config/http.config.js";
import {
  generateReportService,
  getAllReportsService,
  updateReportSettingService,
} from "../services/report.service.js";
import { updateReportSettingSchema } from "../validators/report.validator.js";
import UserModel from "../models/user.model.js";
import { format } from "date-fns";

export const getAllReportsController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;

    const pagination = {
      pageSize: parseInt(req.query.pageSize) || 20,
      pageNumber: parseInt(req.query.pageNumber) || 1,
    };

    const result = await getAllReportsService(userId, pagination);

    return res.status(HTTPSTATUS.OK).json({
      message: "Reports history fetched successfully",
      ...result,
    });
  }
);

export const updateReportSettingController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;
    const body = updateReportSettingSchema.parse(req.body);

    await updateReportSettingService(userId, body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Reports setting updated successfully",
    });
  }
);

export const generateReportController = asyncHandler(
  async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
      return res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ message: "User not authenticated" });
    }

    const user = await UserModel.findById(userId).select("email name");
    if (!user) {
      return res
        .status(HTTPSTATUS.NOT_FOUND)
        .json({ message: "User not found" });
    }

    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Please provide 'from' and 'to' query parameters.",
      });
    }

    const fromDate = new Date(`${from}T05:30:00.000Z`);
    const toDate = new Date(`${to}T05:30:00.000Z`);

    const result = await generateReportService(userId, fromDate, toDate);

    if (!result) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "No transactions found for the given period.",
      });
    }

    try {
      await sendReportEmail({
        email: user.email,
        username: user.name || "User",
        report: {
          period: result.period,
          totalIncome: result.summary.income,
          totalExpenses: result.summary.expenses,
          availableBalance: result.summary.balance,
          savingsRate: result.summary.savingsRate,
          topSpendingCategories: result.summary.topCategories,
          insights: result.insights,
        },
        frequency: "CUSTOM",
      });

      await ReportModel.create({
        userId,
        sentDate: new Date(),
        period: `${format(fromDate, "MMMM d")} - ${format(toDate, "d, yyyy")}`,
        status: ReportStatusEnum.SENT,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`📧 Report email sent successfully to ${user.email}`);
    } catch (err) {
      console.error("❌ Failed to send report email:", err);
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "Report generated and emailed successfully.",
      ...result,
    });
  }
);
