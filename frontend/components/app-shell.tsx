"use client"

import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { useState, type ReactNode } from "react"
import {
  BarChart3,
  Boxes,
  Crown,
  Database,
  LayoutDashboard,
  PanelLeftClose,
  PackageSearch,
  Sparkles,
  UserRoundSearch,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { GitHubLink } from "@/components/github-link"
import { Logo } from "@/components/logo"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

const navGroups = [
  {
    label: "Dashboard",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    label: "Dataset Management",
    items: [{ title: "Upload Dataset", href: "/dataset-upload", icon: Database }],
  },
  {
    label: "Customer",
    items: [
      { title: "Customer Analytics", href: "/customer-analytics", icon: UserRoundSearch },
      { title: "Top Customers", href: "/top-customers", icon: Crown },
    ],
  },
  {
    label: "Product",
    items: [
      { title: "Product Analytics", href: "/product-analytics", icon: Boxes },
      { title: "Product Insights", href: "/product-insights", icon: PackageSearch },
    ],
  },
  {
    label: "Purchase",
    items: [{ title: "Purchase Analytics", href: "/purchase-analytics", icon: BarChart3 }],
  },
  {
    label: "Customer Insights",
    items: [{ title: "Customer Insights", href: "/customer-insights", icon: Sparkles }],
  },
]

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#f7f9f4] text-foreground">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 hidden overflow-hidden border-r border-black/10 bg-white shadow-sm transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block",
          collapsed ? "w-20" : "w-72"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 px-4">
          {collapsed ? (
            <button
              type="button"
              className="flex min-w-0 items-center justify-center"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
            >
              <Logo compact />
            </button>
          ) : (
          <Link href="/landing" className="group flex min-w-0 items-center gap-3">
              <Logo />
            </Link>
          )}
          {!collapsed && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 rounded-xl"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          )}
        </div>

        <Separator />

        <nav className={cn("space-y-5 px-4 py-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", collapsed && "px-3")}>
          {navGroups.map((group) => (
            <section key={group.label} className="space-y-2">
              <p
                className={cn(
                  "overflow-hidden whitespace-nowrap px-2 text-[0.8rem] font-black uppercase tracking-wide text-neutral-900 transition-all duration-300",
                  collapsed && "h-0 opacity-0"
                )}
              >
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.title : undefined}
                      className={cn(
                        "group flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold text-neutral-600 transition duration-200 hover:bg-emerald-50 hover:text-emerald-800",
                        collapsed && "justify-center px-0",
                        active && "bg-neutral-950 text-white shadow-sm hover:bg-neutral-950 hover:text-white"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span
                        className={cn(
                          "overflow-hidden whitespace-nowrap transition-all duration-300",
                          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                        )}
                      >
                        {item.title}
                      </span>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className={cn("absolute bottom-4 left-4 right-4", collapsed && "left-3 right-3")}>
          <div
            className={cn(
              "flex items-center gap-3 rounded-2xl border border-black/10 bg-neutral-950 p-3 text-white shadow-sm",
              collapsed && "justify-center p-2"
            )}
          >
            <UserButton />
            <div
              className={cn(
                "min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300",
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              )}
            >
              <p className="truncate text-sm font-bold">Signed in</p>
              <p className="truncate text-xs text-white/60">PurchaseIQ workspace</p>
            </div>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          collapsed ? "lg:pl-20" : "lg:pl-72"
        )}
      >
        <header className="sticky top-0 z-10 h-16 border-b border-black/10 bg-white/90 px-4 backdrop-blur-xl md:px-6">
          <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 lg:hidden">
                <Badge className="bg-emerald-50 text-emerald-800" variant="secondary">
                  PurchaseIQ
                </Badge>
                <span className="text-sm font-semibold">Pattern intelligence</span>
              </div>
              <p className="hidden font-heading text-sm font-bold tracking-tight text-neutral-800 lg:block">
                PurchaseIQ analytics workspace
              </p>
            </div>
            <GitHubLink />
          </div>
        </header>
        <main className="animate-fade-up mx-auto w-full max-w-6xl px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  )
}
