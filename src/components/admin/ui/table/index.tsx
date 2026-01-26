import React, { ReactNode } from "react";

// Common interface for all table wrappers
interface WrapperProps {
  children: ReactNode;
  className?: string;
}

type BaseCellProps = {
  children: ReactNode;
  isHeader?: boolean;
  className?: string;
  colSpan?: number;
} & React.HTMLAttributes<HTMLTableCellElement>; // supports colSpan, rowSpan, onClick, style, etc.

// ✔ Table Component
// export const Table: React.FC<WrapperProps> = ({ children, className }) => {
//   return <table className={`min-w-full ${className || ""}`}>{children}</table>;
// };

export const Table: React.FC<WrapperProps> = ({ children, className }) => {
  return (
    //  max-h-[calc(100vh-200px)])
    <div className="w-full overflow-x-auto overflow-y-auto custom-scrollbar">
      <table className={`min-w-max w-full ${className || ""}`}>
        {children}
      </table>
    </div>
  );
};

// TableHeader Component
export const TableHeader: React.FC<WrapperProps> = ({ children, className }) => {
  return <thead className={className}>{children}</thead>;
};

// TableBody Component
export const TableBody: React.FC<WrapperProps> = ({ children, className }) => {
  return <tbody className={className}>{children}</tbody>;
};

// TableRow Component
export const TableRow: React.FC<WrapperProps> = ({ children, className }) => {
  return <tr className={className}>{children}</tr>;
};

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
