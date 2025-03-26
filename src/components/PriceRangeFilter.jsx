import React, { useState, useRef, useEffect } from 'react';
import { Popover, PopoverHandler, PopoverContent } from "@material-tailwind/react";

/**
 * PriceRangeFilter Component
 * 
 * A dual-purpose price filter that allows users to either:
 * 1. Select from predefined price options in a dropdown
 * 2. Enter custom price values directly in the input
 * 
 * @param {Object} props
 * @param {string} props.label - Label text for the filter
 * @param {string} props.value - Current value of the filter
 * @param {function} props.onChange - Function to call when value changes
 * @param {Array} props.options - Predefined price options for dropdown
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} props.type - Type of filter ("min" or "max")
 */
const PriceRangeFilter = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  placeholder = "",
  type = "min" // "min" or "max"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const inputRef = useRef(null);
  
  // Update internal state when prop value changes
  useEffect(() => {
    if (value === "") {
      setInputValue("");
    } else if (value && !isNaN(value)) {
      // Format as currency with no decimal places when value exists
      setInputValue(value);
    }
  }, [value]);

  // Handle direct input change
  const handleInputChange = (e) => {
    const val = e.target.value;
    
    // Only allow numbers and empty string
    if (val === "" || /^\d*$/.test(val)) {
      setInputValue(val);
      
      // Don't trigger onChange for empty values until blur
      if (val !== "") {
        onChange(val);
      }
    }
  };

  // Handle input blur - finalize empty values
  const handleBlur = () => {
    if (inputValue === "") {
      onChange("");
    }
  };

  // Handle selection from dropdown
  const handleOptionSelect = (optionValue) => {
    setInputValue(optionValue);
    onChange(optionValue);
    setIsOpen(false);
    
    // Focus back on input after selection
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Format for display in the input
  const formatForDisplay = (val) => {
    if (!val) return "";
    return type === "max" && val === "No Max" ? val : val;
  };

  return (
    <div className="w-full relative">
      <label className="text-xs text-black text-opacity-50 absolute top-[6px] left-4 z-10">
        {label}
      </label>
      
      <Popover 
        open={isOpen} 
        handler={() => setIsOpen(!isOpen)}
        placement="bottom"
        offset={5}
      >
        <PopoverHandler>
          <div className="relative w-full h-[52px] border border-gray-200 rounded-md bg-white cursor-pointer">
            <input
              ref={inputRef}
              type="text"
              className="h-full w-full pt-4 px-4 text-sm font-extrabold text-black rounded-md outline-none cursor-pointer"
              placeholder={placeholder}
              value={formatForDisplay(inputValue)}
              onChange={handleInputChange}
              onBlur={handleBlur}
              onClick={() => setIsOpen(true)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </div>
          </div>
        </PopoverHandler>
        
        <PopoverContent className="p-0 max-h-48 overflow-y-auto border border-gray-200 rounded-md">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.value}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium"
                onClick={() => handleOptionSelect(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default PriceRangeFilter;