"use client";

import React, { FC, useState } from "react";
import clsx from "clsx";
import Icon from "@/components/user/ui/Icon";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  hint?: string;
  errorMessage?: string;
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  defaultValue,
  onChange,
  className,
  min,
  max,
  step,
  disabled = false,
  success = false,
  hint,
  errorMessage,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const inputClasses = clsx(
    "h-10 w-full rounded-lg border px-4 py-2 text-sm shadow-theme-xs appearance-none placeholder:text-gray-400 focus:outline-none focus:ring-3",
    "dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30",
    {
      "cursor-not-allowed border-gray-300 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400":
        disabled,

      "border-error-500 text-error-800 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500":
        errorMessage,

      "border-success-400 text-success-500 focus:ring-success-500/10 dark:text-success-400 dark:border-success-500":
        success && !errorMessage,

      "border-gray-300 bg-transparent text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800":
        !disabled && !errorMessage && !success,
    },
    isPassword && "pr-11",
    className
  );

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={isPassword && showPassword ? "text" : type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={inputClasses}
      />

      {/* 👁 Password Toggle */}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((p) => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
        >
          <Icon name={showPassword ? "EyeOff" : "Eye"} />
        </button>
      )}

      {/* ❌ Error Message */}
      {errorMessage && (
        <p className="mt-1.5 text-xs text-error-500">{errorMessage}</p>
      )}

      {/* ℹ Hint */}
      {!errorMessage && hint && (
        <p
          className={clsx(
            "mt-1.5 text-xs",
            success ? "text-success-500" : "text-gray-500"
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;