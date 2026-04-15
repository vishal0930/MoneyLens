// src/utils/prompt.js

import { PaymentMethodEnum } from "../models/transaction.model.js";

const paymentMethods = Object.values(PaymentMethodEnum).join(", ");

export const receiptPrompt = `
You are a financial assistant that extracts structured transaction data from a receipt image.

Analyze the receipt image and return ONLY valid JSON in the following format:

{
  "title": "string",
  "amount": number,
  "date": "YYYY-MM-DD",
  "description": "string",
  "category": "string",
  "paymentMethod": "string",
  "type": "EXPENSE"
}

STRICT RULES:
1. Always return ALL fields (never omit).
2. Amount must be a positive number.
3. Date must be in YYYY-MM-DD format.
4. Category must be one of: groceries, food, shopping, transport, bills, entertainment, health, other.
5. Payment method must be one of: ${paymentMethods}
6. If any value is unclear, make a reasonable guess.
7. Do NOT return anything except JSON (no markdown, no explanation, no backticks).

Example:
{
  "title": "Reliance Fresh",
  "amount": 850,
  "date": "2025-03-10",
  "description": "Groceries including fruits and vegetables",
  "category": "groceries",
  "paymentMethod": "UPI",
  "type": "EXPENSE"
}
`.trim();


// ================= REPORT PROMPT =================

export const reportInsightPrompt = ({
  totalIncome,
  totalExpenses,
  availableBalance,
  savingsRate,
  categories,
  periodLabel,
}) => {
  const categoryList = Object.entries(categories)
    .map(
      ([name, { amount, percentage }]) =>
        `- ${name}: ₹${amount.toLocaleString()} (${percentage}%)`
    )
    .join("\n");

  return `
You are an expert personal finance coach analyzing a user’s spending in Indian Rupees (₹).

Give exactly 3 short, realistic insights.

📅 Period: ${periodLabel}
- Income: ₹${totalIncome.toLocaleString()}
- Expenses: ₹${totalExpenses.toLocaleString()}
- Balance: ₹${availableBalance.toLocaleString()}
- Savings Rate: ${savingsRate}%

🧾 Breakdown:
${categoryList}

RULES:
- Mention ₹ symbol
- If savings > 70% → appreciate
- If expenses > 40% → warn
- Identify highest category
- Keep each insight short (1 line)
- No fluff

Return ONLY JSON array:
[
  "Insight 1",
  "Insight 2",
  "Insight 3"
]

No markdown. No explanation.
`.trim();
};
