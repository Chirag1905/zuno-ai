"use client";

import { ArrowDownNarrowWide, ArrowRightIcon, ArrowUpNarrowWide } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type CustomPaginationProps = {
  page: number;
  totalPages: number;
  totalElements: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
};

const rowsOptions = [10, 25, 50, 100];

export default function CustomPagination({
  page,
  totalPages,
  totalElements,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: CustomPaginationProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const delta = 1;

    pages.push(1);

    for (let i = page - delta; i <= page + delta; i++) {
      if (i > 1 && i < totalPages) pages.push(i);
    }

    if (totalPages > 1) pages.push(totalPages);

    return [...new Set(pages)].sort((a, b) => a - b);
  };

  const pageNumbers = getPageNumbers();

  const startItem = totalElements === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const endItem = Math.min(page * rowsPerPage, totalElements);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="border-t border-gray-200 px-6 py-4 dark:border-white/5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {/* Rows per page selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((s) => !s)}
              className="flex w-15 items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              {rowsPerPage}
              {isDropdownOpen ? <ArrowUpNarrowWide /> : <ArrowDownNarrowWide />}
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 mt-2 w-15 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <ul className="max-h-40 overflow-auto">
                  {rowsOptions
                    .filter((size) => size !== rowsPerPage)
                    .map((size) => (
                      <li
                        key={size}
                        onClick={() => {
                          onRowsPerPageChange(size);
                          setIsDropdownOpen(false);
                        }}
                        className="cursor-pointer rounded-lg border-b border-gray-300 px-3 py-2 text-sm last:border-b-0 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700"
                      >
                        {size}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* Total Elements Info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-medium">{startItem}</span> -{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalElements}</span>
          </div>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-3">
          {/* Previous Button */}
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-2 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 transition hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/3"
          >
            <span className="rotate-180">
              <ArrowRightIcon />
            </span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-2">
            {pageNumbers.map((pg, i) => {
              const prev = pageNumbers[i - 1];

              if (prev && pg - prev > 1) {
                return (
                  <React.Fragment key={pg}>
                    <span className="px-2">...</span>
                    <button
                      onClick={() => onPageChange(pg)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition ${pg === page
                        ? "bg-brand-500 text-white"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3"
                        }`}
                    >
                      {pg}
                    </button>
                  </React.Fragment>
                );
              }

              // Regular page button
              return (
                <button
                  key={pg}
                  onClick={() => onPageChange(pg)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition ${pg === page
                    ? "bg-brand-500 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3"
                    }`}
                >
                  {pg}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3"
          >
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
