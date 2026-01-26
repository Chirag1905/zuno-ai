import type { Metadata } from "next";

import { EcommerceMetrics } from "@/components/admin/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/admin/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/admin/ecommerce/MonthlyTarget";
import StatisticsChart from "@/components/admin/ecommerce/StatisticsChart";
import DemographicCard from "@/components/admin/ecommerce/DemographicCard";
import RecentOrders from "@/components/admin/ecommerce/RecentOrders";

export const metadata: Metadata = {
    title: "Analytics • Admin Panel | Zuno AI",
    description:
        "View detailed analytics including sales performance, revenue trends, demographics, and recent orders in the Zuno AI admin panel.",
};

export default function AnalyticsPage() {
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            {/* Top Metrics + Sales */}
            <div className="col-span-12 xl:col-span-7 space-y-6">
                <EcommerceMetrics />
                <MonthlySalesChart />
            </div>

            {/* Monthly Target */}
            <div className="col-span-12 xl:col-span-5">
                <MonthlyTarget />
            </div>

            {/* Statistics */}
            <div className="col-span-12">
                <StatisticsChart />
            </div>

            {/* Demographics */}
            <div className="col-span-12 xl:col-span-5">
                <DemographicCard />
            </div>

            {/* Recent Orders */}
            <div className="col-span-12 xl:col-span-7">
                <RecentOrders />
            </div>
        </div>
    );
}
