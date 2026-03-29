export type TransactionResult = {
  success: boolean;
  error?: string;
};

export type ActionResult = {
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

export type TransactionSortField = "date" | "category" | "amount";
export type TransactionSortOrder = "asc" | "desc";

export type TransactionFilterParams = {
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
};

export type TransactionSortParams = {
  sortBy?: TransactionSortField;
  sortOrder?: TransactionSortOrder;
};
