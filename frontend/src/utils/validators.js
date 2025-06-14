// utils/validators.js

// Required field
export const validateRequired = (value, label) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${label} is required.`;
  }
  return null;
};

// Min Length
export const validateMinLength = (value, min, label) => {
  if (value.length < min) {
    return `${label} must be at least ${min} characters.`;
  }
  return null;
};

// Valid phone number (Indian)
export const validatePhone = (value, label = 'Phone number') => {
  const pattern = /^[6-9]\d{9}$/;
  return pattern.test(value) ? null : `Enter a valid ${label}.`;
};

// Valid order reference (e.g., ORD/2025/06/0233)
export const validateOrderRef = (value) => {
  const pattern = /^ORD\/\d{4}\/\d{2}\/\d{4}$/;
  return pattern.test(value) ? null : 'Invalid Order Reference Number format.';
};

// Number range
export const validateNumberRange = (value, min, max, label) => {
  if (value < min || value > max) {
    return `${label} must be between ${min} and ${max}.`;
  }
  return null;
};

// Valid date
export const validateDate = (value, label = 'Date') => {
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(value);
  return isValid ? null : `${label} is not a valid date format (YYYY-MM-DD).`;
};

// Dropdown selected
export const validateDropdown = (value, label) => {
  return value ? null : `Please select a ${label}.`;
};
