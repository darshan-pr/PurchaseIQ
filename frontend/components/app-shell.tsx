"use client"

import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useState, type ReactNode } from "react"
import {
  BarChart3,
  Boxes,
  ChevronDown,
  Crown,
  Database,
  LayoutDashboard,
  Loader2,
  PanelLeftClose,
  PackageSearch,
  Sparkles,
  UserRoundSearch,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { GitHubLink } from "@/components/github-link"
import { Logo } from "@/components/logo"
import { Separator } from "@/components/ui/separator"
import { activateDataset, getActiveDataset, listDatasets, type DatasetSummary } from "@/lib/datasets"
import { clearAnalyticsCache } from "@/lib/analytics"
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

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/dataset-upload": "Upload Dataset",
  "/dataset-upload/column-mapping": "Column Mapping",
  "/customer-analytics": "Customer Analytics",
  "/top-customers": "Top Customers",
  "/product-analytics": "Product Analytics",
  "/product-insights": "Product Insights",
  "/purchase-analytics": "Purchase Analytics",
  "/customer-insights": "Customer Insights",
}

function breadcrumbsForPath(pathname: string) {
  if (pathname === "/") {
    return [{ href: "/", label: "Dashboard" }]
  }

  const segments = pathname.split("/").filter(Boolean)
  const visibleSegments =
    segments[0] === "dataset-upload" && segments[1] === "datasets" && segments[2]
      ? [segments[0], segments[2]]
      : segments

  return visibleSegments.map((_, index) => {
    const href =
      segments[0] === "dataset-upload" && segments[1] === "datasets" && segments[2] && index === 1
        ? `/dataset-upload/datasets/${segments[2]}`
        : `/${visibleSegments.slice(0, index + 1).join("/")}`
    const label =
      segments[0] === "dataset-upload" && segments[1] === "datasets" && segments[2] && index === 1
        ? `Dataset #${segments[2]}`
        : routeLabels[href] ?? visibleSegments[index].replaceAll("-", " ")

    return {
      href,
      label,
    }
  })
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [datasets, setDatasets] = useState<DatasetSummary[]>([])
  const [activeDataset, setActiveDataset] = useState<DatasetSummary | null>(null)
  const [switchingDataset, setSwitchingDataset] = useState(false)
  const breadcrumbs = breadcrumbsForPath(pathname)

  async function refreshDatasets() {
    try {
      const [datasetList, active] = await Promise.all([
        listDatasets(),
        getActiveDataset().catch(() => null),
      ])
      setDatasets(datasetList)
      setActiveDataset(active)
    } catch {
      setDatasets([])
      setActiveDataset(null)
    }
  }

  async function switchDataset(datasetId: string) {
    if (!datasetId) {
      return
    }
    setSwitchingDataset(true)
    try {
      const activated = await activateDataset(Number(datasetId))
      clearAnalyticsCache()
      setActiveDataset(activated)
      window.dispatchEvent(
        new CustomEvent("purchaseiq:dataset-changed", {
          detail: {
            datasetId: activated.datasetId,
            version: activated.version,
          },
        })
      )
      await refreshDatasets()
    } finally {
      setSwitchingDataset(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadDatasets() {
      try {
        const [datasetList, active] = await Promise.all([
          listDatasets(),
          getActiveDataset().catch(() => null),
        ])
        if (!cancelled) {
          setDatasets(datasetList)
          setActiveDataset(active)
        }
      } catch {
        if (!cancelled) {
          setDatasets([])
          setActiveDataset(null)
        }
      }
    }

    void loadDatasets()
    return () => {
      cancelled = true
    }
  }, [])

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
            <div className="min-w-0">
              <div className="flex items-center gap-2 lg:hidden">
                <Badge className="bg-emerald-50 text-emerald-800" variant="secondary">
                  PurchaseIQ
                </Badge>
                <span className="text-sm font-semibold">Pattern intelligence</span>
              </div>
              <Breadcrumb className="hidden lg:block">
                <BreadcrumbList className="min-w-0">
                  <BreadcrumbItem>
                    <Link
                      href="/landing"
                      className="font-heading font-bold text-neutral-800 transition-colors hover:text-neutral-950"
                    >
                      PurchaseIQ
                    </Link>
                  </BreadcrumbItem>
                  {breadcrumbs.map((item, index) => {
                    const current = index === breadcrumbs.length - 1

                    return (
                      <Fragment key={item.href}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem className="min-w-0">
                          {current ? (
                            <BreadcrumbPage className="max-w-56 truncate">{item.label}</BreadcrumbPage>
                          ) : (
                            <Link
                              href={item.href}
                              className="max-w-44 truncate transition-colors hover:text-neutral-950"
                            >
                              {item.label}
                            </Link>
                          )}
                        </BreadcrumbItem>
                      </Fragment>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex min-w-0 shrink-0 items-center gap-3">
              <div className="relative hidden w-64 max-w-[38vw] items-center gap-2 rounded-xl border border-black/10 bg-[#f7f9f4] px-3 py-2 md:flex">
                {switchingDataset ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-emerald-700" />
                ) : (
                  <Database className="size-4 shrink-0 text-emerald-700" />
                )}
                <label htmlFor="dataset-switcher" className="sr-only">
                  Switch dataset
                </label>
                <select
                  id="dataset-switcher"
                  value={activeDataset?.datasetId ?? ""}
                  onChange={(event) => void switchDataset(event.target.value)}
                  disabled={switchingDataset || datasets.length === 0}
                  className="w-full min-w-0 appearance-none truncate bg-transparent pr-7 text-sm font-semibold text-neutral-800 outline-none disabled:opacity-60"
                  title={activeDataset ? `v${activeDataset.version} · ${activeDataset.fileName}` : undefined}
                >
                  <option value="">
                    {datasets.length === 0 ? "No dataset loaded" : "Select dataset"}
                  </option>
                  {datasets.map((dataset) => (
                    <option key={dataset.datasetId} value={dataset.datasetId}>
                      v{dataset.version} · {dataset.fileName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 size-4 text-neutral-700" />
              </div>
              <GitHubLink />
            </div>
          </div>
        </header>
        {switchingDataset && (
          <div className="fixed inset-0 z-40 grid place-items-center bg-neutral-950/45 px-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white p-5 text-center shadow-2xl">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Loader2 className="size-6 animate-spin" />
              </div>
              <p className="mt-4 text-lg font-bold text-neutral-950">Analyzing selected dataset</p>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Updating cached analytics and refreshing the dashboard views.
              </p>
            </div>
          </div>
        )}
        <main className="animate-fade-up mx-auto w-full max-w-6xl px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  )
}
