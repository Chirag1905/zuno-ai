"use client";
import { IconButton } from "@/components/ui/Icon";
import { LLMStatus } from "@/components/ui/LLMStatus";
import ZunoLogo from "@/components/ui/ZunoLogo";
import { useChatStore, useUIStore } from "@/store";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const { theme, sidebarOpen, setTheme, toggleSidebar } = useUIStore();
  const startDraftChat = useChatStore(s => s.startDraftChat);

  const handleSubmit = () => {
    startDraftChat();
    router.push('/');
  };

  return (
    <>
      {!sidebarOpen && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
          <ZunoLogo size={45} />
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/60 rounded-full px-1 py-0.5 flex items-center shadow-xl">
            <IconButton
              icon="PanelRightClose"
              size="lg"
              variant="minimal"
              compact
              onClick={toggleSidebar}
            />
            <IconButton
              icon="MessageCirclePlus"
              size="lg"
              variant="minimal"
              compact
              onClick={handleSubmit}
            />
          </div>
        </div>
      )}

      <header
        className="fixed top-4 right-4 z-50 flex items-center bg-gray-900/60 backdrop-blur-xl border border-gray-700/60 rounded-full px-1 shadow-xl"
      >
        <div className="block md:hidden">
          <IconButton
            icon={`${sidebarOpen ? "X" : "Menu"}`}
            size="lg"
            variant="minimal"
            iconClassName="p-2 rounded-lg md:hidden bg-gray-800/60 hover:bg-gray-700 transition"
            textClassName="text-gray-300 text-sm font-medium"
            compact
            onClick={toggleSidebar}
          />
        </div>
        <LLMStatus />
        <IconButton
          icon="Droplet"
          size="md"
          variant="minimal"
          iconClassName={sidebarOpen ? "text-green-400" : "text-gray-50"}
          textClassName="text-gray-300 text-sm font-medium"
          compact
          onClick={() => setTheme("glass")}
        />
        <IconButton
          icon="Sparkles"
          size="md"
          variant="minimal"
          iconClassName={sidebarOpen ? "text-green-400" : "text-gray-50"}
          textClassName="text-gray-300 text-sm font-medium"
          compact
          onClick={() => setTheme("neon")}
        />
        <IconButton
          icon="Apple"
          size="md"
          variant="minimal"
          iconClassName={sidebarOpen ? "text-green-400" : "text-gray-50"}
          textClassName="text-gray-300 text-sm font-medium"
          compact
          onClick={() => setTheme("apple")}
        />
        <IconButton
          icon="Crown"
          size="md"
          variant="minimal"
          iconClassName={sidebarOpen ? "text-green-400" : "text-gray-50"}
          textClassName="text-gray-300 text-sm font-medium"
          compact
          onClick={() => setTheme("premium")}
        />
      </header>
    </>
  );
}
