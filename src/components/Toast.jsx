import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Toast = ({ message, isVisible, onClose, duration = 5000, onClick }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Trigger animation after a brief delay to ensure DOM is ready
      setTimeout(() => setIsAnimating(true), 10);
      
      // Auto-close after duration
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setShouldRender(false);
          onClose();
        }, 300); // Wait for fade-out animation
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!shouldRender) return null;

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // Close toast after clicking
    setIsAnimating(false);
    setTimeout(() => {
      setShouldRender(false);
      onClose();
    }, 300);
  };

  return createPortal(
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${onClick ? "cursor-pointer" : ""}`}
      style={{ maxWidth: "calc(100vw - 2rem)" }}
      onClick={onClick ? handleClick : undefined}
    >
      <div className="bg-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 border border-gray-200">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-gray-800 font-medium flex-1">{message}</p>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the parent onClick
            setIsAnimating(false);
            setTimeout(() => {
              setShouldRender(false);
              onClose();
            }, 300);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Toast;

