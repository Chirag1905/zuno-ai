const styles = {
    glass: "bg-white/10 backdrop-blur-md border border-white/20",
    neon: "bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_12px_rgba(138,43,226,0.4)]",
    apple: "bg-white text-gray-900 border border-gray-200 shadow-md",
    premium: "bg-gray-800 text-gray-100 border border-gray-700 shadow-md",
};

export default function MessageBubble({ text, isUser, uiTheme }) {
    return (
        <div
            className={`max-w-[75%] px-4 py-3 text-sm rounded-2xl transition
       ${isUser ? "ml-auto bg-blue-500 text-white" : `mr-auto ${styles[uiTheme]}`}
      `}
        >
            {text}
        </div>
    );
}
