import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { FiBox, FiCalendar, FiPlus, FiTruck, FiUser, FiX } from 'react-icons/fi';
import InputText from '../components/common/InputText';
import SelectDropdown from '../components/common/SelectDropdown';
import OrderItemSelector from '../components/challan/OrderItemSelector';

import Button from '../components/common/Button';
import StatusMessageWrapper from '../components/common/StatusMessageWrapper';
import ChallanSidebar from '../components/layout/ChallanSidebar';
import { validateDate, validateDropdown, validateRequired } from '../utils/validators';

const ChallanCreatePage = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
    const today = new Date().toISOString().split('T')[0];
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    challanNo: '',
    vehicleId: '',
    routeDetails: '',
    dispatchDate: today,
    notes: '',
  });

  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const fetchChallanNo = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/utility/generate-number?type=CHL');
        setForm(prev => ({ ...prev, challanNo: response.data.number }));
        setMessage({ type: 'success', text: 'Challan No generated successfully' });
      } catch (error) {
        console.error('Error fetching Challan No:', error);
        setMessage({ type: 'error', text: 'Failed to generate Challan No' });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDropdownData = async () => {
      try {
        const [vehiclesRes, orderItemsRes] = await Promise.all([
          api.get('/vehicles'),
          api.get('/orderItems')
        ]);
        console.log('Vehicles:', vehiclesRes.data);
        console.log('Order Items2:', orderItemsRes.data);
        setVehicles(vehiclesRes.data.data);
        setOrderItems(orderItemsRes.data);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        setMessage({ type: 'error', text: 'Failed to load dropdown data' });
      }
    };

    fetchChallanNo();
    fetchDropdownData();
  }, []);

 const validateField = (field, value) => {
    switch (field) {
      case 'challanNo':
        return validateRequired(value, 'Challan No');
      case 'vehicleId':
        return validateDropdown(value, 'Vehicle');
      case 'dispatchDate':
        return validateDate(value, 'Dispatch Date');
      case 'routeDetails':
        return validateRequired(value, 'Route Details');
      default:
        return '';
    }
  };


   const validateForm = () => {
    const fields = ['challanNo', 'vehicleId', 'dispatchDate', 'routeDetails'];
    const newErrors = {};

    fields.forEach(field => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await api.post('/challans', form);
      
      navigate(`/challans/${response.data.challan._id}/edit?status=${response.data.challan.status}`, {
        state: { success: 'Challan created successfully' }
      });

    
    } catch (error) {
      console.error('Challan creation failed:', error);
      setErrorMessage(
        error.response?.data?.message || 'Error creating challan'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full px-10 gap-10 py-10">

      {/* Sidebar */}
      {
        <ChallanSidebar />
      }
      <div className="px-8 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl shadow">
     
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold mb-4">Add Challan</h2>
          <StatusMessageWrapper
            loading={isLoading}
            success={message.type === 'success' ? message.text : ''}
            error={message.type === 'error' ? message.text : ''}
            className="sticky top-0 z-10"
          />
        </div>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-10 justify-between ">
            <div className="mb-2 w-full">
              <InputText label={'Challan No'} type="text" value={form.challanNo} 
handleOnChange={e => handleChange('challanNo', e.target.value)}
hasError={!!errors.challanNo}

className="input" required />
            </div>
            <div className="w-full">
              <SelectDropdown
                label="Vehicle"
                value={form.vehicleId}
                onChange={e => setForm({ ...form, vehicleId: e.target.value })}
                options={vehicles}
                optionLabel={v => `${v.vehicleNumber} - ${v.driverName}`} // Optional if dynamic
                optionValue="_id"
                placeholder="Select Vehicle"
                hasError={!!errors.vehicleId}

                
              />
            </div>
          </div>
          <div className="flex gap-10 justify-between ">

            <div className=" w-full">
              <InputText type="date" label={'Dispatch Date'} value={form.dispatchDate} handleOnChange={e => setForm({ ...form, dispatchDate: e.target.value })} />
            </div>
            <InputText type="text" label={'Route Details'} value={form.routeDetails} 
            handleOnChange={e => handleChange('routeDetails', e.target.value)}
hasError={!!errors.routeDetails}
            />
          </div>
          
          <div className="mb-2 flex flex-col gap-1">
            <label className='w-full'>Notes:</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="border rounded-md border-gray-400 px-3 py-2 focus:border-blue-300 focus:outline-0 w-full" />
          </div>

          {showSelector && (
            <div className="w-screen h-screen p-5 fixed top-0 left-0 bg-black/50 z-50 flex justify-center items-center">
              <div className=" bg-red-300 h-full">
                <div className="mb-2 p-10  h-full overflow-y-auto bg-white rounded-2xl w-6xl relative">
                  <button type="button" onClick={() => setShowSelector(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
                    <FiX size={24} />
                  </button>
                  <OrderItemSelector
                    orderItems={orderItems}
                    onItemsSelected={(items) => {
                      setForm(prev => ({
                        ...prev,
                        items: [...prev.items, ...items]
                      }));
                      setShowSelector(false);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-6">

            <Button type="submit" className="btn btn-primary w-sm ">Save & Continue</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallanCreatePage;
