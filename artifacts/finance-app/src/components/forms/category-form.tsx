import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useCreateCategory,
  getListCategoriesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required").regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color"),
});

const PRESET_COLORS = [
  "#e11d48", "#db2777", "#c026d3", "#9333ea", 
  "#7c3aed", "#4f46e5", "#4338ca", "#2563eb",
  "#1d4ed8", "#0369a1", "#0284c7", "#0ea5e9",
  "#0284c7", "#0891b2", "#0d9488", "#14b8a6",
  "#059669", "#16a34a", "#15803d", "#166534",
  "#ea580c", "#d97706", "#ca8a04", "#b45309"
];

export default function CategoryForm({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      color: PRESET_COLORS[0],
    },
  });

  const createCat = useCreateCategory({
    mutation: {
      onSuccess: () => {
        toast({ title: "Category added successfully" });
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        setOpen(false);
        form.reset();
      },
      onError: () => {
        toast({ title: "Failed to add category", variant: "destructive" });
      }
    }
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createCat.mutate({ data: values });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button size="sm" className="rounded-full shadow-sm shrink-0" data-testid="button-new-category">
            <Plus className="w-4 h-4 mr-1" />
            Tambah
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl max-h-[90dvh] overflow-y-auto bg-background">
        <SheetHeader className="mb-5">
          <SheetTitle className="text-xl font-bold">Kategori Baru</SheetTitle>
          <SheetDescription>Buat kategori untuk mengelompokkan pengeluaran.</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Groceries, Rent, etc..." {...field} className="bg-card" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Label</FormLabel>
                  <div className="grid grid-cols-6 gap-2 pt-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => field.onChange(c)}
                        className={`w-10 h-10 rounded-full transition-transform ${
                          field.value === c ? "scale-110 ring-2 ring-offset-2 ring-foreground" : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4 pb-2">
              <Button type="submit" className="w-full h-12 text-md rounded-xl" disabled={createCat.isPending}>
                {createCat.isPending ? "Menyimpan..." : "Simpan Kategori"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
