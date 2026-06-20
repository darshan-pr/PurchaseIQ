import { API_URL } from "@/lib/datasets"

export type MoneyPoint = { label: string; value: number }
export type DistributionPoint = { label: string; value: number }
export type TrendPoint = { date: string; revenue: number; orders: number }

export type CustomerRow = {
  customerId: string
  age: number
  gender: string
  city: string
  totalSpend: number
  orderCount: number
  averageOrderValue: number
}

export type TopCustomer = {
  customerId: string
  totalSpend: number
  orderCount: number
  averageOrderValue: number
}

export type CustomerInsight = {
  customerId: string
  age: number
  gender: string
  city: string
  favoriteProduct: string
  favoriteCategory: string
  totalSpend: number
  purchaseFrequency: number
  customerType: string
}

export type ProductRow = {
  productId: string
  productName: string
  category: string
  price: number
  revenue: number
  quantitySold: number
  buyers: number
}

export type ProductInsight = {
  productId: string
  productName: string
  category: string
  revenueGenerated: number
  totalBuyers: number
  mostCommonAgeGroup: string
  mostCommonGender: string
  revenueContribution: number
}

export type AnalyticsPayload = {
  datasetId: number
  version: number
  computedAt: string
  overview: {
    totalCustomers: number
    totalOrders: number
    totalRevenue: number
    averageOrderValue: number
    totalProducts: number
    totalUnits: number
  }
  customerAnalytics: {
    customers: CustomerRow[]
    ageDistribution: DistributionPoint[]
    genderDistribution: DistributionPoint[]
    spendingDistribution: MoneyPoint[]
    purchaseFrequency: DistributionPoint[]
  }
  productAnalytics: {
    products: ProductRow[]
    topProducts: ProductRow[]
    productPopularity: DistributionPoint[]
    categoryRevenue: MoneyPoint[]
    productRevenue: MoneyPoint[]
  }
  purchaseAnalytics: {
    dailySalesTrend: TrendPoint[]
    monthlySalesTrend: TrendPoint[]
    revenueTrend: TrendPoint[]
    orderVolumeTrend: DistributionPoint[]
  }
  topCustomers: TopCustomer[]
  customerInsights: CustomerInsight[]
  productInsights: ProductInsight[]
}

let activeAnalyticsCache: AnalyticsPayload | null = null
let activeAnalyticsPromise: Promise<AnalyticsPayload> | null = null

export async function getActiveAnalytics(forceRefresh = false): Promise<AnalyticsPayload> {
  if (!forceRefresh && activeAnalyticsCache) {
    return activeAnalyticsCache
  }
  if (!forceRefresh && activeAnalyticsPromise) {
    return activeAnalyticsPromise
  }

  activeAnalyticsPromise = fetchActiveAnalytics()
  try {
    activeAnalyticsCache = await activeAnalyticsPromise
    return activeAnalyticsCache
  } finally {
    activeAnalyticsPromise = null
  }
}

async function fetchActiveAnalytics(): Promise<AnalyticsPayload> {
  try {
    const response = await fetch(`${API_URL}/api/analytics/active`, {
      cache: "no-store",
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "Unable to load analytics" }))
      throw new Error(body.error ?? "Unable to load analytics")
    }
    return response.json()
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Backend is not reachable at ${API_URL}. Start the backend with ./start.sh.`)
    }
    throw error
  }
}

export function clearAnalyticsCache() {
  activeAnalyticsCache = null
  activeAnalyticsPromise = null
}

export function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export function compact(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}
