import React from 'react';

const SelectDropdown = ({
  label,
  value,
  onChange,
  options = [],
  optionLabel = 'label',
  optionValue = 'value',
  placeholder = 'Select an option',
  required = false,
  className = '',
  name,
  hasError,
  disabled = false,
}) => {
  const getLabel = (opt) =>
    typeof optionLabel === 'function' ? optionLabel(opt) : opt[optionLabel];

  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="">{label}</label>
      <select
        value={value}
        name={name}
        onChange={onChange}
        className={` capitalize border rounded-md   px-3 py-2  focus:border-blue-300 focus:outline-0 ${hasError ? 'ring-red-100 outline-red-300 ring-3 border-red-300':''}  ${disabled ? 'bg-gray-100 text-gray-300 border-gray-200 ':'bg-white border-gray-400'} ${className} `}
        required={required}
        disabled= {disabled}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt[optionValue]} value={opt[optionValue]}>
            {getLabel(opt)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectDropdown;
