"use client"

import { currency } from "@/lib/analytics"
import { AnalyticsPage } from "@/components/analytics/analytics-page"
import { DataTable, StatCard, StatGrid } from "@/components/analytics/analytics-widgets"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProductInsightsPage() {
  return (
    <AnalyticsPage
      title="Product Insights"
      description="Personalized product view with revenue, buyers, dominant demographics, and contribution."
    >
      {(analytics) => {
        const leader = analytics.productInsights[0]
        return (
          <>
            <StatGrid>
              <StatCard label="Leading Product" value={leader?.productName ?? "N/A"} detail="By revenue generated" />
              <StatCard label="Revenue Generated" value={leader ? currency(leader.revenueGenerated) : "$0"} />
              <StatCard label="Total Buyers" value={String(leader?.totalBuyers ?? 0)} />
              <StatCard label="Contribution" value={`${leader?.revenueContribution ?? 0}%`} detail="Of total revenue" />
            </StatGrid>

            <Card className="border-black/10 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Product Insight Table</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={["Product", "Category", "Revenue", "Buyers", "Age Group", "Gender", "Contribution"]}
                  rows={analytics.productInsights.slice(0, 20).map((product) => [
                    product.productName,
                    product.category,
                    currency(product.revenueGenerated),
                    product.totalBuyers,
                    product.mostCommonAgeGroup,
                    product.mostCommonGender,
                    `${product.revenueContribution}%`,
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
