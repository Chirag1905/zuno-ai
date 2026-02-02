"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from ".";
import { Skeleton } from "antd";
import { toast } from "react-hot-toast";
import { PaginatedResponse } from "@/types/api";
import CustomPagination from "@/components/admin/pagination/CustomPagination";
import Button from "@/components/ui/Button";
import Input from "@/components/admin/form/input/InputField";
import Empty from "@/components/admin/utils/Empty";
import { useSearchParams } from "next/navigation";

// Types
interface RowWithId {
  id: string | number;
}

function isDataKey<T extends object>(
  key: ColumnKey<T>
): key is keyof T {
  return key !== "__srNo";
}

type ColumnKey<T> = keyof T | "__srNo";
interface TableColumn<T extends RowWithId> {
  key: ColumnKey<T>;
  label: string;
  className?: string;
  render?: (
    value: T[keyof T] | undefined,
    row: T,
    index: number
  ) => React.ReactNode;
}

interface TableProps<T extends RowWithId> {
  title?: string;
  buttonName?: string;
  columns: TableColumn<T>[];
  paginatedData: PaginatedResponse<T>;
  onAdd?: () => void;
  onEdit?: (id: string) => void;
  onDelete: (id: string) => void;
  filter?: boolean;
  sorting?: boolean;
  enableSearch?: boolean;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onSearchChange: (value: string) => void;
  onSort?: (sortBy: string, sortOrder: "asc" | "desc") => void;
  copyableFields?: string[];
}
// Status Renderer
export const renderStatus = (status: unknown) => {
  const isActive = status === true || status === "active" || status === "Active" || status === 1;

  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium
        ${isActive
          ? "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500"
          : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500"
        }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

// Component
export default function CustomTable<T extends RowWithId>({
  title = "Custom Table",
  buttonName = "Add New",
  columns,
  paginatedData,
  onAdd,
  onEdit,
  onDelete,
  filter = false,
  sorting = false,
  enableSearch = false,
  loading = false,
  onPageChange,
  onRowsPerPageChange,
  onSearchChange,
  onSort,
  copyableFields = [],
}: TableProps<T>) {

  const searchParams = useSearchParams();
  // Extract data from API response
  const data = Array.isArray(paginatedData?.data) ? paginatedData.data : [];
  const paginationMeta = paginatedData?.meta?.pagination;

  const page = paginationMeta?.page || 1;
  const rowsPerPage = paginationMeta?.limit || 10;
  const totalPages = paginationMeta?.totalPages || 0;
  const totalElements = paginationMeta?.totalItems || 0;

  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [sortState, setSortState] = useState<{ key: string; order: "asc" | "desc" }>({
    key: "",
    order: "asc",
  });

  const hasActionsColumn = Boolean(onEdit || onDelete);
  const totalColumns = columns.length + (hasActionsColumn ? 1 : 0);

  const handleSearchInput = (value: string) => {
    setLocalSearchQuery(value);
    onSearchChange(value);
  };

  /** Toggle Sorting */
  const handleSortClick = useCallback(
    (key: string) => {
      if (!onSort) return;

      const nextOrder = sortState.key === key && sortState.order === "asc" ? "desc" : "asc";

      setSortState({ key, order: nextOrder });
      onSort(key, nextOrder);
    },
    [onSort, sortState]
  );

  /* Toggle Copy */
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);

    if (key === "email") {
      toast.success("Email Address Copied!");
    } else if (key === "password") {
      toast.success("Password Copied!");
    } else {
      toast.success("Copied!");
    }
  };

  const isCopyable = (key: string) => copyableFields.includes(key);
  const hasData = data?.length > 0;

  useEffect(() => {
    const search = searchParams.get("search") ?? "";
    setLocalSearchQuery(search);
  }, [searchParams]);

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/5 dark:bg-white/3">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title} Listing
        </h3>

        {/* Right Controls */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {enableSearch && (
            <div className="relative">
              <Button
                icon="Search"
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-400"
                variant="optional"
                size="md"
              />
              <Input
                name="Search"
                type="text"
                placeholder={`Search ${title}s...`}
                value={localSearchQuery}
                disabled={loading}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10.5 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white/90 dark:bg-dark-900 xl:w-75"
              />
            </div>
          )}

          {/* Filter Button */}
          {filter && (
            <Button
              icon="SlidersHorizontal"
              // onClick={onFilter}
              variant="optional"
              size="lg"
              className="group inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3"
            />
          )}

          {/* Add Button */}
          {onAdd && (
            <Button
              icon="BadgePlus"
              onClick={onAdd}
              variant="optional"
              size="lg"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3"
            />
          )}
        </div>
      </div>

      {/* Table */}
      <Table>
        {/* Table Header */}
        <TableHeader className="border-b border-t border-gray-100 text-center dark:border-white/5">
          <TableRow>
            {columns?.map((col) => (
              <TableCell
                key={String(col?.key)}
                isHeader
                className={`border-r border-gray-100 px-4 py-3 text-center text-theme-xs text-gray-500 dark:border-white/5 dark:text-gray-400 ${col?.className ?? ""
                  }`}
              >
                <div className="flex items-center justify-center">
                  <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                    {col?.label}
                  </p>

                  {sorting &&
                    onSort &&
                    col.key !== "email" &&
                    col.key !== "isActive" &&
                    col.key !== "emailVerifiedAt" &&
                    col.key !== "createdAt" &&
                    (
                      <Button
                        icon="ArrowDownUp"
                        onClick={() => handleSortClick(String(col?.key))}
                        variant="optional"
                        size="sm"
                        compact
                        className="ml-2 flex cursor-pointer flex-col gap-0.5"
                      />
                    )}
                </div>
              </TableCell>
            ))}

            {hasActionsColumn && (
              <TableCell
                isHeader
                className="border-l border-gray-100 px-4 py-3 text-center text-theme-xs text-gray-500 dark:border-white/5 dark:text-gray-400"
              >
                Actions
              </TableCell>
            )}
          </TableRow>
        </TableHeader>

        {loading ? (
          <TableBody>
            {Array.from({ length: rowsPerPage }).map((_, rowIdx) => (
              <TableRow key={rowIdx}>
                {Array.from({ length: totalColumns }).map((_, colIdx) => (
                  <TableCell
                    key={colIdx}
                    className="border border-gray-100 px-4 py-4 dark:border-white/5"
                  >
                    <Skeleton active title={false} paragraph={{ rows: 1, width: "100%" }} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        ) : (
          <TableBody className="divide-y divide-gray-100 text-center dark:divide-white/5">
            {hasData ? (
              data?.map((row: T, idx: number) => (
                <TableRow key={idx}>
                  {columns?.map((col: TableColumn<T>) => (
                    <TableCell
                      key={String(col.key)}
                      className={`whitespace-nowrap border-r border-gray-100 px-4 py-4 text-theme-sm font-medium text-gray-800 dark:border-white/5 dark:text-white ${col.className ?? ""}`}
                    >
                      {col.render ? (
                        col.render(
                          isDataKey(col.key) ? row[col.key] : undefined,
                          row,
                          idx
                        )
                      ) : isDataKey(col.key) ? (
                        isCopyable(col.key) ? (
                          <div className="flex items-center justify-center gap-2">
                            <span>{String(row[col.key])}</span>
                            <Button
                              icon="Copy"
                              onClick={() => handleCopy(String(row[col.key]), col.key)}
                              variant="default"
                              compact
                            />
                          </div>
                        ) : (
                          String(row[col.key])
                        )
                      ) : (
                        idx + 1
                      )}
                    </TableCell>
                  ))}

                  {/* Actions */}
                  {hasActionsColumn && (
                    <TableCell className="px-2 py-3 text-center font-medium">
                      <div className="flex items-center justify-center gap-3">
                        {onEdit && (
                          <Button
                            icon="Edit"
                            onClick={() => onEdit(String(row?.id))}
                            variant="default"
                            compact
                            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-2 py-1 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3"
                          />
                        )}

                        {onDelete && (
                          <Button
                            icon="Trash"
                            onClick={() => onDelete(String(row?.id))}
                            variant="default"
                            compact
                            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-2 py-1 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/3"
                          />
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  className="py-10 text-center dark:text-white"
                >
                  <div className="flex flex-col items-center justify-center">
                    <Empty title="No data available" />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        )}
      </Table>

      {/* Pagination */}
      {!loading && totalElements >= 10 && (
        <CustomPagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </div>
  );
}
