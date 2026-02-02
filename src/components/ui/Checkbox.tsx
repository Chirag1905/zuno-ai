"use client";

import Icon from "@/components/ui/Icon";
import React, { useId } from "react";

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    text?: string;
    disabled?: boolean;
    accentColor?: string;
    className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    onChange,
    text,
    disabled = false,
    accentColor = "bg-emerald-500",
    className = "",
}) => {
    const id = useId();

    return (
        <div
            className={`
                flex items-center gap-3 select-none
                ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
                ${className}
            `}
        >
            {/* Hidden native checkbox (for accessibility) */}
            <input
                id={id}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
            />

            {/*  checkbox */}
            <label
                htmlFor={id}
                className={`
                    w-4 h-4 rounded-md flex items-center justify-center
                    border border-white/40
                    transition-all
                    ${checked ? `${accentColor} border-transparent scale-110 shadow-sm` : ""}
                `}
            >
                {checked && <Icon name="Check" size={12} color="white" />}
            </label>

            {/* Text */}
            {text && (
                <label
                    htmlFor={id}
                    className="text-sm text-white"
                >
                    {text}
                </label>
            )}
        </div>
    );
};

export default Checkbox;