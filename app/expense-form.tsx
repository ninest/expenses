"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createExpenseAction } from "@/app/_actions/expenses-actions";
import { CategoryInput } from "@/app/_components/category-input";

export const expenseFormSchema = z.object({
  category: z.string(),
  amount: z.number(),
  notes: z.string().default(""),
});

export type ExpenseFormType = z.infer<typeof expenseFormSchema>;

export function ExpenseForm({}) {
  const form = useForm<ExpenseFormType>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: "living",
      // amount: 0,
      notes: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const response = await createExpenseAction(data);
    if (response.type === "error") {
      // TODO handle error
      alert("Error! Copy and paste the lin in your browser");
      prompt(response.prefilledFormUrl);
    }

    // Success!
    form.reset();
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <CategoryInput categoryKey={field.value} selectCategory={field.onChange} />
                {/* <FormControl>
                  <Input {...field} />
                </FormControl> */}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button>Submit</Button>
        </form>
      </Form>
    </>
  );
}
