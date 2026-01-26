import React from "react";

interface PositionedModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  position: { x: number; y: number };
}

export const PositionedModal: React.FC<PositionedModalProps> = ({ 
  isOpen, 
  onClose, 
  className, 
  children, 
  position 
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(position);

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      const modal = modalRef.current;
      const modalRect = modal.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let adjustedX = position.x;
      let adjustedY = position.y - 20; // Default offset

      // Check if modal goes off the right edge
      if (position.x + modalRect.width > viewportWidth) {
        adjustedX = viewportWidth - modalRect.width - 20; // 20px padding from edge
      }

      // Check if modal goes off the left edge
      if (adjustedX < 20) {
        adjustedX = 20; // 20px padding from edge
      }

      // Check if modal goes off the bottom edge
      if (position.y + modalRect.height > viewportHeight) {
        adjustedY = viewportHeight - modalRect.height - 20; // 20px padding from bottom
      }

      // Check if modal goes off the top edge
      if (adjustedY < 20) {
        adjustedY = 20; // 20px padding from top
      }

      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    }
  }, [isOpen, position]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999">
      <div
        className="fixed inset-0"
        onClick={onClose}
      ></div>
      <div
        ref={modalRef}
        className={`fixed rounded-3xl bg-white dark:bg-gray-900 shadow-xl ${className}`}
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};