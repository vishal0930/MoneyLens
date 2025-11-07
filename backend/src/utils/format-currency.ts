// ✅ Convert rupees to paise (for storage consistency)
export function convertToPaise(amount: number) {
  return Math.round(amount * 100);
}

// ✅ Convert from paise to rupees for display
export function convertToRupeeUnit(amount: number) {
  return amount / 100;
}

// ✅ Format rupees properly with ₹ symbol and Indian number system
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

