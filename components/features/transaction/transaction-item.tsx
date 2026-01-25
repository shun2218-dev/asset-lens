import { format } from "date-fns";
import { TableCell, TableRow } from "@/components/ui/table";
import type { SelectCategory, SelectTransaction } from "@/db/schema";
import { TransactionItemMenu } from "./transaction-item-menu";

interface TransactionItemProps {
  data: SelectTransaction;
  categories: SelectCategory[];
}

export function TransactionItem({ data, categories }: TransactionItemProps) {
  return (
    <TableRow key={data.id}>
      <TableCell>{format(data.date, "MM/dd")}</TableCell>
      <TableCell>{data.description}</TableCell>
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
        className={`text-right ${data.isExpense ? "text-red-500" : "text-green-500"}`}
      >
        {data.isExpense ? "-" : "+"}¥{data.amount.toLocaleString()}
      </TableCell>
      <TableCell>
        <TransactionItemMenu transaction={data} categories={categories} />
      </TableCell>
    </TableRow>
  );
}
