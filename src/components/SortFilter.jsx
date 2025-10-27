import React from "react";
import { Radio } from "@material-tailwind/react";

/**
 * Sort Filter Component
 * Displays sorting options using radio buttons
 */
const SortFilter = ({ value, onChange }) => {
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'rating', label: 'Average Rating' },
    { value: 'reviewCount', label: 'Review Count' }
  ];

  return (
    <div className="mb-8">
      <h5 className="font-bold mb-2 font-Avenir">
        Sort By
      </h5>
      <div className="flex flex-col gap-3">
        {sortOptions.map((option) => (
          <Radio
            key={option.value}
            name="sort"
            label={
              <div
                className={`font-medium ${
                  option.value === value
                    ? "text-black"
                    : "text-text2"
                }`}
              >
                {option.label}
              </div>
            }
            containerProps={{
              className: "p-0 items-center radio",
            }}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
};

export default SortFilter;

