"use client";

import React, { useId } from "react";
import clsx from "clsx";

interface RadioProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  accentColor: string;
  className?: string;
}

const Radio: React.FC<RadioProps> = ({
  name,
  value,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  accentColor,
  className = "",
}) => {
  const id = useId();

  return (
    <label
      htmlFor={id}
      className={clsx(
        "flex items-start gap-3 select-none",
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        className
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="sr-only"
      />

      <span
        className={clsx(
          "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
          checked
            ? `${accentColor} border-transparent scale-110`
            : "border-white/40"
        )}
      >
        <span
          className={clsx(
            "w-2 h-2 rounded-full bg-white",
            checked ? "opacity-100" : "opacity-0"
          )}
        />
      </span>

      {(label || description) && (
        <div>
          {label && <p className="text-sm text-white">{label}</p>}
          {description && (
            <p className="text-xs text-white/60">{description}</p>
          )}
        </div>
      )}
    </label>
  );
};

export default Radio;
