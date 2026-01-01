"use client";

export default function ChatInput({ input, setInput, sendMessage, uiTheme }) {

    const themeStyle = {
        glass: "bg-white/10 backdrop-blur-xl border-white/20",
        neon: "bg-gray-900 border-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]",
        apple: "bg-white text-black border border-gray-300 shadow-sm",
        premium: "bg-gray-900 border-gray-800 shadow-md",
    };

    return (
        <div className={`w-full px-4 py-2 rounded-3xl flex gap-2 ${themeStyle[uiTheme]}`}>
            <textarea
                className="flex-1 bg-transparent text-sm focus:outline-none resize-none"
                rows={2}
                placeholder="Type your prompt here to Zuno..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 px-4 rounded-lg transition"
            >
                ➤
            </button>
        </div>
    );
}
