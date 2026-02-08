import type { Transaction } from "@/types/budget";
import { useBudget } from "@/context/BudgetContext";

const categoryIcons: Record<string, string> = {
  "Food & Dining": "🍔",
  Transport: "🚗",
  Shopping: "🛍️",
  Entertainment: "🎬",
  "Bills & Utilities": "💡",
  Health: "❤️",
  Education: "📚",
  Travel: "✈️",
  Groceries: "🛒",
  Rent: "🏠",
  Salary: "💰",
  Freelance: "💻",
  Investment: "📈",
  Transfer: "🔄",
  Other: "📌",
};

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { accounts, settings, convert } = useBudget();
  const account = accounts.find((a) => a.id === transaction.accountId);
  const cur = account?.currency || settings.homeCurrency;
  const isExpense = transaction.amount < 0;

  const fmt = (n: number, c: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: c, minimumFractionDigits: 2 }).format(n);

  const formattedDate = new Date(transaction.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="ios-list-item">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-xl">{categoryIcons[transaction.category] || "📌"}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{transaction.merchant}</p>
          <p className="text-xs text-muted-foreground">
            {formattedDate} · {transaction.category}
          </p>
        </div>
      </div>
      <span className={`text-sm font-semibold tabular-nums ${isExpense ? "text-foreground" : "text-success"}`}>
        {isExpense ? "−" : "+"}{fmt(Math.abs(transaction.amount), cur)}
      </span>
    </div>
  );
}
