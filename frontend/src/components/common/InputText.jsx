import React from 'react'

const InputText = ({type='text', value, name, label,autoComplete, placeholder, handleOnChange, disabled=false, className}) => {
  return (
   <div className={`flex flex-col gap-1 w-full ${className}`}>
   {label && (<label>{label}</label>)}
      <input type={type} value={value} autoComplete={autoComplete}  name={name} onChange={handleOnChange} placeholder={placeholder} disabled={disabled}  className='border rounded-md border-gray-400 px-3 py-2 focus:border-blue-300 focus:outline-0'  />
   </div>
  )
}

export default InputText