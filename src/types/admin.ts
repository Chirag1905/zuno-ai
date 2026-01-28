/* ---------- OVERVIEW ---------- */
export interface OverviewResponse {
    customers: {
        total: number;
        growth: number;
    };
    orders: {
        total: number;
        growth: number;
    };
    messagesToday: number;
    activeSubscriptions: number;
    todayRevenue: number;
}

/* ---------- ANALYTICS ---------- */
export interface AnalyticsMetrics {
    customers: {
        total: number;
        percentage: number;
    };
    orders: {
        total: number;
        percentage: number;
    };
}

export interface MonthlySalesItem {
    month: string;
    value: number;
}

export interface StatisticsData {
    months: string[];
    sales: number[];
    revenue: number[];
}

export interface MonthlyTargetData {
    target: number;
    revenue: number;
    today: number;
    progress: number;
    growth: number;
}

export interface DemographicItem {
    country: string;
    customers: number;
    percentage: number;
}

export type OrderStatus = "Delivered" | "Pending" | "Canceled";

export interface RecentOrder {
    id: string;
    productName: string;
    category: string;
    price: number;
    status: OrderStatus;
    image: string | null;
}

export interface AnalyticsResponse {
    metrics: AnalyticsMetrics;
    monthlySales: MonthlySalesItem[];
    statistics: StatisticsData;
    monthlyTarget: MonthlyTargetData;
    demographics: DemographicItem[];
    recentOrders: RecentOrder[];
}
