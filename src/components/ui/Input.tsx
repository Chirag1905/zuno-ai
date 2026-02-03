"use client";

import React, { FC, useRef, useState } from "react";
import clsx from "clsx";
import type { InputHTMLAttributes } from "react";
import Button from "@/components/ui/Button";
import { generatePassword } from "@/lib/passwordGenerator";

type InputProps = {
    type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
    name?: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;

    success?: boolean;
    errorMessage?: string;
    hint?: string;

    allowPasswordGenerate?: boolean;
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
    allowPasswordGenerate = false,
    className,
    value: controlledValue,
    onChange,
    ...rest
}) => {
    const isPassword = type === "password";
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(controlledValue ?? "");
    const inputRef = useRef<HTMLInputElement>(null);

    // Use the controlled value if provided, otherwise use internal state
    const displayValue = controlledValue !== undefined ? controlledValue : internalValue;

    const inputClasses = clsx(
        "h-10 w-full rounded-xl border px-4 py-2 text-sm",
        "bg-white/5 text-white placeholder:text-neutral-400",
        "focus:outline-none focus:ring-1",
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

    const handleGeneratePassword = () => {
        const pwd = generatePassword();
        setInternalValue(pwd);

        // IMPORTANT: update native input value for FormData
        if (inputRef.current) {
            inputRef.current.value = pwd;
            inputRef.current.dispatchEvent(
                new Event("input", { bubbles: true })
            );
        }
    };

    return (
        <div className="space-y-1">
            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    name={name}
                    type={isPassword && showPassword ? "text" : type}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    value={displayValue}
                    onChange={(e) => {
                        setInternalValue(e.target.value);
                        onChange?.(e);
                    }}
                    className={inputClasses}
                    {...rest}
                />

                {allowPasswordGenerate && (
                    <Button
                        type="button"
                        onClick={handleGeneratePassword}
                        icon="Sparkles"
                        iconClassName="text-neutral-400 hover:text-white"
                        className="absolute right-10 top-1/2 -translate-y-1/2"
                    />
                )}

                {/* 👁 Password Toggle */}
                {isPassword && (
                    <Button
                        icon={showPassword ? "EyeOff" : "Eye"}
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassword((p) => !p)}
                        textClassName="text-neutral-400 hover:text-white"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                    />
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