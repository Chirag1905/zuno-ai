"use client";

import Icon from "@/components/ui/Icon";
import { useState } from "react";

type Props = {
    name: string;
    type?: "text" | "email" | "password";
    placeholder: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
};

export default function InputField({
    name,
    type = "text",
    placeholder,
    required,
    disabled,
    error,
}: Props) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <div className="space-y-1">
            <div className="relative">
                <input
                    name={name}
                    type={isPassword && showPassword ? "text" : type}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    className={`w-full rounded-xl bg-white/5 border px-3 py-2 text-white pr-12
            ${error ? "border-red-500" : "border-neutral-700"}
          `}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white"
                    >
                        {showPassword ? <Icon name="EyeOff" /> : <Icon name="Eye" />}
                    </button>
                )}
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
