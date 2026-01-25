import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { CategorySelect } from "./category-select";

const meta: Meta<typeof CategorySelect> = {
  title: "Features/Category/CategorySelect",
  component: CategorySelect,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof CategorySelect>;

const mockCategories = [
  {
    id: "cat-1",
    slug: "food",
    name: "食費",
    type: "expense",
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 1,
  },
  {
    id: "cat-2",
    slug: "rent",
    name: "家賃",
    type: "expense",
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 2,
  },
  {
    id: "cat-3",
    slug: "salary",
    name: "給与",
    type: "income",
    userId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 3,
  },
  {
    id: "cat-4",
    slug: "custom-1",
    name: "おやつ",
    type: "expense",
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    sortOrder: 4,
  },
];

export const Expense: Story = {
  args: {
    currentType: "expense",
    categories: mockCategories,
    value: "",
    onChange: () => {},
  },
  render: (args) => {
    const [value, setValue] = useState(args.value || "");
    return (
      <CategorySelect
        {...args}
        value={value}
        onChange={(val) => {
          setValue(val);
          args.onChange(val);
        }}
        placeholder="Select Expense Category"
      />
    );
  },
};

export const Income: Story = {
  args: {
    currentType: "income",
    categories: mockCategories,
    value: "",
    onChange: () => {},
  },
  render: (args) => {
    const [value, setValue] = useState(args.value || "");
    return (
      <CategorySelect
        {...args}
        value={value}
        onChange={(val) => {
          setValue(val);
          args.onChange(val);
        }}
        placeholder="Select Income Category"
      />
    );
  },
};
