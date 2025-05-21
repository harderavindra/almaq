import React from 'react';

const sizeClasses = {
  sm: 'px-2 py-2 text-xs h-6 min-w-6',
  md: 'px-4 py-4 text-sm h-10 min-w-10 ',
  lg: 'px-4 py-2 text-base',
  xl: 'px-5 py-2.5 text-lg',
};

const shapeClasses = {
  rounded: 'rounded-md',
  pill: 'rounded-full',
  square: 'rounded-none',
};

const IconButton = ({
  label = 'Add Items',
  onClick,
  icon,
  size = 'md',
  shape = 'rounded',
}) => {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const shapeClass = shapeClasses[shape] || shapeClasses.rounded;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 border border-gray-300 text-gray-700
                  hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500
                  focus:outline-none focus:ring-2 focus:ring-blue-200 transition cursor-pointer
                  ${sizeClass} ${shapeClass}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default IconButton;
