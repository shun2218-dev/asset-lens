export type TransactionResult = {
  success: boolean;
  error?: string;
};

export type SummaryStats = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export type CategoryStats = {
  category: string;
  amount: number;
};

export type MonthlyStats = {
  month: string;
  income: number;
  expense: number;
};

export type TransactionMetadata = {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
