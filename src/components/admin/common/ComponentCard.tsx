import Button from "@/components/ui/Button";
import React from "react";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  onSubmit?: () => void; // Optional submit handler
  onCancel?: () => void; // Optional cancel handler
  submitLabel?: string; // Optional submit button label
  cancelLabel?: string; // Optional cancel button label
  showFooter?: boolean; // Show footer with buttons
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  onSubmit,
  onCancel,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  showFooter = false,
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3 ${className}`}
    >
      {/* Card Header */}
      <div className="px-6 py-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        {desc && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {desc}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 border-t border-b border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>

      {/* Card Footer */}
      {showFooter && (
        <div className="flex justify-end gap-3 px-6 py-5">
          {onCancel && (
            <Button
              size="sm"
              text={cancelLabel}
              variant="outline"
              onClick={onCancel}
            />
          )}
          {onSubmit && (
            <Button
              size="sm"
              text={submitLabel}
              onClick={onSubmit}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ComponentCard;
