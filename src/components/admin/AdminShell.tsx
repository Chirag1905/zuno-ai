"use client";

import Backdrop from "@/components/admin/layout/Backdrop";
import Header from "@/components/admin/layout/Header";
import Sidebar from "@/components/admin/layout/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import { Toaster } from "react-hot-toast";


/* ---------------- INNER SHELL (uses hook) ---------------- */
function AdminShellInner({ children }: { children: React.ReactNode }) {
    const { isExpanded, isHovered, isMobileOpen } = useSidebar();

    const mainContentMargin = isMobileOpen
        ? "ml-0"
        : isExpanded || isHovered
            ? "lg:ml-[290px]"
            : "lg:ml-[90px]";

    return (
        <div className="flex min-h-screen">
            {/* <Toaster
                position="top-right"
                toastOptions={{
                    loading: {
                        duration: Infinity,
                    },
                    success: {
                        duration: 5000, // success toast visible for 5s
                    },
                    error: {
                        duration: 3000,
                    },
                }}
            /> */}
            <Sidebar />
            <Backdrop />
            <div
                className={`flex-1 overflow-x-hidden transition-all duration-300 ease-in-out ${mainContentMargin}`}
            >
                <Header />
                <div className="h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
            </div>
        </div>
    );
}

/* ---------------- OUTER SHELL (provider only) ---------------- */
export default function AdminProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <AdminShellInner>{children}</AdminShellInner>
        </SidebarProvider>
    );
}


// "use client";

// import AdminSidebar from "@/app/admin/_components/AdminSidebar";
// import Backdrop from "@/app/admin/_components/Backdrop";
// import Header from "@/app/admin/_components/Header";
// import { SidebarProvider, useSidebar } from "@/app/admin/_components/SidebarContext";

// export default function AdminShell({
//     children,
// }: {
//     children: React.ReactNode;
// }) {
//     const { isExpanded, isHovered, isMobileOpen } = useSidebar();

//     // Dynamic class for main content margin based on sidebar state
//     const mainContentMargin = isMobileOpen
//         ? "ml-0"
//         : isExpanded || isHovered
//             ? "lg:ml-[290px]"
//             : "lg:ml-[90px]";

//     return (
//         <SidebarProvider>
//             <div className="flex min-h-screen">
//                 <AdminSidebar />
//                 <Backdrop />
//                 <div
//                     className={`flex-1 overflow-x-hidden transition-all duration-300 ease-in-out ${mainContentMargin}`}
//                 >
//                     <Header />
//                     <div className="h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
//                 </div>
//             </div>
//         </SidebarProvider>
//     );
// }
