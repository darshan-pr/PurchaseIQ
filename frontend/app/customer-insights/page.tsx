"use client"

import { currency } from "@/lib/analytics"
import { AnalyticsPage } from "@/components/analytics/analytics-page"
import { DataTable, PieChartCard, StatCard, StatGrid } from "@/components/analytics/analytics-widgets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CustomerInsightsPage() {
  return (
    <AnalyticsPage
      title="Customer Insights"
      description="Personalized customer view with favorites, spend, purchase frequency, and customer type."
    >
      {(analytics) => {
        const frequent = analytics.customerInsights.filter((customer) => customer.customerType === "Frequent").length
        const occasional = analytics.customerInsights.filter((customer) => customer.customerType === "Occasional").length
        const rare = analytics.customerInsights.filter((customer) => customer.customerType === "Rare").length
        const leader = analytics.customerInsights[0]
        return (
          <>
            <StatGrid>
              <StatCard label="Customers Profiled" value={String(analytics.customerInsights.length)} />
              <StatCard label="Frequent Customers" value={String(frequent)} />
              <StatCard label="Top Customer" value={leader?.customerId ?? "N/A"} detail={leader ? currency(leader.totalSpend) : "$0"} />
              <StatCard label="Primary Favorite" value={leader?.favoriteCategory ?? "N/A"} detail="For top customer" />
            </StatGrid>

            <PieChartCard
              title="Customer Type Mix"
              description="Frequent, occasional, and rare customers."
              data={[
                { label: "Frequent", value: frequent },
                { label: "Occasional", value: occasional },
                { label: "Rare", value: rare },
              ]}
            />

            <Card className="border-black/10 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Customer Insight Table</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={["Customer", "Profile", "Favorite Product", "Favorite Category", "Spend", "Frequency", "Type"]}
                  rows={analytics.customerInsights.slice(0, 20).map((customer) => [
                    customer.customerId,
                    `${customer.age} / ${customer.gender}`,
                    customer.favoriteProduct,
                    customer.favoriteCategory,
                    currency(customer.totalSpend),
                    customer.purchaseFrequency,
                    customer.customerType,
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
