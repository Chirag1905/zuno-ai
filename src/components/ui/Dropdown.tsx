"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface DropdownItemProps {
  children: React.ReactNode;
  onItemClick?: () => void;
  className?: string;
  tag?: "button" | "a";
  href?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onItemClick,
  className = "",
  tag = "button",
  href,
}) => {
  const Component = tag;
  const props: React.HTMLAttributes<HTMLElement> & { href?: string } = {
    onClick: onItemClick,
    className: `w-full text-left flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 ${className}`,
  };

  if (tag === "a" && href) {
    props.href = href;
  }

  return (
    <li>
      <Component {...props}>{children}</Component>
    </li>
  );
};

interface DropdownProps {
  buttonLabel?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  position?: "left" | "right" | "center";
  children?: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  buttonLabel,
  isOpen: propsIsOpen,
  onClose,
  className = "",
  position = "left",
  children,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOpen = propsIsOpen !== undefined ? propsIsOpen : internalIsOpen;

  const toggleDropdown = () => {
    if (propsIsOpen === undefined) {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  const closeDropdown = useCallback(() => {
    if (onClose) {
      onClose();
    }
    setInternalIsOpen(false);
  }, [onClose]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeDropdown]);

  // Determine position classes
  const positionClasses =
    position === "right"
      ? "right-0"
      : position === "center"
        ? "left-1/2 transform -translate-x-1/2"
        : "left-0";

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Dropdown Button (Optional if controlled externally but usually present) */}
      {buttonLabel && (
        <button
          onClick={toggleDropdown}
          className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
        >
          {buttonLabel}
          <svg
            className={`duration-200 ease-in-out stroke-current transform ${isOpen ? "rotate-180" : "rotate-0"}`}
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
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute top-full z-40 mt-2 min-w-fit rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-[#1E2635] ${positionClasses}`}
        >
          <ul className="flex flex-col gap-1">
            {children}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
