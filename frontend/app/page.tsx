"use client"

import { Show } from "@clerk/nextjs"
import { Activity, Boxes, DollarSign, ShoppingBag, UsersRound, WalletCards } from "lucide-react"

import { compact, currency } from "@/lib/analytics"
import { AnalyticsPage } from "@/components/analytics/analytics-page"
import {
  AreaTrendChartCard,
  DonutActiveChartCard,
  HorizontalBarChartCard,
  RadialMetricCard,
  StatCard,
  StatGrid,
} from "@/components/analytics/analytics-widgets"
import { LandingPage } from "@/components/landing-page"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <LandingPage />
      </Show>
      <Show when="signed-in">
        <AnalyticsPage
          title="Dashboard"
          description="A fast overview of the active dataset, using cached analytics stored after processing."
        >
          {(analytics) => (
            <>
              <StatGrid>
                <StatCard label="Total Customers" value={compact(analytics.overview.totalCustomers)} detail="Unique profiles" />
                <StatCard label="Total Orders" value={compact(analytics.overview.totalOrders)} detail="Completed transactions" />
                <StatCard label="Total Revenue" value={currency(analytics.overview.totalRevenue)} detail="Active dataset" />
                <StatCard label="Average Order Value" value={currency(analytics.overview.averageOrderValue)} detail="Revenue / order" />
              </StatGrid>

              <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                <AreaTrendChartCard
                  title="Revenue Trend"
                  description="Daily revenue trend for the active dataset."
                  data={analytics.purchaseAnalytics.revenueTrend}
                />
                <RadialMetricCard
                  title="Order Coverage"
                  description="Orders compared with customers."
                  value={analytics.overview.totalOrders}
                  max={Math.max(analytics.overview.totalCustomers, analytics.overview.totalOrders)}
                  centerLabel={compact(analytics.overview.totalOrders)}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <HorizontalBarChartCard
                  title="Top Categories"
                  description="Revenue by category using green-scale bars."
                  data={analytics.productAnalytics.categoryRevenue}
                  valueFormatter={currency}
                />
                <DonutActiveChartCard
                  title="Customer Type Mix"
                  description="Interactive view of frequent, occasional, and rare groups."
                  data={analytics.customerAnalytics.purchaseFrequency}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { title: "Customers", value: compact(analytics.overview.totalCustomers), icon: UsersRound },
                  { title: "Products", value: compact(analytics.overview.totalProducts), icon: Boxes },
                  { title: "Units Sold", value: compact(analytics.overview.totalUnits), icon: ShoppingBag },
                  { title: "Revenue", value: currency(analytics.overview.totalRevenue), icon: DollarSign },
                  { title: "AOV", value: currency(analytics.overview.averageOrderValue), icon: WalletCards },
                  { title: "Trend Points", value: compact(analytics.purchaseAnalytics.revenueTrend.length), icon: Activity },
                ].map((metric) => (
                  <Card key={metric.title} size="sm" className="group border-black/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <CardHeader>
                      <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-800 ring-1 ring-emerald-100 transition group-hover:bg-emerald-800 group-hover:text-white">
                        <metric.icon className="size-5" />
                      </div>
                      <CardTitle>{metric.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-2xl font-bold text-neutral-950">{metric.value}</CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </AnalyticsPage>
      </Show>
    </>
  )
}
