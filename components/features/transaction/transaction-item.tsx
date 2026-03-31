import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import type {
  SelectCategory,
  SelectStore,
  SelectTransaction,
} from "@/db/schema";
import { TransactionItemMenu } from "./transaction-item-menu";
import type { OptimisticDeleteFn } from "./transaction-list";

export interface TransactionItemProps {
  data: SelectTransaction;
  categories: SelectCategory[];
  stores: SelectStore[];
  onOptimisticDelete?: OptimisticDeleteFn;
}

export function TransactionItem({
  data,
  categories,
  stores,
  onOptimisticDelete,
}: TransactionItemProps) {
  return (
    <TableRow key={data.id}>
      <TableCell>{format(data.date, "MM/dd")}</TableCell>
      <TableCell>{data.description}</TableCell>
      <TableCell className="text-muted-foreground">
        {data.storeName || "—"}
      </TableCell>
      <TableCell>
        {
          categories.find(
            (c) =>
              c.id === data.categoryId ||
              c.slug === data.category ||
              c.id === data.category,
          )?.name
        }
      </TableCell>
      <TableCell
        className={`text-right ${data.isExpense ? "text-red-600" : "text-green-700"}`}
      >
        {data.isExpense ? "-" : "+"}¥{data.amount.toLocaleString()}
      </TableCell>
      <TableCell>
        <TransactionItemMenu
          transaction={data}
          categories={categories}
          stores={stores}
          onOptimisticDelete={onOptimisticDelete}
        />
      </TableCell>
    </TableRow>
  );
}
