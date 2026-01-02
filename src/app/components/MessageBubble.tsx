const styles = {
    glass: "bg-white/10 backdrop-blur-md border border-white/20",
    neon: "bg-gradient-to-r from-purple-600 to-blue-600 shadow-[0_0_12px_rgba(138,43,226,0.4)]",
    apple: "bg-white text-gray-900 border border-gray-200 shadow-md",
    premium: "bg-gray-800 text-gray-100 border border-gray-700 shadow-md",
};

export default function MessageBubble({ text, isUser, uiTheme }) {
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                //         className={`
                //   max-w-[85%]
                //   rounded-2xl px-4 py-2 text-sm leading-relaxed
                //   ${isUser
                //                 ? "bg-blue-600 text-white rounded-br-md"
                //                 : "bg-gray-800 text-gray-200 rounded-bl-md"}
                // `}
                className={`
    max-w-[75%]
    rounded-2xl px-4 py-2 text-sm leading-relaxed
    shadow-md
    ${isUser
                        ? "bg-blue-600 text-white rounded-br-md"
                        : "bg-white/10 backdrop-blur-md text-gray-200 rounded-bl-md"}
  `}
            >
                {text}
            </div>
        </div>
    );
}
