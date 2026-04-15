import { addDays, addMonths, addWeeks, addYears, startOfMonth, addMinutes } from "date-fns";
import { RecurringIntervalEnum } from "../models/transaction.model.js";

export function calulateNextReportDate(lastSentDate) {
  const now = new Date();
  const lastSent = lastSentDate || now;

  const nextDate = startOfMonth(addMonths(lastSent, 1));
  nextDate.setHours(0, 0, 0, 0);

  console.log(nextDate, "nextDate");
  return nextDate;
}

export function calculateNextOccurrence(
  date,
  recurringInterval
) {
  const base = new Date(date);
  base.setHours(0, 0, 0, 0);

  switch (recurringInterval) {
    case RecurringIntervalEnum.MINUTELY:
      return addMinutes(base, 1);
    case RecurringIntervalEnum.DAILY:
      return addDays(base, 1);
    case RecurringIntervalEnum.WEEKLY:
      return addWeeks(base, 1);
    case RecurringIntervalEnum.MONTHLY:
      return addMonths(base, 1);
    case RecurringIntervalEnum.YEARLY:
      return addYears(base, 1);
    default:
      return base;
  }
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
