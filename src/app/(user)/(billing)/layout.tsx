"use client";

export default function BillingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-950">
            <div className="w-full rounded-3xl bg-neutral-950 shadow-lg space-y-6">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-500 ease-in-out">
                        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-225 h-225 bg-blue-600/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-225 h-225 bg-purple-600/10 rounded-full blur-[120px]" />
                    </div>
                </div>
                {children}
            </div>
        </main>
    );
}