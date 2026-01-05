"use client";
import { useUIStore } from "@/app/store";
import { Menu, X, Droplet, Sparkles, Apple, Crown } from "lucide-react";
import ZunoLogo from "../ui/zunoLogo";
import { IconButton } from "../ui/Icon";
import { LLMStatus } from "../ui/LLMStatus";
import { ModelSelector } from "../ui/ModelSelector";

export default function Header() {

  const { theme, sidebarOpen, setTheme, toggleSidebar } = useUIStore();

  return (
    <>
      {/* LEFT FLOATING BAR (when sidebar closed) */}
      {!sidebarOpen && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
          {/* <h1 className="text-xl font-bold tracking-wide text-blue-500">
            Zuno AI
          </h1> */}
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
        {/* <ModelSelector /> */}
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
