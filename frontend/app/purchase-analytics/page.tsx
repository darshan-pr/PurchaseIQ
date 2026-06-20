"use client"

import { compact, currency } from "@/lib/analytics"
import { AnalyticsPage } from "@/components/analytics/analytics-page"
import {
  AreaTrendChartCard,
  DonutActiveChartCard,
  HorizontalBarChartCard,
  RadialMetricCard,
  StatCard,
  StatGrid,
  TrendChartCard,
} from "@/components/analytics/analytics-widgets"

export default function PurchaseAnalyticsPage() {
  return (
    <AnalyticsPage
      title="Purchase Analytics"
      description="Analyze sales and transaction trends for the active dataset."
    >
      {(analytics) => (
        <>
          <StatGrid>
            <StatCard label="Total Revenue" value={currency(analytics.overview.totalRevenue)} />
            <StatCard label="Total Orders" value={compact(analytics.overview.totalOrders)} />
            <StatCard label="Average Order Value" value={currency(analytics.overview.averageOrderValue)} />
            <StatCard label="Units Sold" value={compact(analytics.overview.totalUnits)} />
          </StatGrid>

          <div className="grid gap-4 xl:grid-cols-2">
            <AreaTrendChartCard
              title="Daily Sales Trend"
              description="Daily revenue over time."
              data={analytics.purchaseAnalytics.dailySalesTrend}
            />
            <TrendChartCard
              title="Monthly Sales Trend"
              description="Monthly revenue over time."
              data={analytics.purchaseAnalytics.monthlySalesTrend}
            />
            <DonutActiveChartCard
              title="Revenue Split by Month"
              description="Interactive share of monthly revenue."
              data={analytics.purchaseAnalytics.monthlySalesTrend.map((point) => ({
                label: point.date,
                value: point.revenue,
              }))}
              valueFormatter={currency}
            />
            <HorizontalBarChartCard
              title="Order Volume Trend"
              description="Order count by purchase date."
              data={analytics.purchaseAnalytics.orderVolumeTrend}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <RadialMetricCard
              title="Revenue per Customer"
              description="Average contribution per customer."
              value={analytics.overview.totalRevenue / Math.max(analytics.overview.totalCustomers, 1)}
              max={analytics.overview.averageOrderValue * 2}
              centerLabel={currency(analytics.overview.totalRevenue / Math.max(analytics.overview.totalCustomers, 1))}
            />
            <RadialMetricCard
              title="Units per Order"
              description="Average quantity per transaction."
              value={analytics.overview.totalUnits / Math.max(analytics.overview.totalOrders, 1)}
              max={5}
              centerLabel={(analytics.overview.totalUnits / Math.max(analytics.overview.totalOrders, 1)).toFixed(1)}
            />
          </div>
        </>
      )}
    </AnalyticsPage>
  )
}
