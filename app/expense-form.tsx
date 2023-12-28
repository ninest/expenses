"use client";

import { createExpenseAction } from "@/app/_actions/expenses-actions";
import { CategoryInput } from "@/app/_components/category-input";
import { Debug } from "@/components/debug";
import { NoElementsEmpty } from "@/components/empty";
import { NumberInput } from "@/components/number-input";
import { Spacer } from "@/components/spacer";
import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { round2dp } from "@/utils/number";
import { sleep } from "@/utils/time";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useFieldArray, useForm } from "react-hook-form";
import { LuImage, LuPlus, LuUpload, LuX } from "react-icons/lu";
import { toast } from "sonner";
import { z } from "zod";

const expenseFormSchema = z
  .object({
    category: z.string(),
    amount: z.number().min(0.001, "The amount can't be zero"),
    notes: z.string().default(""),
    receipt: z.array(z.object({ url: z.string().url() })),
    isSplit: z.boolean().default(false),
    totalWithoutTip: z.number().optional(),
    tipPercent: z.number().optional(),
    friends: z.array(z.object({ friendName: z.string().min(2), amount: z.number() })),
  })
  .refine((data) => !data.isSplit || (data.isSplit && data.totalWithoutTip !== undefined && data.totalWithoutTip > 0), {
    path: ["totalWithoutTip"],
    message: "Total without tip is required when splitting",
  })
  .refine((data) => data.isSplit === false || (data.isSplit === true && data.tipPercent !== undefined), {
    path: ["tipPercent"],
    message: "Tip percent is required when splitting",
  });

type ExpenseFormType = z.infer<typeof expenseFormSchema>;

