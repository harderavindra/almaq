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
import SearchableDepartmentSelect from '../components/order/SearchableDepartmentSelect';

const OrderCreatePage = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const [form, setForm] = useState({
    departmentId: '',
    orderDate: '',
    orderRefNo: '',
    orderLetterNumber: '',
    contactPerson: '',
    contactNumber: '',
    
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [deptRes,orderNumberRes] = await Promise.all([
          api.get('/departments'),
          api.get('/utility/generate-number?type=ORD')
        ]);

        setDepartments(deptRes.data.data);
       
        setForm(prev => ({ ...prev, orderRefNo: orderNumberRes.data.number, orderDate:new Date().toISOString().split('T')[0] }));
        setMessage({ type: 'success', text: 'Data loaded successfully' });
      } catch (error) {
        console.error('Error loading initial data:', error);
        setMessage({ type: 'error', text: 'Failed to load dropdown data' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  

  
  const handleChange = (field, value) => {
    if (field === 'departmentId') {

      const selectedDepartment = departments.find((d) => d._id === value);
      setForm({
        ...form,
        departmentId: value,
        contactPerson: selectedDepartment?.contactPerson || '',
        contactNumber: selectedDepartment?.contactNumber || '',
      });
      setSelectedDistrict(selectedDepartment?.district || '');
      console.log(selectedDepartment.district)

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
      
      });
          const newOrderId = response.data.orderId;

      navigate(`/orders/${newOrderId}/edit`, {
      state: { successMessage: 'Order created as draft. Add farmers now.' },
    });

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

      <div className="px-18 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl relative">
        <StatusMessageWrapper
          loading={isLoading}
          success={message.type === 'success' ? message.text : ''}
          error={message.type === 'error' ? message.text : ''}
          className="sticky top-0 z-10"

        />
        <h2 className="text-3xl font-bold mb-4">Add Orders</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-8">
            <div className='w-full'>

              <SearchableDepartmentSelect
                label="Department *"
                onChange={(id, deptObj) => {
                  setForm((prev) => ({
                    ...prev,
                    departmentId: id,
                    contactPerson: deptObj.contactPerson || '',
                    contactNumber: deptObj.contactNumber || '',
                  }));
                  setSelectedDistrict(deptObj.district || '');
                }}
              />
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
           <div className="flex justify-end mt-6">
            <Button
              type="submit"
              disabled={isLoading || message.type === 'error'}
              className="w-full md:w-auto"
            >
              {isLoading ? 'loading...' : 'Save & Continue'}
            </Button>
          </div>

      
    

         
        </form>
      </div>

    
    </div>
  );
};

export default OrderCreatePage;