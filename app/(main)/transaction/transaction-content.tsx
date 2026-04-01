import { getCategories } from "@/app/actions/category/get";
import { getStores } from "@/app/actions/store/get";
import { getTransaction } from "@/app/actions/transaction/get";
import { TransactionPageView } from "@/components/features/transaction/transaction-page-view";

interface TransactionContentProps {
  currentMonth: string;
}

/**
 * Async Server Component that fetches all transaction data.
 * Rendered inside a Suspense boundary so filters/shell stream first.
 */
export async function TransactionContent({
  currentMonth,
}: TransactionContentProps) {
  const [transactionsResult, categories, stores] = await Promise.all([
    getTransaction({ page: 1, month: currentMonth }),
    getCategories(),
    getStores(),
  ]);

  const { data: transactions, metadata } = transactionsResult.success
    ? transactionsResult.data
    : {
        data: [],
        metadata: {
          totalCount: 0,
          totalPages: 0,
          currentPage: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

  return (
    <TransactionPageView
      transactions={transactions}
      metadata={metadata}
      currentMonth={currentMonth}
      categories={categories}
      stores={stores}
    />
  );
}
