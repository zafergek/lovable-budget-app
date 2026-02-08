import { useMemo } from "react";
import { useBudget } from "@/context/BudgetContext";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

const CHART_COLORS = [
  "hsl(211, 100%, 50%)",
  "hsl(142, 72%, 42%)",
  "hsl(280, 67%, 55%)",
  "hsl(25, 95%, 53%)",
  "hsl(340, 82%, 52%)",
  "hsl(48, 96%, 53%)",
  "hsl(190, 80%, 45%)",
  "hsl(0, 0%, 55%)",
];

export default function InsightsPage() {
  const { transactions, accounts, settings, convert, currentMonth } = useBudget();

  const monthTx = useMemo(
    () => transactions.filter((t) => t.date.startsWith(currentMonth) && t.amount < 0),
    [transactions, currentMonth]
  );

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthTx.forEach((t) => {
      const acc = accounts.find((a) => a.id === t.accountId);
      const home = convert(Math.abs(t.amount), acc?.currency || settings.homeCurrency, settings.homeCurrency);
      map[t.category] = (map[t.category] || 0) + home;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);
  }, [monthTx, accounts, convert, settings.homeCurrency]);

  const dailySpending = useMemo(() => {
    const map: Record<string, number> = {};
    monthTx.forEach((t) => {
      const day = t.date.slice(8);
      const acc = accounts.find((a) => a.id === t.accountId);
      const home = convert(Math.abs(t.amount), acc?.currency || settings.homeCurrency, settings.homeCurrency);
      map[day] = (map[day] || 0) + home;
    });
    return Object.entries(map)
      .map(([day, amount]) => ({ day, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => a.day.localeCompare(b.day));
  }, [monthTx, accounts, convert, settings.homeCurrency]);

  const totalSpent = byCategory.reduce((s, c) => s + c.value, 0);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: settings.homeCurrency, minimumFractionDigits: 0 }).format(n);

  return (
    <div className="px-4 pt-14 pb-24 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Insights</h1>

      {/* Spending by category */}
      <div className="ios-card">
        <h2 className="text-sm font-semibold mb-3">Spending by Category</h2>
        {byCategory.length > 0 ? (
          <>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {byCategory.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span>{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {Math.round((cat.value / totalSpent) * 100)}%
                    </span>
                    <span className="font-medium tabular-nums">{fmt(cat.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-muted-foreground py-12 text-sm">No spending data this month</p>
        )}
      </div>

      {/* Daily spending */}
      <div className="ios-card">
        <h2 className="text-sm font-semibold mb-3">Daily Spending</h2>
        {dailySpending.length > 0 ? (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySpending}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" width={40} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="amount" fill="hsl(211, 100%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12 text-sm">No data yet</p>
        )}
      </div>
    </div>
  );
}
