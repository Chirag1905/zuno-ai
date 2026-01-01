export default function MessageBubble({ text, isUser }: { text: string; isUser: boolean }) {
    return (
        <div
            className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed font-medium backdrop-blur-xl shadow
      ${isUser
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-gray-800/70 text-gray-200 border border-gray-700"
                }`}
        >
            {text}
        </div>
    );
}
