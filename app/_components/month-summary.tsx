"use client";

import { Spacer } from "@/components/spacer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isAbove } from "@/modules/category";
import { getExpensesByMonth, getExpensesSummary } from "@/modules/expense";
import { Expense } from "@/modules/types";
import { MONTHS } from "@/utils/date";
import { cn } from "@/utils/style";
import { getMonth } from "date-fns";
import { Fragment, useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

interface MonthSummaryProps {
  expenses: Expense[];
}

export function MonthSummary({ expenses }: MonthSummaryProps) {
  const months = Array.from(Array(12).keys());
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));

  const expensesByMonth = getExpensesByMonth(expenses, selectedMonth);
  const expensesSummary = getExpensesSummary(expensesByMonth);
  const total = expensesSummary.reduce((total, summary) => total + summary.total, 0);

  const logScale = (value: number, min: number, max: number) => {
    // Adjust?
    const base = 10;
    return Math.log(value) / Math.log(max);
  };

  return (
    <div className="p-3 border rounded-lg">
      <section className="flex items-center space-x-2">
        <Button onClick={() => setSelectedMonth(selectedMonth - 1)} variant={"outline"} size={"icon"}>
          <LuChevronLeft />
        </Button>
        <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
          <SelectTrigger className="w-[14ch]">
            <SelectValue placeholder="Select month ..." />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={`${month}`}>
                {MONTHS[month]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setSelectedMonth(selectedMonth + 1)} variant={"outline"} size={"icon"}>
          <LuChevronRight />
        </Button>
      </section>

      <Spacer className="h-2" />

      <section className="grid grid-cols-[3fr,3fr,10fr] gap-1">
        {expensesSummary.map((summary) => {
          const max = Math.max(...expensesSummary.map((s) => s.total));
          const min = Math.min(...expensesSummary.filter((s) => s.total > 0).map((s) => s.total));

          const width = summary.total > 0 ? logScale(summary.total, min, max) * 100 : 2;

          const isAboveLimits = isAbove(summary.categoryKey, summary.total);

          return (
            <Fragment key={summary.categoryKey}>
              <div className="text-muted-foreground">{summary.categoryKey}</div>
              <div className="tabular-nums flex items-center justify-end space-x-1 pr-2">
                <div className="text-sm text-gray-600">$</div>
                <div>{summary.total}</div>
              </div>
              <div>
                <div
                  style={{ width: `${width}%` }}
                  className={cn("h-5 rounded-md", "bg-primary", { "bg-red-500": isAboveLimits.softLimit })}
                />
              </div>
            </Fragment>
          );
        })}
      </section>

      <Spacer className="h-3" />

      <section className="flex items-center justify-between">
        <div>Total</div>
        <div className="tabular-nums flex items-center justify-between space-x-1 pr-2">
          <div className="text-sm text-gray-600">$</div>
          <div className="text-bold">{total}</div>
        </div>
      </section>
    </div>
  );
}
