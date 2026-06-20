package com.example.notes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record AnalyticsPayload(
        Long datasetId,
        Integer version,
        Instant computedAt,
        Overview overview,
        CustomerAnalytics customerAnalytics,
        ProductAnalytics productAnalytics,
        PurchaseAnalytics purchaseAnalytics,
        List<TopCustomer> topCustomers,
        List<CustomerInsight> customerInsights,
        List<ProductInsight> productInsights) {
    public record Overview(
            long totalCustomers,
            long totalOrders,
            BigDecimal totalRevenue,
            BigDecimal averageOrderValue,
            long totalProducts,
            long totalUnits) {}

    public record DistributionPoint(String label, long value) {}

    public record MoneyPoint(String label, BigDecimal value) {}

    public record TrendPoint(String date, BigDecimal revenue, long orders) {}

    public record CustomerAnalytics(
            List<CustomerRow> customers,
            List<DistributionPoint> ageDistribution,
            List<DistributionPoint> genderDistribution,
            List<MoneyPoint> spendingDistribution,
            List<DistributionPoint> purchaseFrequency) {}

    public record CustomerRow(
            String customerId,
            Integer age,
            String gender,
            String city,
            BigDecimal totalSpend,
            long orderCount,
            BigDecimal averageOrderValue) {}

    public record TopCustomer(String customerId, BigDecimal totalSpend, long orderCount, BigDecimal averageOrderValue) {}

    public record CustomerInsight(
            String customerId,
            Integer age,
            String gender,
            String city,
            String favoriteProduct,
            String favoriteCategory,
            BigDecimal totalSpend,
            long purchaseFrequency,
            String customerType) {}

    public record ProductAnalytics(
            List<ProductRow> products,
            List<ProductRow> topProducts,
            List<DistributionPoint> productPopularity,
            List<MoneyPoint> categoryRevenue,
            List<MoneyPoint> productRevenue) {}

    public record ProductRow(
            String productId,
            String productName,
            String category,
            BigDecimal price,
            BigDecimal revenue,
            long quantitySold,
            long buyers) {}

    public record ProductInsight(
            String productId,
            String productName,
            String category,
            BigDecimal revenueGenerated,
            long totalBuyers,
            String mostCommonAgeGroup,
            String mostCommonGender,
            BigDecimal revenueContribution) {}

    public record PurchaseAnalytics(
            List<TrendPoint> dailySalesTrend,
            List<TrendPoint> monthlySalesTrend,
            List<TrendPoint> revenueTrend,
            List<DistributionPoint> orderVolumeTrend) {}
}
