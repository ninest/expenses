import { getMonth } from "date-fns";
import { Expense } from "@/modules/types";
import { categories } from "@/modules/category";

export function getExpensesByMonth(expenses: Expense[], month: number) {
  return expenses.filter((expense) => getMonth(expense.timestamp) === month);
}

export function getExpensesSummary(expenses: Expense[]) {
  return categories.map((category) => {
    const expensesByCategory = expenses.filter((expense) => expense.category === category.key);
    const total = expensesByCategory.reduce((a, b) => a + b.amount, 0);

    return {
      categoryKey: category.key,
      total,
    };
  });
}
