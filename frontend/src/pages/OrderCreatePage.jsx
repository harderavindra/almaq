import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import InputText from '../components/common/InputText';
import Button from '../components/common/Button';
import OrderSidebar from '../components/layout/OrderSidebar';
import { FiPlus, FiTrash } from 'react-icons/fi';
import IconButton from '../components/common/IconButton';
import SelectDropdown from '../components/common/SelectDropdown';
import AddFarmer from '../components/order/AddFarmer';
import SearchableFarmerSelect from '../components/common/SearchableFarmerSelect';
import { useNavigate } from 'react-router-dom';
import StatusMessageWrapper from '../components/common/StatusMessageWrapper';

const OrderCreatePage = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  const [form, setForm] = useState({
    departmentId: '',
    orderDate: '',
    orderRefNo: '',
    orderLetterNumber: '',
    contactPerson: '',
    contactNumber: '',
    items: [
      {
        farmerId: '',
        plantTypeId: '',
        quantity: '',
        pricePerUnit: '',
      },
    ],
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [deptRes, farmerRes, plantRes, orderNumberRes] = await Promise.all([
          api.get('/departments'),
          api.get('/farmers'),
          api.get('/plants'),
          api.get('/utility/generate-number?type=ORD')
        ]);
        
        setDepartments(deptRes.data.data);
        setFarmers(farmerRes.data);
        setPlants(plantRes.data.data);
        setForm(prev => ({ ...prev, orderRefNo: orderNumberRes.data.number }));
        setMessage({ type: 'success', text: 'Data loaded successfully' });
      } catch (error) {
        console.error('Error loading initial data:', error);
        setMessage({ type: 'error', text: 'Failed to load dropdown data' });
      }finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFarmerAdded = (newFarmer) => {
    setFarmers((prev) => [...prev, newFarmer]);
    handleItemChange(currentItemIndex, 'farmerId', newFarmer._id);
    setShowAddFarmer(false);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    let newItem = { ...newItems[index], [field]: value };

    // If field is plantTypeId, auto-fill rate
    if (field === 'plantTypeId') {
      const selectedPlant = plants.find((p) => p._id === value);
      newItem.pricePerUnit = selectedPlant?.ratePerUnit || '';
    }

    // Check for duplicates
    const isDuplicate = form.items.some((item, i) => {
      if (i === index) return false; // skip self
      return item.farmerId === (field === 'farmerId' ? value : newItem.farmerId) &&
        item.plantTypeId === (field === 'plantTypeId' ? value : newItem.plantTypeId);
    });

    if (isDuplicate) {
      setMessage({ type: 'error', text: 'This farmer and plant combination is already added.' });
      return;
    }

    newItems[index] = newItem;
    setForm({ ...form, items: newItems });
  };

  const handleAddItem = () => {
    if (form.items.length >= 10) {
      setMessage({ type: 'error', text: 'Maximum 10 items per order' });
      return;
    }

    setForm({
      ...form,
      items: [
        ...form.items,
        { farmerId: '', plantTypeId: '', quantity: '', pricePerUnit: '' }
      ],
    });
  };

  const handleRemoveItem = (index) => {
    if (form.items.length <= 1) {
      setMessage({ type: 'error', text: 'At least one item is required' });
      return;
    }

    const newItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: newItems });
  };
