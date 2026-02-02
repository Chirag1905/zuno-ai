import ZunoLogo from "@/components/ui/ZunoLogo";

export function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-3 py-2 select-none">
      {/* Logo container */}
      <div
        className="
          flex items-center justify-center
          w-10 h-10
          rounded-xl
          bg-gray-900/70
          border border-gray-800
          shadow-[0_8px_30px_rgba(0,0,0,0.35)]
        "
      >
        <ZunoLogo size={22} />
      </div>

      {/* Brand text */}
      <div className="flex flex-col leading-tight">
        <span className="text-xl font-bold tracking-tight text-gray-100">
          Zuno
        </span>
        <span className="text-[12px] font-semibold tracking-wide text-brand-500">
          AI Assistant
        </span>
      </div>
    </div>
  );
}
