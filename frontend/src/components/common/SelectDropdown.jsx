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
  className = 'input',
  name,
}) => {
  const getLabel = (opt) =>
    typeof optionLabel === 'function' ? optionLabel(opt) : opt[optionLabel];

  return (
    <div className="mb-2">
      <label className="block mb-1">{label}</label>
      <select
        value={value}
        name={name}
        onChange={onChange}
        className={`${className} border rounded-md border-gray-400 px-3 py-2 focus:border-blue-300 focus:outline-0 w-full`}
        required={required}
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
