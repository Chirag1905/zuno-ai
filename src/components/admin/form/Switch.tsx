"use client";
import React, { useEffect, useState } from "react";

interface SwitchProps {
  label: string;
  defaultChecked?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: "blue" | "gray";
}

const Switch: React.FC<SwitchProps> = ({
  label,
  defaultChecked = false,
  checked,
  disabled = false,
  onChange,
  color = "blue",
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  // Sync with controlled checked prop
  useEffect(() => {
    if (checked !== undefined) {
      setInternalChecked(checked);
    }
  }, [checked]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    const newChecked = !internalChecked;

    // Update internal state only if uncontrolled
    if (checked === undefined) {
      setInternalChecked(newChecked);
    }

    onChange?.(newChecked);
  };

  const currentChecked = checked !== undefined ? checked : internalChecked;

  /** Dynamic colors */
  const switchColors =
    color === "blue"
      ? {
          background: currentChecked
            ? "bg-brand-500"
            : "bg-gray-200 dark:bg-white/10",
          knob: "bg-white",
        }
      : {
          background: currentChecked
            ? "bg-gray-800 dark:bg-white/10"
            : "bg-gray-200 dark:bg-white/10",
          knob: "bg-white",
        };

  return (
    <label
      className={`flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${
        disabled ? "text-gray-400" : "text-gray-700 dark:text-gray-400"
      }`}
      onClick={handleToggle}
    >
      {/* Switch Container */}
      <div className="relative w-11 h-6">
        {/* Background */}
        <div
          className={`block transition duration-200 ease-in-out w-11 h-6 rounded-full ${
            disabled
              ? "bg-gray-100 pointer-events-none dark:bg-gray-800"
              : switchColors.background
          }`}
        ></div>

        {/* Knob */}
        <div
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full shadow-theme-sm transform transition-transform duration-200 ease-in-out ${switchColors.knob} ${
            currentChecked ? "translate-x-[22px]" : "translate-x-0"
          }`}
        ></div>
      </div>

      {/* Label */}
      {label}
    </label>
  );
};

export default Switch;
