"use client";

export default function SidebarSkeleton() {
    return (
        <aside className="fixed left-5 top-5 bottom-5 z-40 w-80">
            <div className="h-full flex flex-col rounded-4xl bg-linear-to-b from-gray-900/95 to-gray-950/95 backdrop-blur-xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">

                {/* HEADER */}
                <div className="px-5 py-4 flex justify-between items-center border-b border-white/10">
                    <div className="h-6 w-28 rounded-md shimmer" />
                    <div className="h-8 w-8 rounded-full shimmer" />
                </div>

                {/* NEW CHAT */}
                <div className="px-3 py-4">
                    <div className="h-10 w-full rounded-3xl shimmer" />
                </div>

                {/* CHAT LIST */}
                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between px-3 py-2 rounded-2xl"
                        >
                            <div className="h-4 w-44 rounded-md shimmer" />
                            <div className="h-5 w-5 rounded-full shimmer" />
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="px-5 py-4 border-t border-white/10 flex justify-between items-center">
                    <div className="h-4 w-24 rounded-md shimmer" />
                    <div className="h-6 w-6 rounded-full shimmer" />
                </div>
            </div>
        </aside>
    );
}