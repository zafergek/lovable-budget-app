import type { Account } from "@/types/budget";
import { useBudget } from "@/context/BudgetContext";

export function AccountCard({ account }: { account: Account }) {
  const { settings, convert } = useBudget();
  const homeBalance = convert(account.balance, account.currency, settings.homeCurrency);

  const fmt = (n: number, cur: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: cur, minimumFractionDigits: 2 }).format(n);

  return (
    <div className="ios-card flex items-center gap-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
        style={{ backgroundColor: account.color + "22" }}
      >
        {account.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{account.name}</p>
        <p className="text-xs text-muted-foreground">{account.currency}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">{fmt(account.balance, account.currency)}</p>
        {account.currency !== settings.homeCurrency && (
          <p className="text-xs text-muted-foreground">{fmt(homeBalance, settings.homeCurrency)}</p>
        )}
      </div>
    </div>
  );
}
