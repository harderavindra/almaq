// components/FarmerForm.jsx
import React from 'react';
import InputText from '../common/InputText';
import SelectDropdown from '../common/SelectDropdown';
import LocationDropdowns from '../common/LocationDropdowns';
import IconButton from '../common/IconButton';
import { FiX } from 'react-icons/fi';

const genderOptions = ['Male', 'Female', 'Other'].map(g => ({ label: g, value: g.toLowerCase() }));

const FarmerForm = ({
  newFarmer,
  errors,
  onChange,
  onClose,
  selectedDistrict,
  selectedTaluka
}) => {
  const handleFieldChange = (field) => (e) => {
    onChange(field, e.target.value);
  };

  return (
    <div className='flex flex-col gap-4 p-5 bg-gray-100 rounded-lg'>
      <div className='flex justify-between items-center'>
        <h2 className='font-bold text-xl'>Add Farmer and Add to Order</h2>
        <IconButton onClick={onClose} icon={<FiX />} variant='outline' shape='pill' className='bg-white' />
      </div>

      <div className='flex gap-4'>
        <SelectDropdown
          name="gender"
          label="Gender"
          options={genderOptions}
          value={newFarmer.gender}
          onChange={handleFieldChange('gender')}
          hasError={!!errors.gender}
          placeholder="Select Gender"
          className='w-full'
        />
        <InputText
          label="First Name"
          type="text"
          value={newFarmer.firstName || ''}
          handleOnChange={handleFieldChange('firstName')}
          hasError={!!errors.firstName}
        />
        <InputText
          label="Last Name"
          type="text"
          value={newFarmer.lastName || ''}
          handleOnChange={handleFieldChange('lastName')}
          hasError={!!errors.lastName}
        />
      </div>

      <div className='flex gap-4'>
        <InputText
          label="Contact Number"
          type="number"
          value={newFarmer.contactNumber || ''}
          handleOnChange={handleFieldChange('contactNumber')}
          hasError={!!errors.contactNumber}
        />
        <InputText
          label="Address Line"
          type="text"
          value={newFarmer.address || ''}
          handleOnChange={handleFieldChange('address')}
          hasError={!!errors.address}
        />
        <InputText
          label="Identification Number"
          type="text"
          value={newFarmer.idNumber || ''}
          handleOnChange={handleFieldChange('idNumber')}
          hasError={!!errors.idNumber}
        />
      </div>

      <LocationDropdowns
        onChange={(locationData) => {
          Object.keys(locationData).forEach(field => {
            onChange(field, locationData[field]);
          });
        }}
        defaultDistrict={selectedDistrict}
        defaultTaluka={selectedTaluka}
        errors={{
          state: errors.state,
          district: errors.district,
          taluka: errors.taluka,
          city: errors.city,
        }}
        className='flex-row gap-4'
      />
    </div>
  );
};

export default FarmerForm;
