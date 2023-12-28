import { MonthSummary } from "@/app/_components/month-summary";
import { ExpenseForm } from "@/app/expense-form";
import { Spacer } from "@/components/spacer";
import { Title } from "@/components/title";
import { getExpenses } from "@/modules/sheets";

export default async function Home() {
  const expenses = await getExpenses();

  return (
    <main className="space-x py-5">
      <Title level={1}>Expenses</Title>

      <Spacer className="h-4" />

      <MonthSummary expenses={expenses} />

      <Spacer className="h-4" />

      <Title level={2}>New Expense</Title>
      <Spacer className="h-3" />
      <ExpenseForm />

      {/* <Spacer className="h-8" />

      <Debug data={expenses} /> */}
    </main>
  );
}
