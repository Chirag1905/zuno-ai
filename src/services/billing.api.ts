import api from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import {
    Plan,
    RazorpayCheckoutResponse,
    RazorpayVerifyPayload,
    StripeCheckoutResponse,
    Subscription,
} from "@/types/billing";

export const billingService = {
    getPlans: () =>
        api.get<ApiResponse<Plan[]>>("/api/billing/plans"),

    createRazorpayCheckout: (planId: string) =>
        api.post<ApiResponse<RazorpayCheckoutResponse>>("/api/billing/razorpay/checkout", { planId }),

    verifyRazorpayPayment: (payload: RazorpayVerifyPayload) =>
        api.post<ApiResponse<null>>("/api/billing/razorpay/verify", payload),

    createStripeCheckout: (planId: string) =>
        api.post<ApiResponse<StripeCheckoutResponse>>("/api/billing/stripe/checkout", { planId }),

    cancelSubscription: () =>
        api.post<ApiResponse<null>>("/api/billing/cancel"),

    upgradePlan: (newPlanId: string) =>
        api.post<ApiResponse<Subscription>>("/api/billing/upgrade", { newPlanId }),

    downgradePlan: (newPlanId: string) =>
        api.post<ApiResponse<null>>("/api/billing/downgrade", { newPlanId }),
};
