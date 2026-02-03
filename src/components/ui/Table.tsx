"use client";

import React, {
  ReactNode,
  useCallback,
  useState,
} from "react";
import { Skeleton } from "antd";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

import { PaginatedResponse } from "@/types/api";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import Empty from "@/utils/Empty";
import Input from "@/components/ui/Input";

/* =====================================================
   TABLE PRIMITIVES
===================================================== */

interface WrapperProps {
  children: ReactNode;
  className?: string;
}

type BaseCellProps = {
  children: ReactNode;
  isHeader?: boolean;
  className?: string;
  colSpan?: number;
} & React.HTMLAttributes<HTMLTableCellElement>;

export const Table: React.FC<WrapperProps> = ({
  children,
  className,
}) => {
  return (
    <div className="w-full overflow-x-auto overflow-y-auto -scrollbar">
      <table className={`min-w-max w-full ${className ?? ""}`}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<WrapperProps> = ({
  children,
  className,
}) => <thead className={className}>{children}</thead>;

export const TableBody: React.FC<WrapperProps> = ({
  children,
  className,
}) => <tbody className={className}>{children}</tbody>;

export const TableRow: React.FC<WrapperProps> = ({
  children,
  className,
}) => <tr className={className}>{children}</tr>;

export const TableCell: React.FC<BaseCellProps> = ({
  children,
  isHeader = false,
  className,
  colSpan,
  ...rest
}) => {
  if (isHeader) {
    return (
      <th
        className={className}
        colSpan={colSpan}
        {...(rest as React.ThHTMLAttributes<HTMLTableCellElement>)}
      >
        {children}
      </th>
    );
  }

  return (
    <td
      className={className}
      colSpan={colSpan}
      {...(rest as React.TdHTMLAttributes<HTMLTableCellElement>)}
    >
      {children}
    </td>
  );
};

/* =====================================================
   TYPES
===================================================== */

interface RowWithId {
  id: string | number;
}

export type ColumnKey<T> = keyof T | "__srNo";

export interface TableColumn<T extends RowWithId> {
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

/* =====================================================
   HELPERS
===================================================== */

function isDataKey<T extends object>(
  key: ColumnKey<T>
): key is keyof T {
  return key !== "__srNo";
}

export const renderStatus = (status: unknown) => {
  const isActive =
    status === true ||
    status === "active" ||
    status === "Active" ||
    status === 1;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium
        ${isActive
          ? "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-500"
          : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-500"
        }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

/* =====================================================
   MAIN COMPONENT
===================================================== */

export default function SmartTable<T extends RowWithId>({
  title = " Table",
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

  const data = Array.isArray(paginatedData?.data)
    ? paginatedData.data
    : [];

  const pagination = paginatedData?.meta?.pagination;

  const page = pagination?.page ?? 1;
  const rowsPerPage = pagination?.limit ?? 10;
  const totalPages = pagination?.totalPages ?? 0;
  const totalElements = pagination?.total ?? 0;

  const [localSearchQuery, setLocalSearchQuery] = useState(
    searchParams.get("search") ?? ""
  );
  const [prevSearchParam, setPrevSearchParam] = useState(
    searchParams.get("search") ?? ""
  );

  if (prevSearchParam !== (searchParams.get("search") ?? "")) {
    const search = searchParams.get("search") ?? "";
    setPrevSearchParam(search);
    setLocalSearchQuery(search);
  }

  const [sortState, setSortState] = useState<{
    key: string;
    order: "asc" | "desc";
  }>({ key: "", order: "asc" });

  const hasActionsColumn = Boolean(onEdit || onDelete);
  const totalColumns =
    columns.length + (hasActionsColumn ? 1 : 0);

  /* Search */
  const handleSearchInput = (value: string) => {
    setLocalSearchQuery(value);
    onSearchChange(value);
  };

  /* Sorting */
  const handleSortClick = useCallback(
    (key: string) => {
      if (!onSort) return;

      const nextOrder =
        sortState.key === key && sortState.order === "asc"
          ? "desc"
          : "asc";

      setSortState({ key, order: nextOrder });
      onSort(key, nextOrder);
    },
    [onSort, sortState]
  );

  /* Copy */
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);

    toast.success(
      key === "email"
        ? "Email Address Copied!"
        : key === "password"
          ? "Password Copied!"
          : "Copied!"
    );
  };

  const isCopyable = (key: string) =>
    copyableFields.includes(key);



  const hasData = data.length > 0;

  return (
    <div className="relative rounded-2xl border border-gray-200 bg-white pt-4 dark:border-white/5 dark:bg-white/3">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title} Listing
        </h3>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {enableSearch && (
            <div className="relative">
              <Button
                icon="Search"
                variant="optional"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder={`Search ${title}s...`}
                value={localSearchQuery}
                disabled={loading}
                onChange={(e) =>
                  handleSearchInput(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 py-2 pl-10.5 pr-4 text-sm"
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

          {onAdd && (
            <Button
              icon="BadgePlus"
              onClick={onAdd}
              variant="optional"
              text={buttonName}
            />
          )}
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader className="border-y border-gray-100 text-center dark:border-white/5">
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={String(col.key)}
                isHeader
                className={`px-4 py-3 text-xs text-gray-500 ${col.className ?? ""}`}
              >
                <div className="flex items-center justify-center gap-2">
                  {col.label}
                  {sorting && onSort && (
                    <Button
                      icon="ArrowDownUp"
                      size="sm"
                      compact
                      variant="optional"
                      onClick={() =>
                        handleSortClick(String(col.key))
                      }
                    />
                  )}
                </div>
              </TableCell>
            ))}

            {hasActionsColumn && (
              <TableCell isHeader>Actions</TableCell>
            )}
          </TableRow>
        </TableHeader>

        {/* Body */}
        <TableBody>
          {loading ? (
            Array.from({ length: rowsPerPage }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: totalColumns }).map(
                  (_, j) => (
                    <TableCell key={j} className="p-4">
                      <Skeleton
                        active
                        title={false}
                        paragraph={{ rows: 1 }}
                      />
                    </TableCell>
                  )
                )}
              </TableRow>
            ))
          ) : hasData ? (
            data.map((row, idx) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>
                    {col.render
                      ? col.render(
                        isDataKey(col.key)
                          ? row[col.key]
                          : undefined,
                        row,
                        idx
                      )
                      : isDataKey(col.key)
                        ? isCopyable(String(col.key))
                          ? (
                            <div className="flex items-center gap-2 justify-center">
                              <span>{String(row[col.key])}</span>
                              <Button
                                icon="Copy"
                                compact
                                onClick={() =>
                                  handleCopy(
                                    String(row[col.key as keyof T]),
                                    String(col.key)
                                  )
                                }
                              />
                            </div>
                          )
                          : String(row[col.key as keyof T])
                        : idx + 1}
                  </TableCell>
                ))}

                {hasActionsColumn && (
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      {onEdit && (
                        <Button
                          icon="Edit"
                          compact
                          onClick={() =>
                            onEdit(String(row.id))
                          }
                        />
                      )}
                      {onDelete && (
                        <Button
                          icon="Trash"
                          compact
                          onClick={() =>
                            onDelete(String(row.id))
                          }
                        />
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={totalColumns}>
                <Empty title="No data available" />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!loading && totalElements >= 10 && (
        <Pagination
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
