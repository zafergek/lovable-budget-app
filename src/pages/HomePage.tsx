import { useBudget } from "@/context/BudgetContext";
import { useMemo } from "react";
import { TrendingDown, TrendingUp, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AccountCard } from "@/components/AccountCard";
import { TransactionRow } from "@/components/TransactionRow";

export default function HomePage() {
  const { accounts, transactions, settings, convert, currentMonth } = useBudget();
  const navigate = useNavigate();

  const totalBalance = useMemo(
    () =>
      accounts.reduce(
        (sum, a) => sum + convert(a.balance, a.currency, settings.homeCurrency),
        0
      ),
    [accounts, convert, settings.homeCurrency]
  );

  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.startsWith(currentMonth)),
    [transactions, currentMonth]
  );

  const monthIncome = useMemo(
    () =>
      monthTx
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => {
          const acc = accounts.find((a) => a.id === t.accountId);
          return sum + convert(t.amount, acc?.currency || settings.homeCurrency, settings.homeCurrency);
        }, 0),
    [monthTx, accounts, convert, settings.homeCurrency]
  );

  const monthExpense = useMemo(
    () =>
      monthTx
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => {
          const acc = accounts.find((a) => a.id === t.accountId);
          return sum + convert(Math.abs(t.amount), acc?.currency || settings.homeCurrency, settings.homeCurrency);
        }, 0),
    [monthTx, accounts, convert, settings.homeCurrency]
  );

  const recentTx = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [transactions]
  );

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: settings.homeCurrency,
      minimumFractionDigits: 2,
    }).format(n);

  return (
    <div className="px-4 pt-14 pb-24 space-y-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">Total Balance</p>
        <h1 className="text-4xl font-bold tracking-tight">{fmt(totalBalance)}</h1>
      </div>

      {/* Income / Expense summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="ios-card flex items-center gap-3">
          <div className="rounded-full bg-success/15 p-2">
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-sm font-semibold">{fmt(monthIncome)}</p>
          </div>
        </div>
        <div className="ios-card flex items-center gap-3">
          <div className="rounded-full bg-destructive/15 p-2">
            <TrendingDown className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-sm font-semibold">{fmt(monthExpense)}</p>
          </div>
        </div>
      </div>

      {/* Accounts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Accounts</h2>
          <button
            onClick={() => navigate("/settings")}
            className="text-primary text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {accounts.map((a) => (
            <AccountCard key={a.id} account={a} />
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent</h2>
          <button
            onClick={() => navigate("/transactions")}
            className="text-primary text-sm font-medium"
          >
            See All
          </button>
        </div>
        <div className="ios-card !p-0 overflow-hidden">
          {recentTx.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
          {recentTx.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
