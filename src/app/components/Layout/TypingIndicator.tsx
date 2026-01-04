export default function TypingIndicator() {
    return (
        <div className="flex items-center max-w-fit rounded-2xl px-4 py-2 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
            <div className="flex items-center gap-1">
                <span className="dot dot-1" />
                <span className="dot dot-2" />
                <span className="dot dot-3" />
            </div>
        </div>
    );
}
