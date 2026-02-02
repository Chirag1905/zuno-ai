export interface ApiResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T;
    error?: unknown;
}
export interface PaginatedResponse<T> {
    success: boolean;
    status: number;
    message: string;
    data: T[];
    error?: unknown;
    meta?: {
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}
