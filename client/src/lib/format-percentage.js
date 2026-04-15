export const formatPercentage = (
  value: number,
  options: {
    decimalPlaces?: number;
    showSign?: boolean;
    isExpense?: boolean;
  } = {}
): string => {
  const { decimalPlaces = 1, showSign = false, isExpense = false } = options;

  if (typeof value !== "number" || isNaN(value)) return "0%";

  // Normalize to absolute for formatting (Intl doesn’t handle sign well)
  const absValue = Math.abs(value);

  // Format the number as a percent using Indian locale
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(absValue / 100);

  // ✅ If no sign is needed, just return
  if (!showSign) return formatted;

  // ✅ Handle direction
  if (isExpense) {
    // For expenses, negative = good (saving), positive = bad (overspend)
    return value <= 0 ? `+${formatted}` : `-${formatted}`;
  }

  // For normal metrics (income/savings), positive = gain, negative = loss
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
};
