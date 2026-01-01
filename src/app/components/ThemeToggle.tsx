"use client";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [isLight, setIsLight] = useState(false);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", !isLight);
    }, [isLight]);

    return (
        <button
            onClick={() => setIsLight(!isLight)}
            className="p-2 bg-gray-800/60 rounded-full hover:bg-gray-700"
        >
            {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
}
