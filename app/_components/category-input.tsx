"use state";

import { Button } from "@/components/ui/button";
import { categories } from "@/modules/category";
import { cn } from "@/utils/style";

interface CategoryInputProps {
  categoryKey: string;
  selectCategory: (categoryKey: string) => void;
}

export function CategoryInput({ categoryKey, selectCategory }: CategoryInputProps) {
  return (
    <div className="flex flex-wrap">
      {categories.map((category) => {
        const isSelected = categoryKey === category.key;
        return (
          <Button
            key={category.key}
            variant={"outline"}
            type="button"
            onClick={() => selectCategory(category.key)}
            className={cn("mr-2 mb-2", { "border-primary": isSelected }, "flex items-center space-x-2")}
          >
            <div>{category.emoji}</div>
            {isSelected && <div>{category.key}</div>}
          </Button>
        );
      })}
    </div>
  );
}
