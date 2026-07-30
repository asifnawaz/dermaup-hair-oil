"use client";

import {
  BarChart3,
  Blocks,
  ChevronDown,
  FileText,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Tag,
  UserCog,
  Users,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SidebarProps {
  userName?: string;
}

const navigation = [
  { name: "Dashboard", href: "/backoffice/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/backoffice/orders", icon: Package },
  { name: "Analytics", href: "/backoffice/analytics", icon: BarChart3 },
  { name: "Subscribers", href: "/backoffice/subscribers", icon: ShoppingCart },
  { name: "Coupons", href: "/backoffice/coupons", icon: Tag },
  { name: "Customers", href: "/backoffice/customers", icon: Users },
];

const contentNavigation = [
  { name: "Pages", href: "/backoffice/content/pages", icon: FileText },
  { name: "Blocks", href: "/backoffice/content/blocks", icon: Blocks },
  { name: "Products", href: "/backoffice/content/products", icon: Package },
  { name: "Media", href: "/backoffice/media", icon: Image },
];

const bottomNavigation = [
  { name: "Settings", href: "/backoffice/settings", icon: Settings },
  { name: "Admin Users", href: "/backoffice/users", icon: UserCog },
];

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const contentActive =
    pathname.startsWith("/backoffice/content") ||
    pathname.startsWith("/backoffice/media");
  const [contentOpen, setContentOpen] = React.useState(contentActive);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      window.location.href = "/backoffice/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const renderNavItem = (item: (typeof navigation)[number]) => {
    const active =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;
    return (
      <Link
        key={item.name}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        onClick={() => setMobileOpen(false)}
      >
        <Icon className="h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  const NavLinks = () => (
    <>
      <div className="flex-1 space-y-1 px-2">
        {navigation.map(renderNavItem)}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setContentOpen(!contentOpen)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              contentActive
                ? "bg-muted/50 text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <span className="text-xs font-semibold uppercase tracking-wider">
              Content
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                contentOpen && "rotate-180",
              )}
            />
          </button>
          {contentOpen ? (
            <div className="ml-2 mt-1 space-y-1 border-l border-border pl-2">
              {contentNavigation.map(renderNavItem)}
            </div>
          ) : null}
        </div>
        <div className="pt-4">
          {bottomNavigation.map(renderNavItem)}
        </div>
      </div>
      <div className="border-t p-4">
        {userName ? (
          <p className="mb-2 truncate text-sm text-muted-foreground">
            {userName}
          </p>
        ) : null}
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>
        <span className="font-bold text-primary">UpDerma Admin</span>
      </div>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r bg-background transition-transform duration-200 ease-in-out lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-xl font-bold text-primary">UpDerma</span>
        </div>
        <nav className="flex flex-1 flex-col py-4">
          <NavLinks />
        </nav>
      </aside>
      <aside className="hidden border-r bg-background lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-xl font-bold text-primary">UpDerma Admin</span>
        </div>
        <nav className="flex flex-1 flex-col py-4">
          <NavLinks />
        </nav>
      </aside>
    </>
  );
}
