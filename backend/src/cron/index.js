// backend/src/cron/index.js
import { startJobs } from "./scheduler.js";

export const initializeCrons = async () => {
  try {
    const jobs = startJobs();
    console.log(`⏰ ${jobs.length} cron jobs initialized`);
    return jobs;
  } catch (error) {
    console.error("CRON INIT ERROR:", error);
    return [];
  }
};
