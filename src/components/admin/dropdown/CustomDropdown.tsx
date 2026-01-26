"use client";
import React, { useState, useEffect, useRef } from "react";

interface DropdownItem {
  label: string;
  onClick?: () => void;
}

interface CustomDropdownProps {
  buttonLabel: string;
  menuItems: DropdownItem[];
  className?: string;
  position?: "left" | "right" | "center";
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  buttonLabel,
  menuItems,
  className = "",
  position = "left",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Determine position classes
  const positionClasses =
    position === "right"
      ? "right-0"
      : position === "center"
        ? "left-1/2 transform -translate-x-1/2"
        : "left-0";

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Dropdown Button */}
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
      >
        {buttonLabel}
        <svg
          className={`duration-200 ease-in-out stroke-current transform ${isOpen ? "rotate-180" : "rotate-0"
            }`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.79199 7.396L10.0003 12.6043L15.2087 7.396"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute top-full z-40 mt-2 min-w-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-[#1E2635] ${positionClasses}`}
        >
          <ul className="flex flex-col gap-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => {
                    item.onClick?.();
                    closeDropdown();
                  }}
                  className="block w-full text-left flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
