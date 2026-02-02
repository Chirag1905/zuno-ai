"use client";

import React, { FC, useState } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";
import Icon from "@/components/ui/Icon";

/* ===================== TYPES ===================== */

type InputProps = {
    type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
    name?: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;

    /** UI States */
    success?: boolean;
    errorMessage?: string;
    hint?: string;

    className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/* ===================== COMPONENT ===================== */

const Input: FC<InputProps> = ({
    type = "text",
    name,
    id,
    placeholder,
    disabled = false,
    required = false,
    success = false,
    errorMessage,
    hint,
    className,
    ...rest
}) => {
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);

    const inputClasses = clsx(
        "h-10 w-full rounded-xl border px-4 py-2 text-sm",
        "bg-white/5 text-white placeholder:text-neutral-400",
        "focus:outline-none focus:ring-2",
        {
            "cursor-not-allowed opacity-60 border-neutral-700": disabled,
            "border-red-500 focus:ring-red-500/20": errorMessage,
            "border-success-400 focus:ring-success-500/20":
                success && !errorMessage,
            "border-neutral-700 focus:border-brand-500 focus:ring-brand-500/20":
                !disabled && !errorMessage && !success,
        },
        isPassword && "pr-12",
        className
    );

    return (
        <div className="space-y-1">
            <div className="relative">
                <input
                    id={id}
                    name={name}
                    type={isPassword && showPassword ? "text" : type}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className={inputClasses}
                    {...rest}
                />

                {/* 👁 Password Toggle */}
                {isPassword && (
                    <button
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                    >
                        <Icon name={showPassword ? "EyeOff" : "Eye"} size={18} />
                    </button>
                )}
            </div>

            {/* ❌ Error */}
            {errorMessage && (
                <p className="text-xs text-red-500">{errorMessage}</p>
            )}

            {/* ℹ Hint */}
            {!errorMessage && hint && (
                <p
                    className={clsx(
                        "text-xs",
                        success ? "text-success-500" : "text-neutral-400"
                    )}
                >
                    {hint}
                </p>
            )}
        </div>
    );
};

export default Input;