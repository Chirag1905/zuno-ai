"use client";
import Button from "@/components/ui/Button";

export default function AuthCard({
    title,
    subtitle,
    onBack,
    children,
    footer,
}: {
    title: string;
    subtitle: string;
    onBack?: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
}) {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <div className="relative w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-lg space-y-6">

                {/* 🌌 Big Breathing Glow */}
                <div className="pointer-events-none absolute inset-0">
                    <div
                        className="
                            absolute top-1/2 left-1/2
                            -translate-x-1/2 -translate-y-1/2
                            w-[700px] h-[700px]
                            rounded-full
                            bg-purple-500/50
                            blur-[180px]
                            mix-blend-screen
                            animate-glow-breathe
                        "
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-6">
                    {onBack && (
                        <Button
                            icon="ArrowLeft"
                            text="Back"
                            onClick={onBack}
                            className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition"
                        />
                    )}

                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-white">{title}</h1>
                        <p className="text-sm text-neutral-400">{subtitle}</p>
                    </div>

                    {children}

                    {footer}
                </div>
            </div>
        </main>
    );
}

// "use client";

// import Button from "@/components/ui/Button";

// export default function AuthCard({
//     title,
//     subtitle,
//     onBack,
//     children,
//     footer,
// }: {
//     title: string;
//     subtitle: string;
//     onBack?: () => void;
//     children: React.ReactNode;
//     footer?: React.ReactNode;
// }) {
//     return (
//         <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
//             <div className="relative w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-lg space-y-6">

//                 {/* ✨ Visible Center Glow */}
//                 <div className="pointer-events-none absolute inset-0 z-0">
//                     <div className="absolute top-1/2 left-1/2 
//                         -translate-x-1/2 -translate-y-1/2
//                         w-[520px] h-[520px]
//                         rounded-full
//                         bg-purple-500/40
//                         blur-[160px]
//                         mix-blend-screen"
//                     />
//                 </div>

//                 {/* Content */}
//                 <div className="relative z-10 space-y-6">
//                     {onBack && (
//                         <Button
//                             icon="ArrowLeft"
//                             text="Back"
//                             onClick={onBack}
//                             className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition"
//                         />
//                     )}

//                     <div className="text-center">
//                         <h1 className="text-2xl font-bold text-white">{title}</h1>
//                         <p className="text-sm text-neutral-400">{subtitle}</p>
//                     </div>

//                     {children}

//                     {footer}
//                 </div>
//             </div>
//         </main>
//     );
// }

// "use client";

// import Button from "@/components/ui/Button";

// export default function AuthCard({
//     title,
//     subtitle,
//     onBack,
//     children,
//     footer,
// }: {
//     title: string;
//     subtitle: string;
//     onBack?: () => void;
//     children: React.ReactNode;
//     footer?: React.ReactNode;
// }) {
//     return (
//         <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
//             <div className="relative w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-lg space-y-6 overflow-hidden">

//                 {/* ✨ Center Glow */}
//                 <div className="pointer-events-none absolute inset-0">
//                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
//                         <div className="w-[450px] h-[450px] rounded-full bg-purple-600/20 blur-[140px]" />
//                     </div>
//                 </div>

//                 {/* Back button */}
//                 {onBack && (
//                     <Button
//                         icon="ArrowLeft"
//                         text="Back"
//                         onClick={onBack}
//                         className="relative z-10 flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition"
//                     />
//                 )}

//                 <div className="relative z-10 text-center">
//                     <h1 className="text-2xl font-bold text-white">{title}</h1>
//                     <p className="text-sm text-neutral-400">{subtitle}</p>
//                 </div>

//                 <div className="relative z-10">
//                     {children}
//                 </div>

//                 {footer && <div className="relative z-10">{footer}</div>}
//             </div>
//         </main>
//     );
// }

// "use client";

// import Button from "@/components/ui/Button";

// export default function AuthCard({
//     title,
//     subtitle,
//     onBack,
//     children,
//     footer
// }: {
//     title: string;
//     subtitle: string;
//     onBack?: () => void;
//     children: React.ReactNode;
//     footer?: React.ReactNode;
// }) {
//     return (
//         <main className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
//             <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-950 p-6 shadow-lg space-y-6">
//                 {/* Glow */}
//                 <div className="pointer-events-none absolute inset-0 overflow-hidden">
//                     <div className="absolute inset-0 transition-transform duration-500 ease-in-out">
//                         <div className="absolute top-1/2 bottom-1/2 left-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-225 bg-purple-600/20 rounded-full blur-[120px]" />
//                     </div>
//                 </div>
//                 {/* Back button */}
//                 {onBack && (
//                     <Button
//                         icon="ArrowLeft"
//                         text="Back"
//                         onClick={onBack}
//                         className="z-10 flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition"
//                     />
//                 )}
//                 <div className="text-center">
//                     <h1 className="text-2xl font-bold text-white">{title}</h1>
//                     <p className="text-sm text-neutral-400">{subtitle}</p>
//                 </div>

//                 {children}

//                 {footer}
//             </div>
//         </main>
//     );
// }
