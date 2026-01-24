import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { SelectCategory } from "@/db/schema";

interface CategorySelectProps {
  value?: string;
  onChange: (value: string) => void;
  categories: SelectCategory[];
  placeholder?: string;
  currentType: "expense" | "income";
}

export function CategorySelect({
  value,
  onChange,
  categories,
  placeholder = "カテゴリを選択",
  currentType,
}: CategorySelectProps) {
  const systemCategories = categories.filter(
    (c) => !c.userId && currentType === c.type,
  );
  const customCategories = categories.filter(
    (c) => c.userId && currentType === c.type,
  );

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>基本カテゴリ</SelectLabel>
          {systemCategories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectGroup>

        {customCategories.length > 0 && (
          <>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>マイカテゴリ</SelectLabel>
              {customCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
