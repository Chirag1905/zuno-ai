import { getAdminDashboardData } from "@/services/admin-dashboard.service";
import { apiResponse } from "@/types/apiResponse";

export async function GET() {
    try {
        const data = await getAdminDashboardData();
        return apiResponse(true, "Dashboard loaded", data);
    } catch (error) {
        console.error("[DASHBOARD_ERROR]", error);
        return apiResponse(false, "Failed to load dashboard", null, error, 500);
    }
}