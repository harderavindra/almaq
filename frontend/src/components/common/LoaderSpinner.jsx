import React from 'react';

const LoaderSpinner = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-t-transparent border-gray-500 ${sizes[size]}`} />
    </div>
  );
};

export default LoaderSpinner;
