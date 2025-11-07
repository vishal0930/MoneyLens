import { PaymentMethodEnum } from "../models/transaction.model";

export const receiptPrompt = `
You are a financial assistant that helps users analyze and extract transaction details from receipt image (base64 encoded)
Analyze this receipt image (base64 encoded) and extract transaction details matching this exact JSON format:
{
  "title": "string",          // Merchant/store name or brief description
  "amount": number,           // Total amount (positive number)
  "date": "ISO date string",  // Transaction date in YYYY-MM-DD format
  "description": "string",    // Items purchased summary (max 50 words)
  "category": "string",       // category of the transaction 
  "type": "EXPENSE"           // Always "EXPENSE" for receipts
  "paymentMethod": "string",  // One of: ${Object.values(PaymentMethodEnum).join(",")}
}

Rules:
1. Amount must be positive
2. Date must be valid and in ISO format
3. Category must match our enum values
4. If uncertain about any field, omit it
5. If not a receipt, return {}

Example valid response:
{
  "title": "Walmart Groceries",
  "amount": 58.43,
  "date": "2025-05-08",
  "description": "Groceries: milk, eggs, bread",
  "category": "groceries",
  "paymentMethod": "CARD",
  "type": "EXPENSE"
}
`;

export const reportInsightPrompt = ({
  totalIncome,
  totalExpenses,
  availableBalance,
  savingsRate,
  categories,
  periodLabel,
}: {
  totalIncome: number;
  totalExpenses: number;
  availableBalance: number;
  savingsRate: number;
  categories: Record<string, { amount: number; percentage: number }>;
  periodLabel: string;
}) => {
  const categoryList = Object.entries(categories)
    .map(
      ([name, { amount, percentage }]) =>
        `- ${name}: ₹${amount.toLocaleString()} (${percentage}%)`
    )
    .join("\n");

  return `
You are an expert **personal finance coach** analyzing a user’s spending habits in **Indian Rupees (₹)**.

Your job is to give **exactly 3 short, insightful, and realistic observations** for the user’s financial report.  
Be encouraging, but also **highlight where the user is overspending or wasting money**.

📅 Report Period: ${periodLabel}
- Total Income: ₹${totalIncome.toLocaleString()}
- Total Expenses: ₹${totalExpenses.toLocaleString()}
- Available Balance: ₹${availableBalance.toLocaleString()}
- Savings Rate: ${savingsRate}%

🧾 Expense Breakdown:
${categoryList}

🎯 Guidelines:
- Mention the **rupee symbol (₹)** when referring to money.
- If the savings rate is above 70%, appreciate it.
- If expenses are more than 40% of income, point out overspending.
- Identify the **largest expense category** and suggest moderation.
- Encourage tracking recurring expenses or unnecessary luxuries.
- Each insight must be **one short, natural sentence**, no fluff.

🧠 Format response exactly like this JSON:
[
  "Insight 1",
  "Insight 2",
  "Insight 3"
]

✅ Example output:
[
  "Good job saving 85% of your income this month — that’s an excellent discipline!",
  "You spent ₹12,500 mostly on Food (35%) — consider cooking at home to reduce costs.",
  "Your Fitness and Entertainment expenses seem high; try limiting subscriptions or memberships you don’t fully use."
]

⚠️ Output only the JSON array — no explanation, markdown, or text outside it.
`.trim();
};