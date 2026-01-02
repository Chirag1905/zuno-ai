"use client";
import { IconButton } from "@/app/utils/Icon";
import { Menu, X, Droplet, Sparkles, Apple, Crown } from "lucide-react";

export default function Header({ toggleSidebar, sidebarOpen, uiTheme, setUiTheme }) {
  return (
    <header className="w-full px-4 py-3 flex justify-end items-center top-0 z-20">
      {/* FLOATING MINI BAR WHEN SIDEBAR CLOSED */}
      {!sidebarOpen && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 transition-all duration-800 ease-in-out">
          <h1 className="text-xl font-bold tracking-wide text-blue-500 pl-1">
            Zuno AI
          </h1>
          <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-full px-1 py-0.5 flex items-center shadow-xl">
            <IconButton
              icon="PanelRightClose"
              size="lg"
              variant="minimal"
              compact
              iconClassName="text-blue-400"
              onClick={toggleSidebar}
            />
            <IconButton
              icon="MessageCirclePlus"
              size="lg"
              variant="minimal"
              compact
              iconClassName="text-blue-400"
            // onClick={onNewChat}
            />
          </div>
        </div>
  )
}

      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg md:hidden bg-gray-800/60 hover:bg-gray-700 transition"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <div className="flex gap-2">
        <button onClick={() => setUiTheme("glass")}><Droplet size={18} /></button>
        <button onClick={() => setUiTheme("neon")}><Sparkles size={18} /></button>
        <button onClick={() => setUiTheme("apple")}><Apple size={18} /></button>
        <button onClick={() => setUiTheme("premium")}><Crown size={18} /></button>
      </div>

    </header >
  );
}
