export default function ZunoLogo({ size = 32 }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="zunoGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#4F8BFF" />
                    <stop offset="100%" stopColor="#7C5CFF" />
                </linearGradient>
            </defs>

            <rect x="3" y="3" width="34" height="34" rx="10" fill="#0B1220" />

            <path
                d="M13 14H27L15 26H27"
                stroke="url(#zunoGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
