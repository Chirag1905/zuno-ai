export interface Plan {
    id: string;
    name: string;
    price: number;
    currency: string;
    interval: string;
    isFree: boolean;
    maxChats: number;
    maxMessages: number;
    maxTokens: number;
}

export interface RazorpayCheckoutResponse {
    key: string;
    orderId: string;
    amount: number;
    currency: string;
    planId: string;
}

export interface RazorpayVerifyPayload {
    planId: string;
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

export interface StripeCheckoutResponse {
    url: string;
}

export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    status: "ACTIVE" | "EXPIRED" | "CANCELED" | "PENDING";
    startedAt: Date;
    endsAt: Date;
    provider: string;
    billingInterval: string;
    tokensRemaining: number;
}
