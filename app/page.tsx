import { MonthSummary } from "@/app/_components/month-summary";
import { ExpenseForm } from "@/app/expense-form";
import { Debug } from "@/components/debug";
import { Spacer } from "@/components/spacer";
import { getExpenses } from "@/modules/sheets";

export default async function Home() {
  const expenses = await getExpenses();

  return (
    <main className="p-5">
      <h1 className="text-3xl font-bold">Expense Tracker</h1>
      <Spacer className="h-4" />
      <MonthSummary expenses={expenses} />

      <Spacer className="h-4" />

      <h2 className="text-xl font-bold">New Expense</h2>
      <Spacer className="h-2" />
      <ExpenseForm />
      <Spacer className="h-8" />
      <Debug data={expenses} />
    </main>
  );
}
