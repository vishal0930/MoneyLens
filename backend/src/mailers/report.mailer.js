// backend/src/mailers/report.mailer.js
import { formatCurrency } from "../utils/format-currency.js";
import { getReportEmailTemplate } from "./templates/report.template.js";
import { sendEmail } from "./mailer.js";

export const sendReportEmail = async (params) => {
  const { email, username, report, frequency } = params;

  // 🧩 Debug logs:
  console.log("📧 [DEBUG] Preparing to send report email...");
  console.log("➡️  To:", email);
  console.log("➡️  Username:", username);
  console.log("➡️  Frequency:", frequency);
  console.log("➡️  Period:", report.period);

  const html = getReportEmailTemplate(
    {
      username,
      ...report,
    },
    frequency
  );

  const text = `Your ${frequency} Financial Report (${report.period})
    Income: ${formatCurrency(report.totalIncome)}
    Expenses: ${formatCurrency(report.totalExpenses)}
    Balance: ${formatCurrency(report.availableBalance)}
    Savings Rate: ${report.savingsRate.toFixed(2)}%

    ${report.insights.join("\n")}
`;

  // Already logs the text mail
  console.log(text, "📨 Email text content preview");

  // 🧩 Log full mail data (safe for dev)
  console.log("📦 [EMAIL PAYLOAD]", {
    to: email,
    subject: `${frequency} Financial Report - ${report.period}`,
  });

  // 🧩 Send actual email
  return sendEmail({
    to: email,
    subject: `${frequency} Financial Report - ${report.period}`,
    text,
    html,
  });
};
