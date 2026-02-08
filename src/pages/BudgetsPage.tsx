import { useMemo, useState } from "react";
import { useBudget } from "@/context/BudgetContext";
import { CATEGORIES } from "@/types/budget";
import { Plus, Trash2 } from "lucide-react";

export default function BudgetsPage() {
  const { budgets, setBudgets, transactions, accounts, settings, convert, currentMonth } = useBudget();
  const [showAdd, setShowAdd] = useState(false);
  const [newCat, setNewCat] = useState(CATEGORIES[0]);
  const [newLimit, setNewLimit] = useState("");

  const monthBudgets = useMemo(
    () => budgets.filter((b) => b.month === currentMonth),
    [budgets, currentMonth]
  );

  const spending = useMemo(() => {
    const result: Record<string, number> = {};
    transactions
      .filter((t) => t.date.startsWith(currentMonth) && t.amount < 0)
      .forEach((t) => {
        const acc = accounts.find((a) => a.id === t.accountId);
        const home = convert(Math.abs(t.amount), acc?.currency || settings.homeCurrency, settings.homeCurrency);
        result[t.category] = (result[t.category] || 0) + home;
      });
    return result;
  }, [transactions, currentMonth, accounts, convert, settings.homeCurrency]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: settings.homeCurrency, minimumFractionDigits: 0 }).format(n);

  const handleAdd = () => {
    const limit = parseFloat(newLimit);
    if (isNaN(limit) || limit <= 0) return;
    setBudgets((prev) => [
      ...prev.filter((b) => !(b.category === newCat && b.month === currentMonth)),
      { id: crypto.randomUUID(), category: newCat, limit, month: currentMonth },
    ]);
    setNewLimit("");
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="px-4 pt-14 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Budgets</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      {showAdd && (
        <div className="ios-card mb-4 space-y-3 animate-slide-up">
          <select
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            className="w-full rounded-lg bg-secondary px-3 py-2.5 text-sm text-foreground"
          >
            {CATEGORIES.filter((c) => !monthBudgets.some((b) => b.category === c)).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            value={newLimit}
            onChange={(e) => setNewLimit(e.target.value)}
            placeholder="Monthly limit"
            className="w-full rounded-lg bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={handleAdd}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Save Budget
          </button>
        </div>
      )}

      <div className="space-y-3">
        {monthBudgets.map((b) => {
          const spent = spending[b.category] || 0;
          const pct = Math.min((spent / b.limit) * 100, 100);
          const over = spent > b.limit;
          return (
            <div key={b.id} className="ios-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{b.category}</p>
                <button onClick={() => handleDelete(b.id)} className="text-muted-foreground">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all ${over ? "bg-destructive" : "bg-primary"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className={over ? "text-destructive font-medium" : "text-muted-foreground"}>
                  {fmt(spent)} spent
                </span>
                <span className="text-muted-foreground">{fmt(b.limit)} limit</span>
              </div>
            </div>
          );
        })}

        {monthBudgets.length === 0 && (
          <p className="text-center text-muted-foreground py-20 text-sm">
            No budgets set for this month
          </p>
        )}
      </div>
    </div>
  );
}
