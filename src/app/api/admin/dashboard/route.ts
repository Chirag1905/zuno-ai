import prisma from "@/lib/prisma";
import { apiResponse } from "@/utils/apiResponse";

/* ---------------- CONSTANTS ---------------- */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ---------------- UTILS ---------------- */
function calculateGrowth(current: number, previous: number): number {
    if (current === 0 && previous === 0) return 0;
    if (previous === 0) return 100;
    return Math.round(((current - previous) / previous) * 100);
}

function emptyMonthlyArray() {
    return MONTHS.map((m) => ({ month: m, value: 0 }));
}

/* ---------------- API ---------------- */
export async function GET() {
    try {
        const now = new Date();
        const year = now.getUTCFullYear();

        /* ---------- DATE RANGES (UTC SAFE) ---------- */
        const startOfYear = new Date(Date.UTC(year, 0, 1));
        const startOfNextYear = new Date(Date.UTC(year + 1, 0, 1));

        const startOfMonth = new Date(Date.UTC(year, now.getUTCMonth(), 1));
        const startOfNextMonth = new Date(Date.UTC(year, now.getUTCMonth() + 1, 1));
        const startOfLastMonth = new Date(Date.UTC(year, now.getUTCMonth() - 1, 1));

        const startOfToday = new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate()));
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setUTCDate(startOfYesterday.getUTCDate() - 1);

        /* ---------- OVERVIEW ---------- */
        const [
            totalCustomers,
            todayCustomers,
            yesterdayCustomers,
            totalSubscriptions,
            todaySubscriptions,
            yesterdaySubscriptions,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
            prisma.user.count({ where: { createdAt: { gte: startOfYesterday, lt: startOfToday } } }),
            prisma.subscription.count(),
            prisma.subscription.count({ where: { createdAt: { gte: startOfToday } } }),
            prisma.subscription.count({ where: { createdAt: { gte: startOfYesterday, lt: startOfToday } } }),
        ]);

        const overview = {
            customers: {
                total: totalCustomers,
                growth: calculateGrowth(todayCustomers, yesterdayCustomers),
            },
            subscriptions: {
                total: totalSubscriptions,
                growth: calculateGrowth(todaySubscriptions, yesterdaySubscriptions),
            },
        };

        /* ---------- MONTHLY SALES ---------- */
        const payments = await prisma.payment.findMany({
            where: {
                status: "success",
                createdAt: { gte: startOfYear, lt: startOfNextYear },
            },
            select: { amount: true, createdAt: true },
        });

        const monthlySales = emptyMonthlyArray();

        payments.forEach((p) => {
            const m = p.createdAt.getUTCMonth();
            monthlySales[m].value += p.amount / 100;
        });

        /* ---------- MONTHLY TARGET ---------- */
        const [currentMonth, lastMonth, todayRevenue] = await Promise.all([
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: "success",
                    createdAt: { gte: startOfMonth, lt: startOfNextMonth },
                },
            }),
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: "success",
                    createdAt: { gte: startOfLastMonth, lt: startOfMonth },
                },
            }),
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: "success",
                    createdAt: { gte: startOfToday },
                },
            }),
        ]);

        const TARGET = 20000;
        const revenue = (currentMonth._sum.amount ?? 0) / 100;
        const prevRevenue = (lastMonth._sum.amount ?? 0) / 100;

        const MonthlyTarget = {
            target: TARGET,
            revenue,
            today: (todayRevenue._sum.amount ?? 0) / 100,
            progress: Math.min(Math.round((revenue / TARGET) * 100), 100),
            growth: calculateGrowth(revenue, prevRevenue),
        };

        /* ---------- STATISTICS (CHART DATA) ---------- */
        const subscriptionsPerMonth = emptyMonthlyArray();
        const revenuePerMonth = emptyMonthlyArray();

        const subs = await prisma.subscription.findMany({
            where: { createdAt: { gte: startOfYear } },
            select: { createdAt: true },
        });

        subs.forEach((s) => {
            subscriptionsPerMonth[s.createdAt.getUTCMonth()].value += 1;
        });

        payments.forEach((p) => {
            revenuePerMonth[p.createdAt.getUTCMonth()].value += p.amount / 100;
        });

        /* ---------- DEMOGRAPHICS ---------- */
        const usersByCountry = await prisma.user.groupBy({
            by: ["country"],
            _count: { id: true },
        });

        const totalUsers = usersByCountry.reduce((a, b) => a + b._count.id, 0);

        const demographics = usersByCountry.map((u) => ({
            country: u.country ?? "Unknown",
            customers: u._count.id,
            percentage: totalUsers
                ? Math.round((u._count.id / totalUsers) * 100)
                : 0,
        }));

        /* ---------- RECENT ---------- */
        const [recentSubscriptions, recentPayments] = await Promise.all([
            prisma.subscription.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { plan: true, user: { select: { email: true } } },
            }),
            prisma.payment.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: { user: { select: { email: true } } },
            }),
        ]);

        /* ---------- RESPONSE ---------- */
        return apiResponse(true, "Dashboard loaded", {
            overview,
            monthlySales,
            MonthlyTarget,
            subscriptionsPerMonth,
            revenuePerMonth,
            demographics,
            recentSubscriptions,
            recentPayments,
        });
    } catch (error) {
        console.error("[DASHBOARD_ERROR]", error);
        return apiResponse(false, "Failed to load dashboard", null, error, 500);
    }
}