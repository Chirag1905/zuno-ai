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
    const res = await fetch(`${process.env.APP_URL}/api/admin/dashboard`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch dashboard");

    const json = await res.json();
    return json.data;
}

export default async function DashboardPage() {
    const dashboardData = await getDashboardData();

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