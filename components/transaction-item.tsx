import { format } from "date-fns";
import type { SelectTransaction } from "@/db/schema";
import {
  EXPENSE_CATEGORY_LABELS,
  INCOME_CATEGORY_LABELS,
} from "@/lib/constants";
import { TransactionItemMenu } from "./transaction-item-menu";
import { TableCell, TableRow } from "./ui/table";

interface TransactionItemProps {
  data: SelectTransaction;
}

export function TransactionItem({ data }: TransactionItemProps) {
  return (
    <TableRow key={data.id}>
      <TableCell>{format(data.date, "MM/dd")}</TableCell>
      <TableCell>{data.description}</TableCell>
      <TableCell>
        {data.isExpense
          ? EXPENSE_CATEGORY_LABELS[data.category]
          : INCOME_CATEGORY_LABELS[data.category]}
      </TableCell>
      <TableCell
        className={`text-right ${data.isExpense ? "text-red-500" : "text-green-500"}`}
      >
        {data.isExpense ? "-" : "+"}¥{data.amount.toLocaleString()}
      </TableCell>
      <TableCell>
        <TransactionItemMenu transaction={data} />
      </TableCell>
    </TableRow>
  );
}
