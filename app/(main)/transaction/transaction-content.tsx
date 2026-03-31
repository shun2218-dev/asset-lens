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
  const [transactionsData, categories, stores] = await Promise.all([
    getTransaction(1, currentMonth),
    getCategories(),
    getStores(),
  ]);

  const { data: transactions, metadata } = transactionsData;

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
