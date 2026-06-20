"use client"

import { compact, currency } from "@/lib/analytics"
import { AnalyticsPage } from "@/components/analytics/analytics-page"
import {
  BarChartCard,
  DataTable,
  DonutActiveChartCard,
  HorizontalBarChartCard,
  PieLabelChartCard,
  RadialMetricCard,
  StatCard,
  StatGrid,
} from "@/components/analytics/analytics-widgets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CustomerAnalyticsPage() {
  return (
    <AnalyticsPage
      title="Customer Analytics"
      description="Analyze customers from the active dataset by demographics, spend, and purchase frequency."
    >
      {(analytics) => (
        <>
          <StatGrid>
            <StatCard label="Customers" value={compact(analytics.overview.totalCustomers)} detail="Unique customer IDs" />
            <StatCard label="Orders" value={compact(analytics.overview.totalOrders)} detail="Imported purchases" />
            <StatCard label="Total Revenue" value={currency(analytics.overview.totalRevenue)} detail="Across active dataset" />
            <StatCard label="Avg Order Value" value={currency(analytics.overview.averageOrderValue)} detail="Revenue per order" />
          </StatGrid>

          <div className="grid gap-4 xl:grid-cols-2">
            <PieLabelChartCard
              title="Age Distribution"
              description="Customers grouped into analysis-ready age buckets."
              data={analytics.customerAnalytics.ageDistribution}
            />
            <DonutActiveChartCard
              title="Gender Distribution"
              description="Hover slices to inspect the active segment."
              data={analytics.customerAnalytics.genderDistribution}
            />
            <HorizontalBarChartCard
              title="Customer Spending Analysis"
              description="Number of customers by total spend bucket."
              data={analytics.customerAnalytics.spendingDistribution}
            />
            <BarChartCard
              title="Purchase Frequency Analysis"
              description="Customer type distribution based on order count."
              data={analytics.customerAnalytics.purchaseFrequency}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {analytics.customerAnalytics.purchaseFrequency.map((point) => (
              <RadialMetricCard
                key={point.label}
                title={`${point.label} Customers`}
                description="Share of customer base."
                value={point.value}
                max={analytics.overview.totalCustomers}
                centerLabel={compact(point.value)}
              />
            ))}
          </div>

          <Card className="border-black/10 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={["Customer", "Age", "Gender", "City", "Spend", "Orders", "AOV"]}
                rows={analytics.customerAnalytics.customers.slice(0, 15).map((customer) => [
                  customer.customerId,
                  customer.age,
                  customer.gender,
                  customer.city || "N/A",
                  currency(customer.totalSpend),
                  customer.orderCount,
                  currency(customer.averageOrderValue),
                ])}
              />
            </CardContent>
          </Card>
        </>
      )}
    </AnalyticsPage>
  )
}
