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
        className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
      />
    </div>
  );
};

export default SearchInput;
