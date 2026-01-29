"use client";
import React, { useState, useRef, useEffect } from "react";

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
  label?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onChange,
  label = "Select Color"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Predefined color palette
  const colorPalette = [
    "#FF5733", // Red-Orange
    "#33FF57", // Green
    "#3357FF", // Blue
    "#FF33F5", // Pink
    "#F5FF33", // Yellow
    "#33FFF5", // Cyan
    "#FF8C33", // Orange
    "#8C33FF", // Purple
    "#33FF8C", // Light Green
    "#FF3333", // Red
    "#33B8FF", // Light Blue
    "#B833FF", // Violet
    "#FFB833", // Gold
    "#83FF33", // Lime
    "#FF3383", // Rose
    "#3883FF", // Royal Blue
    "#FF6B33", // Coral
    "#6B33FF", // Indigo
    "#33FFB8", // Aqua
    "#FFD700", // Gold
    "#9370DB", // Medium Purple
    "#32CD32", // Lime Green
    "#FF69B4", // Hot Pink
    "#1E90FF", // Dodger Blue
  ];

  const handleColorSelect = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>

      {/* Color Display Button - Match input field styling */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full py-2.5 px-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 hover:border-gray-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm"
      >
        <div
          className="w-5 h-5 rounded border border-gray-400 dark:border-gray-500 shrink-0"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-gray-700 dark:text-gray-300 font-mono text-sm flex-1 text-left">
          {selectedColor.toUpperCase()}
        </span>
        <svg
          className={`w-4 h-4 transition-transform text-gray-500 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Color Palette Dropdown - Compact Version */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden max-w-xs">
          {/* Header */}
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200">Choose Color</h4>
          </div>

          <div className="p-3">
            {/* Color Palette Section */}
            <div className="mb-3">
              <div className="grid grid-cols-8 gap-1">
                {colorPalette.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorSelect(color)}
                    className={`w-6 h-6 rounded shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 ${selectedColor === color
                      ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-white dark:ring-offset-gray-800 shadow-md scale-105'
                      : 'hover:ring-1 hover:ring-gray-300'
                      }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Custom Color Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Custom
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={handleCustomColorChange}
                  className="w-8 h-8 border border-gray-200 dark:border-gray-600 rounded cursor-pointer bg-white dark:bg-gray-700 shadow-sm"
                />
                <input
                  type="text"
                  value={selectedColor}
                  onChange={handleCustomColorChange}
                  placeholder="#000000"
                  className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 shadow-sm"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded border border-gray-300 dark:border-gray-600"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                  {selectedColor.toUpperCase()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker;