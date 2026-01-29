export interface User {
    id?: string;
    name?: string;
    email: string;
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    country?: string;
    image?: string;
    emailVerified?: boolean;
    mfaEnabled?: boolean;
    createdAt?: string;
}