"use client";

export default function BillingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-7xl rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-lg space-y-6">
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