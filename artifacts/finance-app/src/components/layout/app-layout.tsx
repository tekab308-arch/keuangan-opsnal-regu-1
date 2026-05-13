import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, ReceiptText, Tags, ShieldCheck, LogOut, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import LoginPage from "@/pages/login";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ReceiptText },
  { href: "/categories", label: "Kategori", icon: Tags },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { isAdmin, isLoading, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <h1 className="text-lg font-bold tracking-tight text-primary">Keuangan Opsnal Regu 1</h1>
        {!isLoading && (
          isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" />
                Admin
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 text-muted-foreground"
                onClick={logout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 text-muted-foreground gap-1.5"
              onClick={() => setShowLogin(true)}
              data-testid="button-login-trigger"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login Admin
            </Button>
          )
        )}
      </header>

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border h-screen sticky top-0">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-primary">Keuangan Opsnal Regu 1</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop auth section */}
        <div className="p-4 border-t border-border">
          {!isLoading && (
            isAdmin ? (
              <div className="flex items-center justify-between px-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground gap-1.5 text-xs"
                  onClick={logout}
                  data-testid="button-logout-desktop"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2 rounded-xl"
                onClick={() => setShowLogin(true)}
                data-testid="button-login-trigger-desktop"
              >
                <LogIn className="w-4 h-4" />
                Login sebagai Admin
              </Button>
            )
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-8">
        <div className="max-w-2xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 flex justify-around items-center px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Login modal */}
      {showLogin && <LoginPage onClose={() => setShowLogin(false)} />}
    </div>
  );
}
