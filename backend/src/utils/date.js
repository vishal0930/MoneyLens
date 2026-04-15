import {
  endOfDay,
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
  subMinutes,
} from "date-fns";
import { DateRangeEnum } from "../enums/date-range.enum.js";

export const getDateRange = (
  preset,
  customFrom,
  customTo
) => {
  if (customFrom && customTo) {
    return {
      from: customFrom,
      to: customTo,
      value: DateRangeEnum.CUSTOM,
      label: "Custom",
    };
  }

  const now = new Date();
  const today = endOfDay(now);

  const last30Days = {
    from: subDays(today, 29),
    to: today,
    value: DateRangeEnum.LAST_30_DAYS,
    label: "Last 30 Days",
  };

  switch (preset) {
    case DateRangeEnum.LAST_MINUTE:
      return {
        from: subMinutes(now, 1),
        to: now,
        value: DateRangeEnum.LAST_MINUTE,
        label: "Last 1 Minute",
      };

    case DateRangeEnum.ALL_TIME:
      return {
        from: null,
        to: null,
        value: DateRangeEnum.ALL_TIME,
        label: "All Time",
      };

    case DateRangeEnum.LAST_30_DAYS:
      return last30Days;

    case DateRangeEnum.LAST_MONTH:
      return {
        from: startOfMonth(subMonths(now, 1)),
        to: endOfMonth(subMonths(now, 1)),
        value: DateRangeEnum.LAST_MONTH,
        label: "Last Month",
      };

    case DateRangeEnum.LAST_3_MONTHS:
      return {
        from: startOfMonth(subMonths(now, 3)),
        to: endOfMonth(subMonths(now, 1)),
        value: DateRangeEnum.LAST_3_MONTHS,
        label: "Last 3 Months",
      };

    case DateRangeEnum.LAST_YEAR:
      return {
        from: startOfYear(subYears(now, 1)),
        to: endOfYear(subYears(now, 1)),
        value: DateRangeEnum.LAST_YEAR,
        label: "Last Year",
      };

    case DateRangeEnum.THIS_MONTH:
      return {
        from: startOfMonth(now),
        to: endOfDay(now),
        value: DateRangeEnum.THIS_MONTH,
        label: "This Month",
      };

    case DateRangeEnum.THIS_YEAR:
      return {
        from: startOfYear(now),
        to: endOfDay(now),
        value: DateRangeEnum.THIS_YEAR,
        label: "This Year",
      };

    default:
      return last30Days;
  }
};
