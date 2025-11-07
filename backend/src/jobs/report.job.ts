import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import ReportSettingModel from "../models/report-setting.model";
import { UserDocument } from "../models/user.model";
import mongoose from "mongoose";
import { generateReportService } from "../services/report.service";
import ReportModel, { ReportStatusEnum } from "../models/report.model";
import { calulateNextReportDate } from "../utils/helper";
import { sendReportEmail } from "../mailers/report.mailer";

export const processReportJob = async () => {
  const now = new Date();

  let processedCount = 0;
  let failedCount = 0;

  // Today July 1 → run report for June 1–30 (previous month)
  const from = startOfMonth(subMonths(now, 1));
  const to = endOfMonth(subMonths(now, 1));

  try {
    const reportSettingCursor = ReportSettingModel.find({
      isEnabled: true,
      nextReportDate: { $lte: now },
    })
      // ✅ Fetch email + name explicitly
      .populate("userId", "email name")
      .cursor();

    console.log("Running report ");

    for await (const setting of reportSettingCursor) {
      const user = setting.userId as unknown as UserDocument;
      if (!user) {
        console.log(`❌ User not found for setting: ${setting._id}`);
        continue;
      }

      // 🧩 Debug log: confirm which user this report is for
      console.log(`📧 Generating report for: ${user.email} (${user.name})`);

      const session = await mongoose.startSession();

      try {
        const report = await generateReportService(user.id, from, to);

        console.log(report, "📊 Generated report data");

        let emailSent = false;
        if (report) {
          try {
            await sendReportEmail({
              email: user.email!,
              username: user.name!,
              report: {
                period: report.period,
                totalIncome: report.summary.income,
                totalExpenses: report.summary.expenses,
                availableBalance: report.summary.balance,
                savingsRate: report.summary.savingsRate,
                topSpendingCategories: report.summary.topCategories,
                insights: report.insights,
              },
              frequency: setting.frequency!,
            });
            emailSent = true;
          } catch (error) {
            console.log(`❌ Email failed for ${user.email}`);
            console.error(error);
          }
        }

        await session.withTransaction(
          async () => {
            const bulkReports: any[] = [];
            const bulkSettings: any[] = [];

            if (report && emailSent) {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period: report.period,
                    status: ReportStatusEnum.SENT,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: { _id: setting._id },
                  update: {
                    $set: {
                      lastSentDate: now,
                      nextReportDate: calulateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            } else {
              bulkReports.push({
                insertOne: {
                  document: {
                    userId: user.id,
                    sentDate: now,
                    period:
                      report?.period ||
                      `${format(from, "MMMM d")}–${format(to, "d, yyyy")}`,
                    status: report
                      ? ReportStatusEnum.FAILED
                      : ReportStatusEnum.NO_ACTIVITY,
                    createdAt: now,
                    updatedAt: now,
                  },
                },
              });

              bulkSettings.push({
                updateOne: {
                  filter: { _id: setting._id },
                  update: {
                    $set: {
                      lastSentDate: null,
                      nextReportDate: calulateNextReportDate(now),
                      updatedAt: now,
                    },
                  },
                },
              });
            }

            await Promise.all([
              ReportModel.bulkWrite(bulkReports, { ordered: false }),
              ReportSettingModel.bulkWrite(bulkSettings, { ordered: false }),
            ]);
          },
          {
            maxCommitTimeMS: 10000,
          }
        );

        processedCount++;
      } catch (error) {
        console.log(`❌ Failed to process report`, error);
        failedCount++;
      } finally {
        await session.endSession();
      }
    }

    console.log(`✅Processed: ${processedCount} report`);
    console.log(`❌ Failed: ${failedCount} report`);

    return {
      success: true,
      processedCount,
      failedCount,
    };
  } catch (error) {
    console.error("Error processing reports", error);
    return {
      success: false,
      error: "Report process failed",
    };
  }
};
