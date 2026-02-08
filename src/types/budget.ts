export type Currency = string; // ISO 4217 codes like "USD", "AED", etc.

export interface Account {
  id: string;
  name: string;
  currency: Currency;
  balance: number;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string; // ISO date
  merchant: string;
  amount: number; // negative = expense, positive = income (in account currency)
  category: string;
  note?: string;
  hash?: string; // for deduplication
}

export interface Budget {
  id: string;
  category: string;
  limit: number; // in home currency
  month: string; // YYYY-MM
}

export interface FxRate {
  from: Currency;
  to: Currency;
  rate: number;
}

export interface AppSettings {
  homeCurrency: Currency;
}

export const CURRENCIES = [
  "USD", "EUR", "GBP", "AED", "SAR", "INR", "JPY", "CNY", "CAD", "AUD",
  "CHF", "SGD", "HKD", "KRW", "BRL", "MXN", "ZAR", "TRY", "SEK", "NOK"
];

export const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Health",
  "Education",
  "Travel",
  "Groceries",
  "Rent",
  "Salary",
  "Freelance",
  "Investment",
  "Transfer",
  "Other",
];

export const ACCOUNT_COLORS = [
  "hsl(211, 100%, 50%)", // blue
  "hsl(142, 72%, 42%)", // green
  "hsl(280, 67%, 55%)", // purple
  "hsl(25, 95%, 53%)",  // orange
  "hsl(340, 82%, 52%)", // pink
  "hsl(48, 96%, 53%)",  // yellow
];
