"use client"

import { currency } from "@/lib/analytics"
import { AnalyticsPage } from "@/components/analytics/analytics-page"
import { BarChartCard, DataTable, StatCard, StatGrid } from "@/components/analytics/analytics-widgets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TopCustomersPage() {
  return (
    <AnalyticsPage
      title="Top Customers"
      description="Identify valuable customers by spend, order count, and average order value from the active dataset."
    >
      {(analytics) => {
        const top = analytics.topCustomers[0]
        return (
          <>
            <StatGrid>
              <StatCard label="Top Customer" value={top?.customerId ?? "N/A"} detail="Highest total spend" />
              <StatCard label="Top Spend" value={top ? currency(top.totalSpend) : "$0"} detail="Best customer revenue" />
              <StatCard label="Top Orders" value={String(top?.orderCount ?? 0)} detail="Purchases by leader" />
              <StatCard label="Top AOV" value={top ? currency(top.averageOrderValue) : "$0"} detail="Average order value" />
            </StatGrid>

            <BarChartCard
              title="Top Customers Ranking"
              description="Ranked by total spend."
              data={analytics.topCustomers.map((customer) => ({
                label: customer.customerId,
                value: customer.totalSpend,
              }))}
              valueFormatter={currency}
            />

            <Card className="border-black/10 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Top Customers Details</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={["Rank", "Customer", "Total Spend", "Order Count", "Average Order Value"]}
                  rows={analytics.topCustomers.map((customer, index) => [
                    `#${index + 1}`,
                    customer.customerId,
                    currency(customer.totalSpend),
                    customer.orderCount,
                    currency(customer.averageOrderValue),
                  ])}
                />
              </CardContent>
            </Card>
          </>
        )
      }}
    </AnalyticsPage>
  )
}
