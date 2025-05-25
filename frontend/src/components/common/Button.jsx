import React from "react";

const Button = ({ children, onClick, type = "button", variant = "primary", disabled = false, width="full", className, size="md" }) => {
  const baseStyles = ` rounded-lg font-medium transition-all duration-300 ${width=="auto"? '':'w-full' }  `;
  const variants = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-600 text-white hover:bg-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-600 text-gray-600 hover:bg-gray-100",
  };
  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-4 py-2 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={` ${sizes[size]} ${baseStyles} ${variants[variant]} ${disabled ? "opacity-20 cursor-not-allowed" : "cursor-pointer"} ${className || ""} `}
    >
      {children}
    </button>
  );
};

export default Button;
