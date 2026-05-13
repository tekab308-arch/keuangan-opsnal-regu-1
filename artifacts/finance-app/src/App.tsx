import React from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import AppLayout from "@/components/layout/app-layout";
import DashboardPage from "@/pages/dashboard";
import TransactionsPage from "@/pages/transactions";
import CategoriesPage from "@/pages/categories";
import { AuthProvider } from "@/context/auth-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/transactions" component={TransactionsPage} />
        <Route path="/categories" component={CategoriesPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
