import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import InputText from '../components/common/InputText';
import Button from '../components/common/Button';
import OrderSidebar from '../components/layout/OrderSidebar';
import StatusMessageWrapper from '../components/common/StatusMessageWrapper';
import SearchableDepartmentSelect from '../components/order/SearchableDepartmentSelect';
import {
  validateDropdown,
  validateOrderRef,
  validateRequired,
  validateDate,
} from '../utils/validators';

const OrderCreatePage = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showAddFarmer, setShowAddFarmer] = useState(false);

  const [form, setForm] = useState({
    departmentId: '',
    orderDate: '',
    orderRefNo: '',
    orderLetterNumber: '',
    contactPerson: '',
    contactNumber: '',
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [deptRes, orderNumberRes] = await Promise.all([
          api.get('/departments'),
          api.get('/utility/generate-number?type=ORD'),
        ]);

        setDepartments(deptRes.data.data);
        setForm((prev) => ({
          ...prev,
          orderRefNo: orderNumberRes.data.number,
          orderDate: new Date().toISOString().split('T')[0],
        }));
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

  const validateField = (field, value) => {
    switch (field) {
      case 'departmentId':
        return validateDropdown(value, 'Department');
      case 'orderDate':
        return validateRequired(value, 'Order Date') || validateDate(value, 'Order Date');
      case 'orderRefNo':
        return validateRequired(value, 'Order Reference Number') || validateOrderRef(value);
      case 'orderLetterNumber':
        return validateRequired(value, 'Order Letter Number');
      case 'contactPerson':
        return validateRequired(value, 'Contact Person');
      case 'contactNumber':
        return validateRequired(value, 'Contact Number');
      default:
        return null;
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    const errorMessage = validateField(field, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: errorMessage,
    }));

    if (field === 'departmentId') {
      const selectedDepartment = departments.find((d) => d._id === value);
      setForm((prev) => ({
        ...prev,
        departmentId: value,
        contactPerson: selectedDepartment?.contactPerson || '',
        contactNumber: selectedDepartment?.contactNumber || '',
      }));
      setSelectedDistrict(selectedDepartment?.district || '');
    }
  };

  const validateForm = () => {
    const fields = ['departmentId', 'orderDate', 'orderRefNo', 'orderLetterNumber', 'contactPerson', 'contactNumber'];
    const newErrors = {};

    fields.forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/orders', form);
      setMessage({ type: 'success', text: 'Order created successfully' });

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
      <OrderSidebar activeStatus="Add" />

      <div className="px-18 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl relative">
        <div className="flex justify-between">
          <h2 className="text-3xl font-bold mb-4">Add Orders</h2>
          <StatusMessageWrapper
            loading={isLoading}
            success={message.type === 'success' ? message.text : ''}
            error={message.type === 'error' ? message.text : ''}
            className="sticky top-0 z-10"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-8">
            <div className="w-full">
              <SearchableDepartmentSelect
                label="Department *"
                onChange={(id, deptObj) => {
                  handleChange('departmentId', id);
                  setForm((prev) => ({
                    ...prev,
                    contactPerson: deptObj.contactPerson || '',
                    contactNumber: deptObj.contactNumber || '',
                  }));
                  setSelectedDistrict(deptObj.district || '');
                }}
                hasError={!!errors.departmentId} 
                errorMessage={errors.departmentId}
              />
            </div>

            <InputText
              label="Order Date"
              type="date"
              value={form.orderDate}
              handleOnChange={(e) => handleChange('orderDate', e.target.value)}
              hasError={!!errors.orderDate}
              errorMessage={errors.orderDate}
            />
          </div>

          <div className="flex gap-8">
            <InputText
              label="Order Reference Number *"
              value={form.orderRefNo}
              handleOnChange={(e) => handleChange('orderRefNo', e.target.value)}
              hasError={!!errors.orderRefNo}
              errorMessage={errors.orderRefNo}
            />

            <InputText
              label="Order Letter Number"
              value={form.orderLetterNumber}
              handleOnChange={(e) => handleChange('orderLetterNumber', e.target.value)}
              hasError={!!errors.orderLetterNumber}
              errorMessage={errors.orderLetterNumber}
            />
          </div>

          <div className="flex gap-8">
            <InputText
              label="Contact Person"
              value={form.contactPerson}
              handleOnChange={(e) => handleChange('contactPerson', e.target.value)}
              hasError={!!errors.contactPerson}
              errorMessage={errors.contactPerson}
            />
            <InputText
              label="Contact Number"
              value={form.contactNumber}
              handleOnChange={(e) => handleChange('contactNumber', e.target.value)}
              hasError={!!errors.contactNumber}
              errorMessage={errors.contactNumber}
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
