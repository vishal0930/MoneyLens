export const formatCurrency = (
  value: number,
  options: { 
    currency?: string; 
    decimalPlaces?: number;
    compact?: boolean;
    showSign?: boolean;
    isExpense?: boolean;
  } = {}
): string => {
  const { 
    currency = 'INR',              // 🇮🇳 Default to Indian Rupee
    decimalPlaces = 2, 
    compact = false, 
    showSign = false, 
    isExpense = false 
  } = options;

  // Handle negative values for expenses
  const displayValue = isExpense ? -Math.abs(value) : value;

  return new Intl.NumberFormat('en-IN', {   // 🇮🇳 Use Indian locale
    style: 'currency',
    currency,                               // Uses INR symbol ₹
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
    notation: compact ? 'compact' : 'standard',
    signDisplay: showSign ? 'always' : 'auto',
  }).format(displayValue);
};
