"use client";

import React, { useId } from "react";
import clsx from "clsx";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  accentColor: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { track: "w-9 h-5", knob: "w-4 h-4 translate-x-4" },
  md: { track: "w-11 h-6", knob: "w-5 h-5 translate-x-5" },
  lg: { track: "w-14 h-7", knob: "w-6 h-6 translate-x-7" },
};

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  accentColor,
  size = "md",
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
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />

      <div
        className={clsx(
          "relative rounded-full transition-colors",
          sizes[size].track,
          checked ? accentColor : "bg-white/20"
        )}
      >
        <div
          className={clsx(
            "absolute top-0.5 left-0.5 rounded-full bg-white transition-transform",
            checked ? sizes[size].knob : "translate-x-0",
            sizes[size].knob.replace(/translate-x-\d/, "")
          )}
        />
      </div>

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

export default Switch;
