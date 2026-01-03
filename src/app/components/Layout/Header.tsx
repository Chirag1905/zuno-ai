"use client";
import { IconButton } from "@/app/utils/Icon";
import ZunoLogo from "@/app/utils/zunoLogo";
import { Menu, X, Droplet, Sparkles, Apple, Crown } from "lucide-react";

export default function Header({ toggleSidebar, sidebarOpen, uiTheme, setUiTheme }) {
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
        className="fixed top-4 right-4 z-50 flex items-center gap-3 bg-gray-900/60 backdrop-blur-xl border border-gray-700/60 rounded-full px-3 py-2 shadow-xl"
      >
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg md:hidden bg-gray-800/60 hover:bg-gray-700 transition"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <button onClick={() => setUiTheme("glass")}><Droplet size={18} /></button>
        <button onClick={() => setUiTheme("neon")}><Sparkles size={18} /></button>
        <button onClick={() => setUiTheme("apple")}><Apple size={18} /></button>
        <button onClick={() => setUiTheme("premium")}><Crown size={18} /></button>
      </header>
    </>
  );
}
