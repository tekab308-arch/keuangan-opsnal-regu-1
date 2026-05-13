import React from "react";
import { 
  useListCategories, 
  getListCategoriesQueryKey 
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryForm from "@/components/forms/category-form";
import { Tags } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function CategoriesPage() {
  const { isAdmin } = useAuth();
  const { data: categories, isLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Kategori</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Kelola kategori pengeluaran.</p>
        </div>
        {isAdmin && <CategoryForm />}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              data-testid={`card-category-${cat.id}`}
              className="border-none shadow-sm overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="h-1.5 w-full" style={{ backgroundColor: cat.color }} />
                <div className="p-4 flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" 
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <Tags className="w-4 h-4" />
                  </div>
                  <p className="font-semibold text-sm text-foreground leading-tight">{cat.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-sm py-16 text-center text-muted-foreground flex flex-col items-center bg-card">
          <Tags className="w-10 h-10 text-muted mb-3" />
          <p className="text-sm font-medium">Belum ada kategori</p>
          <p className="text-xs mt-1">
            {isAdmin ? "Tambah kategori untuk mengatur pengeluaran." : "Admin belum menambahkan kategori."}
          </p>
        </Card>
      )}
    </div>
  );
}
