"use server";

import { ExpenseFormType } from "@/app/expense-form";

type CreateExpenseResponse = { type: "error"; prefilledFormUrl: string } | { type: "success" };

export async function createExpenseAction(params: ExpenseFormType): Promise<CreateExpenseResponse> {
  /* 
  Google form:
  entry.1299673982: Category
  entry.633999617: Amount
  entry.688538505: Notes
  entry.1334782415: Receipts
  entry.1657410010: Split
  https://docs.google.com/forms/d/e/1FAIpQLSeudma_IE78rveHENkAhcDx6PjSSP8dFV9zEBPeARGuMTyDjg/

  */

  const searchParams = new URLSearchParams();
  searchParams.set("entry.1299673982", params.category);
  searchParams.set("entry.633999617", String(params.amount));
  searchParams.set("entry.688538505", params.notes);
  searchParams.set("entry.1334782415", params.receipt.map((image) => image.url).join(", "));
  if (params.isSplit)
    searchParams.set(
      "entry.1657410010",
      JSON.stringify({
        totalWithoutTip: params.totalWithoutTip,
        tipPercent: params.tipPercent,
        friends: params.friends,
      })
    );
  const formId = "1FAIpQLSeudma_IE78rveHENkAhcDx6PjSSP8dFV9zEBPeARGuMTyDjg";
  const googleFormUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse?${searchParams}`;
  const prefilledFormUrl = `https://docs.google.com/forms/d/e/${formId}/viewform?${searchParams}`;

  try {
    // throw new Error();
    await fetch(googleFormUrl);
    return { type: "success" };
  } catch (e) {
    return {
      type: "error",
      prefilledFormUrl,
    };
  }
}