export function ExpenseForm() {
  const form = useForm<ExpenseFormType>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      category: "living",
      amount: 0,
      notes: "",
      receipt: [],
      isSplit: false,
      totalWithoutTip: 0,
      tipPercent: 0,
      friends: [],
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const response = await createExpenseAction(data);
    if (response.type === "error") {
      toast("Oh no! Please submit the form manually", {
        action: {
          label: "Open form",
          onClick: () => window.open(response.prefilledFormUrl),
        },
      });
      console.log(response.prefilledFormUrl);
      return;
    }

    toast("Expense added!");

    // Success!
    form.reset({ category: "living", amount: 0, friends: [], isSplit: false, totalWithoutTip: 0, tipPercent: 0 });
  });

  const receiptField = useFieldArray({ control: form.control, name: "receipt" });
  const [imageIsLoading, setImageIsLoading] = useState(false);
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for await (const file of acceptedFiles) {
      if (!file.type.includes("image")) {
        toast(`${file.name} is not an image`, {
          description: "Only images can be uploaded",
        });
        continue;
      }

      // To prevent loading UI from flashing on and off
      // Show loading for at least 1 second
      setImageIsLoading(true);
      const startUploadTime = new Date();

      const url = await uploadToImgBB(file);

      const endUploadTime = new Date();
      const difference = endUploadTime.getTime() - startUploadTime.getTime();

      if (difference < 1250) {
        await sleep(1250 - difference);
      }

      const prevImages = form.getValues("receipt");
      form.setValue("receipt", [{ url }, ...prevImages]);
      setImageIsLoading(false);
      toast(`Image added successfully!`);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true });

  const uploadToImgBB = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      const url = data.data.url;
      console.log(url);
      return url;
    } catch (error) {
      console.error("Error uploading image:", error);
      // toast({ variant: "destructive", description: "An error ocurred in uploading the image" });
      toast("Error in uploading image", { description: "Please try again" });
    }
  };

  const friendsField = useFieldArray({ control: form.control, name: "friends" });

  const totalWithoutTip = form.watch("totalWithoutTip") ?? 0;
  const tipPercent = form.watch("tipPercent") ?? 0;
  const showSummary =
    !!totalWithoutTip && typeof tipPercent == "number" && !isNaN(totalWithoutTip) && !isNaN(tipPercent);
  const tip = (totalWithoutTip * tipPercent) / 100;
  const totalWithTip = totalWithoutTip + tip;
  const friends = form.watch("friends");

  const friendPayments =
    friends?.map((friend) => {
      const friendAmount = isNaN(friend.amount) ? 0 : friend.amount;
      return {
        friendName: friend.friendName,
        amount: friendAmount,
        tip: (friendAmount * tipPercent) / 100,
        amountWithTip: friendAmount + (friendAmount * tipPercent) / 100 ,
      };
    }) ?? [];
  const totalFriendPaymentWithoutTip = friendPayments.reduce((total, fp) => fp.amount + total, 0);
  const totalFriendPaymentWithTip = friendPayments.reduce((total, fp) => fp.amountWithTip + total, 0);

  const remaining = totalWithoutTip - totalFriendPaymentWithoutTip;
  const remainingTip = (remaining * tipPercent) / 100;

  const remainingWithTip = totalWithTip - totalFriendPaymentWithTip;

  return (
    <>
      <Form {...form}>
        <input type="file" {...getInputProps()} />
        <form {...getRootProps()} onSubmit={onSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <CategoryInput categoryKey={field.value} selectCategory={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-top justify-between space-x-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => {
                return (
                  <FormItem className="flex-1">
                    <FormControl>
                      <NumberInput
                        prefixBefore="$"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input placeholder="Notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="receipt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Receipt</FormLabel>{" "}
                <div className="space-y-2">
                  {/* Loading placeholder */}
                  {imageIsLoading && (
                    <>
                      <div className="border rounded-md overflow-hidden flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-[3rem] h-[3rem] animate-pulse dark:bg-gray-900 bg-gray-50" />
                          <div className="text-sm">Loading ...</div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Actual images */}
                  {receiptField.fields.map((field, index) => (
                    <div key={field.id} className="border rounded-md overflow-hidden flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img src={field.url} height={10} width={10} className="w-[3rem] h-[3rem]" />
                        <div className="text-sm">Uploaded image</div>
                      </div>
                      <Button
                        onClick={() => receiptField.remove(index)}
                        className="mr-2"
                        size={"sm"}
                        variant={"secondary"}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <div>
                  <FormControl>
                    <Button type="button" onClick={open} variant={"outline"} size={"sm"}>
                      <LuUpload className="mr-1" />
                      <LuImage className="mr-2" />
                      Upload image
                    </Button>
                  </FormControl>
                </div>
              </FormItem>
            )}
          />

          <section>
            <Title level={3}>Split</Title>
            <Spacer className="h-2" />

            <div className="space-y-4">
              {/* isSplit checkbox */}
              <FormField
                control={form.control}
                name="isSplit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Split bill and tip with friends</FormLabel>
                      </div>
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("isSplit") && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-end justify-between space-x-4">
                      {/* Total amount */}
                      <FormField
                        control={form.control}
                        name="totalWithoutTip"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex-1">
                              <FormControl>
                                <NumberInput
                                  prefixBefore="$"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                />
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />

                      {/* Tip percent */}
                      <FormField
                        control={form.control}
                        name="tipPercent"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex-1">
                              <FormControl>
                                <NumberInput
                                  placeholder="0"
                                  prefixAfter="%"
                                  {...field}
                                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                />
                              </FormControl>
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                    {/* error messages for total amount and tip */}
                    <div>
                      <FormField
                        control={form.control}
                        name="totalWithoutTip"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="tipPercent"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <Title level={3}>Friends</Title>
                    <Spacer className="h-2" />
                    {friendsField.fields.length === 0 && <NoElementsEmpty children="No friends yet." />}
                    <div className="space-y-3">
                      {friendsField.fields.map((field, index) => (
                        <div key={field.id} className="flex items-center justify-between space-x-4">
                          <FormField
                            control={form.control}
                            name={`friends.${index}.friendName`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder="Name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex-1 flex items-end space-x-2">
                            <FormField
                              control={form.control}
                              name={`friends.${index}.amount`}
                              render={({ field }) => {
                                return (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <NumberInput
                                        prefixBefore="$"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />

                            <Button
                              type="button"
                              onClick={() => friendsField.remove(index)}
                              variant={"secondary"}
                              size={"icon"}
                            >
                              <LuX />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Spacer className="h-2" />

                    <Button
                      type="button"
                      onClick={() => friendsField.append({ friendName: "", amount: 0 })}
                      variant={"secondary"}
                      size={"sm"}
                    >
                      <LuPlus /> Friend
                    </Button>
                  </div>

                  {showSummary && (
                    <div>
                      <Title level={3}>Summary</Title>
                      <Spacer className="h-2" />

                      <div className="bg-gradient-to-br from-gray-100 dark:to-gray-950 dark:from-gray-900 to-gray-50 border rounded rotate-[1deg] shadow  px-7 py-12 gap-0 tabular-nums max-w-[25rem]">
                        <div className="grid grid-cols-2">
                          <div>Total without tip:</div>
                          <div className="justify-self-end">{round2dp(totalWithoutTip)}</div>
                          <div>Tip:</div>
                          <div className="justify-self-end">{round2dp(tip)}</div>
                        </div>
                        <hr className="my-2" />
                        <div className="grid grid-cols-2">
                          <div className="font-bold">Total:</div>
                          <div className="justify-self-end font-bold">{round2dp(totalWithTip)}</div>

                          {friendPayments.map((friend, index) => {
                            return (
                              <Fragment key={Math.random() + friend.friendName}>
                                <div className="ml-3">{!!friend.friendName ? friend.friendName : `Friend ${index + 1}`}:</div>
                                <div className="justify-self-end">
                                  {tipPercent !== 0 && (
                                    <span className="text-muted-foreground">
                                      {round2dp(friend.amount)} + {round2dp(friend.tip)} ={" "}
                                    </span>
                                  )}
                                  {round2dp(friend.amountWithTip)}
                                </div>
                              </Fragment>
                            );
                          })}
                          <div className="ml-3">Remaining:</div>
                          <div className="justify-self-end">
                            {tipPercent !== 0 && (
                              <span className="text-muted-foreground">
                                {round2dp(remaining)} + {round2dp(remainingTip)} ={" "}
                              </span>
                            )}
                            {round2dp(remainingWithTip)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <Button className="w-full">Submit</Button>
        </form>
      </Form>

      {/* <Debug className="mt-4" data={{ friendPayments }} /> */}
    </>
  );
}
