import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR, formatDate } from "@/lib/format";
import { 
  useGetSummary, 
  useGetMonthlySummary, 
  useGetExpenseByCategory, 
  useListTransactions,
  getListTransactionsQueryKey
} from "@workspace/api-client-react";
import { ArrowDownRight, ArrowUpRight, Plus, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import TransactionForm from "@/components/forms/transaction-form";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const { data: summary, isLoading: isLoadingSummary } = useGetSummary();
  const { data: monthlySummary, isLoading: isLoadingMonthly } = useGetMonthlySummary();
  const { data: categoryExpense, isLoading: isLoadingCategory } = useGetExpenseByCategory();
  const { data: recentTransactions, isLoading: isLoadingTransactions } = useListTransactions(
    { limit: 5 },
    { query: { queryKey: getListTransactionsQueryKey({ limit: 5 }) } }
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Balance header */}
      <div className="flex justify-between items-center gap-3">
        <div className="min-w-0">
          <h2 className="text-xs font-medium text-muted-foreground mb-0.5 uppercase tracking-wide">Total Saldo</h2>
          {isLoadingSummary ? (
            <Skeleton className="h-9 w-40" />
          ) : (
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight truncate" data-testid="text-balance">
              {formatIDR(summary?.balance || 0)}
            </h1>
          )}
        </div>
        {isAdmin && (
          <TransactionForm trigger={
            <Button size="sm" className="rounded-full shadow-sm shrink-0" data-testid="button-add-transaction">
              <Plus className="w-4 h-4 mr-1" />
              Tambah
            </Button>
          } />
        )}
      </div>

      {/* Income / Expense side by side */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Pemasukan</p>
                {isLoadingSummary ? (
                  <Skeleton className="h-5 w-20 mt-1" />
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-primary leading-tight" data-testid="text-total-income">
                    {formatIDR(summary?.totalIncome || 0)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Pengeluaran</p>
                {isLoadingSummary ? (
                  <Skeleton className="h-5 w-20 mt-1" />
                ) : (
                  <p className="text-xs sm:text-sm font-semibold text-destructive leading-tight" data-testid="text-total-expense">
                    {formatIDR(summary?.totalExpense || 0)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash flow chart */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-semibold">Arus Kas</CardTitle>
        </CardHeader>
        <CardContent className="px-2 pb-4">
          {isLoadingMonthly ? (
            <Skeleton className="h-[200px] w-full" />
          ) : monthlySummary && monthlySummary.length > 0 ? (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummary} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey={(val) => {
                      const date = new Date(val.year, val.month - 1);
                      return date.toLocaleString('id-ID', { month: 'short' });
                    }} 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--secondary))' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
                    formatter={(value: number) => formatIDR(value)}
                  />
                  <Bar dataKey="income" name="Pemasukan" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              Belum ada data
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Expenses by Category */}
      <Card className="border-none shadow-sm">
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-base font-semibold">Pengeluaran per Kategori</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {isLoadingCategory ? (
            <Skeleton className="h-[160px] w-full" />
          ) : categoryExpense && categoryExpense.length > 0 ? (
            <div className="flex gap-4 items-center">
              <div className="shrink-0">
                <PieChart width={130} height={130}>
                  <Pie
                    data={categoryExpense}
                    cx={65}
                    cy={65}
                    innerRadius={38}
                    outerRadius={56}
                    paddingAngle={4}
                    dataKey="total"
                  >
                    {categoryExpense.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || 'hsl(var(--muted))'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatIDR(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 11 }}
                  />
                </PieChart>
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                {categoryExpense.slice(0, 5).map((cat) => (
                  <div key={cat.categoryId || 'uncategorized'} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || 'hsl(var(--muted))' }} />
                      <span className="text-muted-foreground truncate">{cat.categoryName || 'Lainnya'}</span>
                    </div>
                    <span className="font-semibold shrink-0 text-foreground">{formatIDR(cat.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">
              Belum ada pengeluaran
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold">Transaksi Terbaru</h3>
          <Link href="/transactions" className="text-sm font-medium text-primary" data-testid="link-view-all">
            Lihat Semua
          </Link>
        </div>
        
        <Card className="border-none shadow-sm overflow-hidden">
          {isLoadingTransactions ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : recentTransactions && recentTransactions.length > 0 ? (
            <div className="divide-y divide-border">
              {recentTransactions.map((tx) => (
                <div key={tx.id} data-testid={`row-transaction-${tx.id}`} className="px-4 py-3 flex items-center gap-3">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                    tx.type === 'income' ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                  )}>
                    {tx.type === 'income' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{tx.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(tx.date)}{tx.categoryName ? ` · ${tx.categoryName}` : ''}
                    </p>
                  </div>
                  <p className={cn(
                    "font-semibold text-sm shrink-0",
                    tx.type === 'income' ? "text-primary" : "text-foreground"
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatIDR(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
              <Wallet className="w-10 h-10 text-muted mb-3" />
              <p className="text-sm">Belum ada transaksi</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
