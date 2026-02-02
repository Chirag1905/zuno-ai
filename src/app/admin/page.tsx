import DemographicCard from "@/components/admin/ecommerce/DemographicCard";
import { EcommerceMetrics } from "@/components/admin/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/admin/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/admin/ecommerce/MonthlyTarget";
import RecentOrders from "@/components/admin/ecommerce/RecentOrders";
import StatisticsChart from "@/components/admin/ecommerce/StatisticsChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Analytics • Admin Panel | Zuno AI",
    description: "View analytics, sales, revenue, demographics and orders",
};

async function getDashboardData() {
    try {
        const res = await fetch(
            `${process.env.APP_URL}/api/admin/dashboard`,
            { cache: "no-store" }
        );
        console.log("🚀 ~ getDashboardData ~ res:", res)

        if (!res.ok) {
            console.error("Dashboard fetch failed:", res.status);
            return null;
        }

        const json = await res.json();
        return json?.data ?? null;
    } catch (error) {
        console.error("Dashboard error:", error);
        return null;
    }
}

export default async function DashboardPage() {
    const dashboardData = await getDashboardData();

    if (!dashboardData) {
        return (
            <div className="px-10 py-10">
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
                    <h2 className="text-lg font-semibold">
                        Dashboard temporarily unavailable
                    </h2>
                    <p className="mt-2 text-sm">
                        We couldn’t load analytics data right now. Please try
                        again later.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-12 px-10 gap-4 md:gap-6">
            <div className="col-span-12 xl:col-span-7 space-y-6">
                <EcommerceMetrics data={dashboardData.overview} />
                <MonthlySalesChart data={dashboardData.monthlySales} />
            </div>

            <div className="col-span-12 xl:col-span-5">
                <MonthlyTarget data={dashboardData.MonthlyTarget} />
            </div>

            <div className="col-span-12">
                <StatisticsChart
                    subscriptions={dashboardData.subscriptionsPerMonth}
                    revenue={dashboardData.revenuePerMonth}
                />
            </div>

            <div className="col-span-12 xl:col-span-5">
                <DemographicCard data={dashboardData.demographics} />
            </div>

            <div className="col-span-12 xl:col-span-7">
                <RecentOrders
                    payments={dashboardData.recentPayments}
                />
            </div>
        </div>
    );
}