import React, { useState, useEffect } from 'react';
import { Popover, PopoverHandler, PopoverContent } from "@material-tailwind/react";

/**
 * CombinedPriceFilter Component
 * 
 * A combined price filter that allows users to set both minimum and maximum price
 * values within a single dropdown interface.
 * 
 * @param {Object} props
 * @param {string} props.minValue - Current minimum price value
 * @param {string} props.maxValue - Current maximum price value
 * @param {function} props.onMinChange - Function to call when min value changes
 * @param {function} props.onMaxChange - Function to call when max value changes
 * @param {function} props.onApply - Function to call when Apply button is clicked
 */
const CombinedPriceFilter = ({ 
  minValue = "", 
  maxValue = "", 
  onMinChange, 
  onMaxChange,
  onApply
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempMinValue, setTempMinValue] = useState(minValue);
  const [tempMaxValue, setTempMaxValue] = useState(maxValue);

  // Predefined options for min and max
  const minOptions = [
    { value: "", label: "Any Price" },
    { value: "0", label: "$0" },
    { value: "2500", label: "$2,500" },
    { value: "5000", label: "$5,000" },
    { value: "7500", label: "$7,500" },
    { value: "10000", label: "$10,000" },
    { value: "12500", label: "$12,500" },
    { value: "15000", label: "$15,000" },
    { value: "17500", label: "$17,500" },
    { value: "20000", label: "$20,000" }
  ];

  const maxOptions = [
    { value: "", label: "No Max" },
    { value: "5000", label: "$5,000" },
    { value: "7500", label: "$7,500" },
    { value: "10000", label: "$10,000" },
    { value: "12500", label: "$12,500" },
    { value: "15000", label: "$15,000" },
    { value: "20000", label: "$20,000" },
    { value: "30000", label: "$30,000" },
    { value: "50000", label: "$50,000" }
  ];
  
  // Update temp values when props change
  useEffect(() => {
    setTempMinValue(minValue);
    setTempMaxValue(maxValue);
  }, [minValue, maxValue]);

  // Handle apply button click
  const handleApply = () => {
    onMinChange(tempMinValue);
    onMaxChange(tempMaxValue);
    if (onApply) {
      onApply(tempMinValue, tempMaxValue);
    }
    setIsOpen(false);
  };

  // Format price value for display
  const formatPrice = (value) => {
    if (!value) return "";
    const num = parseInt(value);
    return num.toLocaleString();
  };

  // Get display text for the main button
  const getDisplayText = () => {
    const hasMin = minValue && minValue !== "";
    const hasMax = maxValue && maxValue !== "";
    
    if (hasMin && hasMax) {
      return `$${formatPrice(minValue)} - $${formatPrice(maxValue)}`;
    } else if (hasMin) {
      return `From $${formatPrice(minValue)}`;
    } else if (hasMax) {
      return `Up to $${formatPrice(maxValue)}`;
    }
    return "Any";
  };

  return (
    <div className="w-full relative">
      <Popover 
        open={isOpen} 
        handler={() => setIsOpen(!isOpen)}
        placement="bottom-start"
        offset={5}
      >
        <PopoverHandler>
          <div className="relative w-full h-[63px] border border-border rounded-[10px] bg-white cursor-pointer hover:bg-opacity-5 transition-colors">
            <label className="absolute text-xs text-black text-opacity-50 top-[6px] left-4">
              Price
            </label>
            <div className="h-full w-full pt-4 px-4 flex items-center justify-between">
              <span className="text-sm font-extrabold text-black">
                {getDisplayText()}
              </span>
              <div className="pointer-events-none text-black">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </div>
          </div>
        </PopoverHandler>
        
        <PopoverContent className="p-0 w-[400px] border border-border rounded-[10px] z-[9999] bg-white shadow-lg">
          <div className="p-6">
            <h3 className="font-Louize text-2xl mb-4 text-dark">Price Range</h3>
            
            <div className="flex gap-4 mb-6">
              {/* Minimum Price Section */}
              <div className="flex-1">
                <label className="block text-xs text-black text-opacity-50 mb-2 uppercase">
                  Minimum
                </label>
                <div className="relative">
                  <div className="relative">
                    <select
                      className="w-full h-[52px] px-4 pr-8 border border-border rounded-[10px] bg-white text-sm font-extrabold text-black focus:outline-none focus:border-primary appearance-none"
                      value={tempMinValue}
                      onChange={(e) => setTempMinValue(e.target.value)}
                    >
                      {minOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
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
                </div>
              </div>

              {/* Maximum Price Section */}
              <div className="flex-1">
                <label className="block text-xs text-black text-opacity-50 mb-2 uppercase">
                  Maximum
                </label>
                <div className="relative">
                  <div className="relative">
                    <select
                      className="w-full h-[52px] px-4 pr-8 border border-border rounded-[10px] bg-white text-sm font-extrabold text-black focus:outline-none focus:border-primary appearance-none"
                      value={tempMaxValue}
                      onChange={(e) => setTempMaxValue(e.target.value)}
                    >
                      {maxOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
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
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApply}
              className="w-full h-[52px] bg-dark hover:bg-opacity-90 text-white font-extrabold rounded-[10px] transition-colors focus:outline-none"
            >
              Apply
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CombinedPriceFilter;
