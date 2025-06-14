// components/PlantItemForm.jsx
import React from 'react';
import InputText from '../common/InputText';
import SelectDropdown from '../common/SelectDropdown';
import IconButton from '../common/IconButton';
import { FiPlus, FiCheck } from 'react-icons/fi';
import SearchableFarmerSelect from '../common/SearchableFarmerSelect'; // Adjust if path differs

const PlantItemForm = ({
  form,
  errors,
  onChange,
  onSubmit,
  plants,
  addNewFarmer,
  setAddNewFarmer,
  selectedDistrict,
  selectedTaluka,
}) => {
  return (
    <div className="flex gap-4 items-end mb-4 p-4">
      {/* Farmer Select */}
      <div className='flex items-end gap-2 min-w-xs'>
        <SearchableFarmerSelect
          value={form.farmerId}
          onChange={(val) => onChange('farmerId', val)}
          district={selectedDistrict}
          taluka={selectedTaluka}
          disabled={addNewFarmer}
          hasError={!!errors.farmerId}
        />
        <IconButton
          disabled={addNewFarmer}
          onClick={() => setAddNewFarmer(true)}
          icon={<FiPlus size={24} />}
          label=""
          className="w-14"
        />
      </div>

      {/* Plant Type */}
      <div className="w-sm">
        <SelectDropdown
          label="Plant Type"
          optionLabel="name"
          optionValue="_id"
          key="_id"
          value={form.plantTypeId}
          options={plants}
          onChange={(e) => onChange('plantTypeId', e.target.value)}
          hasError={!!errors.plantTypeId}
        />
      </div>

      {/* Price */}
      <div className="w-30">
        <InputText
          label="Price"
          type="number"
          value={form.pricePerUnit}
          handleOnChange={(e) => onChange('pricePerUnit', e.target.value)}
          disabled
          required
          readOnly
        />
      </div>

      {/* Quantity */}
      <div className="w-30">
        <InputText
          label="Quantity *"
          type="number"
          value={form.quantity}
          handleOnChange={(e) => onChange('quantity', e.target.value)}
          min={1}
          step={1}
          hasError={!!errors.quantity}
        />
      </div>

      {/* Submit */}
      <IconButton
        onClick={onSubmit}
        label=""
        size="md"
        shape="pill"
        icon={<FiCheck />}
      />
    </div>
  );
};

export default PlantItemForm;
