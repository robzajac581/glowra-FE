import React, { useState } from "react";
import { Popover, PopoverHandler, PopoverContent } from "@material-tailwind/react";

/**
 * Sort Filter Component
 * Displays sorting options as a subtle text button dropdown
 */
const SortFilter = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating', label: 'Average Rating' },
    { value: 'reviewCount', label: 'Review Count' }
  ];

  const currentOption = sortOptions.find(opt => opt.value === value) || sortOptions[0];

  return (
    <Popover 
      open={isOpen} 
      handler={setIsOpen}
      placement="bottom-start"
      offset={5}
    >
      <PopoverHandler>
        <button
          type="button"
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>Sort: {currentOption.label}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>
      </PopoverHandler>
      
      <PopoverContent className="p-0 border border-border rounded-[10px] z-[9999] bg-white shadow-lg w-[200px]">
        <div className="py-2">
          {sortOptions.map((option) => (
            <div
              key={option.value}
              className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                option.value === value
                  ? 'bg-gray-50 font-medium text-black'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SortFilter;

