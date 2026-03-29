import type { Meta, StoryObj } from "@storybook/react";
import { Table, TableHeader, TableRow } from "@/components/ui/table";
import { TransactionSortHeader } from "./transaction-sort-header";

const meta: Meta<typeof TransactionSortHeader> = {
  title: "Features/Transaction/TransactionSortHeader",
  component: TransactionSortHeader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Table>
        <TableHeader>
          <TableRow>
            <Story />
          </TableRow>
        </TableHeader>
      </Table>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TransactionSortHeader>;

export const Inactive: Story = {
  args: {
    label: "日付",
    field: "date",
    currentSort: {},
    onSort: () => {},
  },
};

export const SortAscending: Story = {
  args: {
    label: "金額",
    field: "amount",
    currentSort: { sortBy: "amount", sortOrder: "asc" },
    onSort: () => {},
  },
};

export const SortDescending: Story = {
  args: {
    label: "カテゴリ",
    field: "category",
    currentSort: { sortBy: "category", sortOrder: "desc" },
    onSort: () => {},
  },
};
