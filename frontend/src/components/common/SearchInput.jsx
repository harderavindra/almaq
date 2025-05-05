import React, { useEffect, useState } from 'react';
// import { Search } from 'lucide-react';

const SearchInput = ({
  value = '',
  onDebouncedChange,
  placeholder = 'Search...',
  className = '',
  delay = 500
}) => {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      onDebouncedChange(internalValue);
    }, delay);

    return () => {
      clearTimeout(handler); // clear on new keystroke
    };
  }, [internalValue, delay, onDebouncedChange]);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  return (
    <div className={`relative w-full max-w-sm ${className}`}>
      {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /> */}
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 bg-gray-100  border-0  rounded-md focus:outline-blue-100/50 focus:bg-blue-50/50 focus:ring-4 focus:ring-blue-300/30"
      />
    </div>
  );
};

export default SearchInput;
