import React from 'react';

const sizeClasses = {
  sm: 'px-2 py-2 text-xs h-6 min-w-6',
  md: 'px-4 py-4 text-sm h-10 min-w-10 ',
  lg: 'px-4 py-2 text-base',
  xl: 'px-5 py-2.5 text-lg',
};
const variantClasses = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  outline: 'border border-gray-600 text-gray-600 hover:bg-gray-100',
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
  variant = 'primary',
  className = '',
}) => {
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const shapeClass = shapeClasses[shape] || shapeClasses.rounded;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2  transition cursor-pointer
                  ${sizeClass} ${shapeClass} ${variantClasses[variant]} ${className}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default IconButton;
