"use client";

export default function AuthCard({
    title,
    subtitle,
    children,
    footer,
}: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}) {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-lg space-y-6">
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-500 ease-in-out">
                        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-225 h-225 bg-blue-600/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-225 h-225 bg-purple-600/10 rounded-full blur-[120px]" />
                    </div>
                </div>
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white">{title}</h1>
                    <p className="text-sm text-neutral-400">{subtitle}</p>
                </div>

                {children}

                {footer}
            </div>
        </main>
    );
}
