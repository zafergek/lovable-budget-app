import React, { createContext, useContext, useMemo, useCallback } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { Account, Transaction, Budget, FxRate, AppSettings } from "@/types/budget";

interface BudgetContextType {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  fxRates: FxRate[];
  setFxRates: React.Dispatch<React.SetStateAction<FxRate[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  convert: (amount: number, from: string, to: string) => number;
  addTransaction: (tx: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  currentMonth: string;
}

const BudgetContext = createContext<BudgetContextType | null>(null);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useLocalStorage<Account[]>("budget-accounts", [
    { id: "1", name: "Main Checking", currency: "USD", balance: 5240.50, color: "hsl(211, 100%, 50%)", icon: "💳" },
    { id: "2", name: "Savings", currency: "USD", balance: 12800.00, color: "hsl(142, 72%, 42%)", icon: "🏦" },
  ]);

  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("budget-transactions", [
    { id: "t1", accountId: "1", date: "2026-02-07", merchant: "Whole Foods", amount: -87.50, category: "Groceries" },
    { id: "t2", accountId: "1", date: "2026-02-06", merchant: "Uber", amount: -24.30, category: "Transport" },
    { id: "t3", accountId: "1", date: "2026-02-05", merchant: "Netflix", amount: -15.99, category: "Entertainment" },
    { id: "t4", accountId: "1", date: "2026-02-05", merchant: "Salary", amount: 4500, category: "Salary" },
    { id: "t5", accountId: "1", date: "2026-02-04", merchant: "Starbucks", amount: -6.45, category: "Food & Dining" },
    { id: "t6", accountId: "2", date: "2026-02-03", merchant: "Interest", amount: 12.50, category: "Investment" },
  ]);

  const [budgets, setBudgets] = useLocalStorage<Budget[]>("budget-budgets", [
    { id: "b1", category: "Groceries", limit: 500, month: "2026-02" },
    { id: "b2", category: "Food & Dining", limit: 300, month: "2026-02" },
    { id: "b3", category: "Transport", limit: 200, month: "2026-02" },
    { id: "b4", category: "Entertainment", limit: 100, month: "2026-02" },
    { id: "b5", category: "Shopping", limit: 250, month: "2026-02" },
  ]);

  const [fxRates, setFxRates] = useLocalStorage<FxRate[]>("budget-fxrates", [
    { from: "AED", to: "USD", rate: 0.2723 },
    { from: "EUR", to: "USD", rate: 1.08 },
    { from: "GBP", to: "USD", rate: 1.27 },
    { from: "INR", to: "USD", rate: 0.012 },
    { from: "JPY", to: "USD", rate: 0.0067 },
  ]);

  const [settings, setSettings] = useLocalStorage<AppSettings>("budget-settings", {
    homeCurrency: "USD",
  });

  const currentMonth = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }, []);

  const convert = useCallback(
    (amount: number, from: string, to: string): number => {
      if (from === to) return amount;
      const direct = fxRates.find((r) => r.from === from && r.to === to);
      if (direct) return amount * direct.rate;
      const reverse = fxRates.find((r) => r.from === to && r.to === from);
      if (reverse) return amount / reverse.rate;
      return amount; // fallback
    },
    [fxRates]
  );

  const addTransaction = useCallback(
    (tx: Transaction) => {
      setTransactions((prev) => [tx, ...prev]);
      setAccounts((prev) =>
        prev.map((a) => (a.id === tx.accountId ? { ...a, balance: a.balance + tx.amount } : a))
      );
    },
    [setTransactions, setAccounts]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((prev) => {
        const tx = prev.find((t) => t.id === id);
        if (tx) {
          setAccounts((accs) =>
            accs.map((a) => (a.id === tx.accountId ? { ...a, balance: a.balance - tx.amount } : a))
          );
        }
        return prev.filter((t) => t.id !== id);
      });
    },
    [setTransactions, setAccounts]
  );

  const addAccount = useCallback(
    (account: Account) => setAccounts((prev) => [...prev, account]),
    [setAccounts]
  );

  const deleteAccount = useCallback(
    (id: string) => {
      setAccounts((prev) => prev.filter((a) => a.id !== id));
      setTransactions((prev) => prev.filter((t) => t.accountId !== id));
    },
    [setAccounts, setTransactions]
  );

  return (
    <BudgetContext.Provider
      value={{
        accounts, setAccounts,
        transactions, setTransactions,
        budgets, setBudgets,
        fxRates, setFxRates,
        settings, setSettings,
        convert, addTransaction, deleteTransaction,
        addAccount, deleteAccount, currentMonth,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used within BudgetProvider");
  return ctx;
}
