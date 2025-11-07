import cron from "node-cron";
import { processRecurringTransactions } from "../jobs/transaction.job";
import { processReportJob } from "../jobs/report.job";
import { any } from "zod";

const scheduleJob = (name: string, time: string, job: Function) => {
  console.log(`Scheduling ${name} at ${time}`);

  return cron.schedule(
    time,
    async () => {
      try {
        await job();
        console.log(`${name} completed`);
      } catch (error) {
        console.log(`${name} failed`, error);
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    } as any
  );
};

export const startJobs = () => {
  return [
    


 scheduleJob("Transactions", "5 0 * * *", processRecurringTransactions),
 scheduleJob("Reports", "30 2 1 * *", processReportJob),

  ]; 
};