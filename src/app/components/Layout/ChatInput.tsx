"use client";
interface ChatInputProps {
    input: string;
    setInput: (value: string) => void;
    sendMessage: () => void;
}

export default function ChatInput({ input, setInput, sendMessage }: ChatInputProps) {
    return (
        <div className="w-full mx-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-900 dark:bg-gray-900">
            {/* Textarea */}
            <textarea
                className="h-20 w-full resize-none border-none bg-transparent p-0 font-normal text-gray-800 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white"
                placeholder="Type your prompt here to zuno..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            {/* Bottom Section */}
            <div className="flex items-center justify-between pt-2">
                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    {/* Attach Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                        <path d="M14.4194 11.7679L15.4506 10.7367C17.1591 9.02811 17.1591 6.25802 15.4506 4.54947C13.742 2.84093 10.9719 2.84093 9.2634 4.54947L8.2322 5.58067M11.77 14.4172L10.7365 15.4507C9.02799 17.1592 6.2579 17.1592 4.54935 15.4507C2.84081 13.7422 2.84081 10.9721 4.54935 9.26352L5.58285 8.23002M11.7677 8.23232L8.2322 11.7679" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                    Attach
                </button>
                {/* Send Button */}
                <button
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white transition hover:bg-gray-800 dark:bg-white/90 dark:text-gray-800 dark:hover:bg-gray-900 dark:hover:text-white/90"
                    onClick={sendMessage}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none">
                        <path d="M9.99674 3.33252L9.99675 16.667M5 8.32918L9.99984 3.33252L15 8.32918" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
}
