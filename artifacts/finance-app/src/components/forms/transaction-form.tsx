import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCreateTransaction,
  useListCategories,
  getListCategoriesQueryKey,
  getListTransactionsQueryKey,
  getGetSummaryQueryKey,
  getGetMonthlySummaryQueryKey,
  getGetExpenseByCategoryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  categoryId: z.coerce.number().nullable().optional(),
});

export default function TransactionForm({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      type: "expense",
      description: "",
      date: new Date().toISOString().split('T')[0],
      categoryId: null,
    },
  });

  const createTx = useCreateTransaction({
    mutation: {
      onSuccess: () => {
        toast({ title: "Transaction added successfully" });
        queryClient.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMonthlySummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetExpenseByCategoryQueryKey() });
        setOpen(false);
        form.reset();
      },
      onError: (err) => {
        toast({ title: "Failed to add transaction", variant: "destructive" });
      }
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createTx.mutate({ 
      data: {
        ...values,
        categoryId: values.categoryId || null
      }
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button size="sm" className="rounded-full shadow-sm shrink-0" data-testid="button-new-transaction">
            <Plus className="w-4 h-4 mr-1" />
            Tambah
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90dvh] overflow-y-auto bg-background">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-xl font-bold">Transaksi Baru</SheetTitle>
          <SheetDescription>Catat pemasukan atau pengeluaran baru.</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-card">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="bg-card" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (IDR)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50000" {...field} className="bg-card text-lg font-medium" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Morning coffee..." {...field} className="bg-card" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("type") === "expense" && (
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(val === "none" ? null : parseInt(val))} 
                      value={field.value?.toString() || "none"}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-card">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {categories?.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="pt-4 pb-2">
              <Button type="submit" className="w-full h-12 text-md rounded-xl" disabled={createTx.isPending}>
                {createTx.isPending ? "Menyimpan..." : "Simpan Transaksi"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
