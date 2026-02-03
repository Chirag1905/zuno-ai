"use client";

import React, { useId } from "react";
import Icon from "@/components/ui/Icon";
import clsx from "clsx";

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    accentColor: string;
    className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    onChange,
    label,
    disabled = false,
    accentColor,
    className = "",
}) => {
    const id = useId();

    return (
        <label
            htmlFor={id}
            className={clsx(
                "flex items-center gap-3 select-none",
                disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
                className
            )}
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only"
            />

            <span
                className={clsx(
                    "w-4 h-4 rounded-md border flex items-center justify-center transition-all",
                    checked
                        ? `${accentColor} border-transparent scale-110`
                        : "border-white/40"
                )}
            >
                {checked && <Icon name="Check" size={12} color="white" />}
            </span>

            {label && <span className="text-sm text-white">{label}</span>}
        </label>
    );
};

export default Checkbox;
