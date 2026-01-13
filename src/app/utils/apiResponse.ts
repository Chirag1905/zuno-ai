import { NextResponse } from "next/server";

export const apiResponse = (
    success: boolean,
    message: string,
    data: unknown = null,
    error: unknown = null,
    status: number = 200,
    meta: Record<string, unknown> | null = null
) =>
    NextResponse.json(
        {
            success,
            status,
            message,
            data,
            error,
            ...(meta ? { meta } : {}),
        },
        { status }
    );