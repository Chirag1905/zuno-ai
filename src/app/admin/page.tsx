import DemographicCard from "@/components/admin/ecommerce/DemographicCard";
import { EcommerceMetrics } from "@/components/admin/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/admin/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/admin/ecommerce/MonthlyTarget";
import RecentOrders from "@/components/admin/ecommerce/RecentOrders";
import StatisticsChart from "@/components/admin/ecommerce/StatisticsChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Dashboard - Zuno AI",
    description: "Admin dashboard overview for Zuno AI",
};

export default function AdminDashboard() {
    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 space-y-6 xl:col-span-7">
                <EcommerceMetrics />
                <MonthlySalesChart />
            </div>

            <div className="col-span-12 xl:col-span-5">
                <MonthlyTarget />
            </div>

            <div className="col-span-12">
                <StatisticsChart />
            </div>

            <div className="col-span-12 xl:col-span-5">
                <DemographicCard />
            </div>

            <div className="col-span-12 xl:col-span-7">
                <RecentOrders />
            </div>
        </div>
    );
}


// import prisma from "@/lib/prisma";

// export default async function AdminDashboard() {
//     const [users, chats] = await Promise.all([
//         prisma.user.count(),
//         prisma.chat.count(),
//     ]);

//     return (
//         <div className="grid grid-cols-2 gap-6">
//             <Stat title="Users" value={users} />
//             <Stat title="Chats" value={chats} />
//         </div>
//     );
// }

// function Stat({ title, value }) {
//     return (
//         <div className="p-6 rounded-xl bg-white/5 border border-white/10">
//             <h2 className="text-gray-400">{title}</h2>
//             <p className="text-3xl font-bold">{value}</p>
//         </div>
//     );
// }