const handleChange = (field, value) => {
  if (field === 'departmentId') {
    const selectedDepartment = departments.find((d) => d._id === value);
    setForm({
      ...form,
      departmentId: value,
      contactPerson: selectedDepartment?.contactPerson || '',
      contactNumber: selectedDepartment?.contactNumber || '',
    });
  } else {
    setForm({
      ...form,
      [field]: value,
    });
  }
};
  const validateForm = () => {
    // Basic validation
    if (!form.departmentId) {
      setMessage({ type: 'error', text: 'Please select a department' });
      return false;
    }

    if (!form.orderRefNo) {
      setMessage({ type: 'error', text: 'Order reference is required' });
      return false;
    }

    for (const item of form.items) {
      if (!item.farmerId || !item.plantTypeId || !item.quantity || !item.pricePerUnit) {
        setMessage({ type: 'error', text: 'Please fill all item fields' });
        return false;
      }

      if (Number(item.quantity) <= 0 || Number(item.pricePerUnit) <= 0) {
        setMessage({ type: 'error', text: 'Quantity and price must be greater than 0' });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/orders', form);
      setMessage({ type: 'success', text: 'Order created successfully' });

      // Get new order reference number
      const response = await api.get('/utility/generate-number?type=ORD');
      
      // Reset form with new reference number
      setForm({
        departmentId: '',
        orderDate: '',
        orderRefNo: response.data.number,
        orderLetterNumber: '',
        contactPerson: '',
        contactNumber: '',
        items: [{
          farmerId: '',
          plantTypeId: '',
          quantity: '',
          pricePerUnit: '',
        }],
      });
      navigate('/orders', { state: { successMessage: 'Order created successfully' } });

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Failed to create order';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full px-10 gap-10 py-10">
      <OrderSidebar activeStatus={'Add'} />

      <div className="px-18 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl">
        <StatusMessageWrapper
  loading={isLoading}
  success={message.type === 'success' ? message.text : ''}
  error={message.type === 'error' ? message.text : ''}
/>
        <h2 className="text-3xl font-bold mb-4">Add Orders</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-8">
            <div className='w-full'>
              <label className="block text-sm font-medium mb-1">Department *</label>
              <select
                value={form.departmentId}
                onChange={(e) => handleChange('departmentId', e.target.value)}
                className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <InputText
              label="Order Date"
              type='date'
              value={form.orderDate}
              handleOnChange={(e) => handleChange('orderDate', e.target.value)}
              required
            />
          </div>

          <div className="flex gap-8">
            <InputText
              label="Order Reference Number *"
              value={form.orderRefNo}
              handleOnChange={(e) => handleChange('orderRefNo', e.target.value)}
              required
            />

            <InputText
              label="Order Letter Number"
              value={form.orderLetterNumber}
              handleOnChange={(e) => handleChange('orderLetterNumber', e.target.value)}
            />
          </div>

          <div className="flex gap-8">
            <InputText
              label="Contact Person"
              value={form.contactPerson}
              handleOnChange={(e) => handleChange('contactPerson', e.target.value)}
            />
            <InputText
              label="Contact Number"
              value={form.contactNumber}
              handleOnChange={(e) => handleChange('contactNumber', e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Farmers</h2>
          </div>

          {form.items.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-4 p-4 border border-gray-300 rounded-lg"
            >
              <div>
                 <SearchableFarmerSelect
        value={item.farmerId}
        onChange={(val) => handleItemChange(index, 'farmerId', val)}
        onAddNewFarmer={() => {
          setCurrentItemIndex(index);
          setShowAddFarmer(true);
        }}
      />
              </div>

               <div>
                <SelectDropdown 
                  label={'Plant Type'} 
                  optionLabel='name' 
                  optionValue='_id' 
                  key='_id' 
                  value={item.plantTypeId} 
                  options={plants} 
                  onChange={(e) => handleItemChange(index, 'plantTypeId', e.target.value)}
                />
              </div> 

              <InputText
                label="Quantity *"
                type="number"
                value={item.quantity}
                handleOnChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                min={1}
                step={1}
                required
              />

              <InputText
                label="Price Per Unit *"
                type="number"
                value={item.pricePerUnit}
                handleOnChange={(e) => handleItemChange(index, 'pricePerUnit', e.target.value)}
                min={0}
                step="0.01"
                disabled
                required
                readOnly
              />

              <div className="flex flex-col h-full items-center justify-end">
                <IconButton 
                  onClick={() => handleRemoveItem(index)} 
                  label='' 
                  size='md' 
                  shape='pill' 
                  disabled={form.items.length <= 1} 
                  icon={<FiTrash />} 
                />
              </div>
            </div>
          ))}

          <div className="flex justify-end items-center">
            <IconButton 
              onClick={handleAddItem} 
              icon={<FiPlus />} 
              label="Add" 
              className="btn btn-sm" 
            />
          </div>

          
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? 'loading...' : 'Submit Order'}
            </Button>
          </div>
        </form>
      </div>

      {showAddFarmer && (
        <AddFarmer
          onAdd={handleFarmerAdded}
          onCancel={() => setShowAddFarmer(false)}
        />
      )}
    </div>
  );
};

export default OrderCreatePage;