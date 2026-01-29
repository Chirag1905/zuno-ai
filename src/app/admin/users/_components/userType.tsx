export interface userType {
    id: string;
    name?: string | null;
    email: string;
    passsword?: string;
    country?: string | null;
    image?: string | null;

    role: "USER" | "ADMIN" | "SUPER_ADMIN";

    emailVerified: boolean;
    emailVerifiedAt?: string | null;
    mfaEnabled: boolean;

    createdAt?: string;
    updatedAt?: string;
};