import React, { useState, useRef, useEffect } from 'react';

const PriceRangeSelector = ({ onPriceChange }) => {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showMinMenu, setShowMinMenu] = useState(false);
  const [showMaxMenu, setShowMaxMenu] = useState(false);
  const minMenuRef = useRef(null);
  const maxMenuRef = useRef(null);

  // Generate price options from $0 to $10000 in $1000 increments
  const priceOptions = Array.from({ length: 11 }, (_, i) => i * 1000);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (minMenuRef.current && !minMenuRef.current.contains(event.target)) {
        setShowMinMenu(false);
      }
      if (maxMenuRef.current && !maxMenuRef.current.contains(event.target)) {
        setShowMaxMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePriceChange = (value, isMin) => {
    if (isMin) {
      setMinPrice(value);
      setShowMinMenu(false);
    } else {
      setMaxPrice(value);
      setShowMaxMenu(false);
    }
    onPriceChange({
      minPrice: isMin ? value : minPrice,
      maxPrice: isMin ? maxPrice : value
    });
  };

  const formatPrice = (price) => {
    if (price === '') return '';
    if (price === 0) return '$0';
    return `$${parseInt(price).toLocaleString()}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">Price Range</label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1" ref={minMenuRef}>
          <button 
            className="w-full h-[52px] px-3 border rounded-md bg-white flex items-center justify-between"
            onClick={() => setShowMinMenu(!showMinMenu)}
          >
            <span className="text-gray-700">
              {minPrice === '' ? 'No Min' : formatPrice(minPrice)}
            </span>
            <span className="text-gray-400">
              {showMinMenu ? '▲' : '▼'}
            </span>
          </button>
          {showMinMenu && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
              <div 
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handlePriceChange('', true)}
              >
                No Min
              </div>
              {priceOptions.map((price) => (
                <div
                  key={price}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handlePriceChange(price, true)}
                >
                  {formatPrice(price)}
                </div>
              ))}
            </div>
          )}
        </div>

        <span className="text-gray-500">to</span>

        <div className="relative flex-1" ref={maxMenuRef}>
          <button 
            className="w-full h-[52px] px-3 border rounded-md bg-white flex items-center justify-between"
            onClick={() => setShowMaxMenu(!showMaxMenu)}
          >
            <span className="text-gray-700">
              {maxPrice === '' ? 'No Max' : formatPrice(maxPrice)}
            </span>
            <span className="text-gray-400">
              {showMaxMenu ? '▲' : '▼'}
            </span>
          </button>
          {showMaxMenu && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
              <div 
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handlePriceChange('', false)}
              >
                No Max
              </div>
              {priceOptions.map((price) => (
                <div
                  key={price}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handlePriceChange(price, false)}
                >
                  {formatPrice(price)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSelector;