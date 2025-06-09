import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { FiBox, FiCalendar, FiPlus, FiTruck, FiUser, FiX } from 'react-icons/fi';
import InputText from '../components/common/InputText';
import SelectDropdown from '../components/common/SelectDropdown';
import OrderItemSelector from '../components/challan/OrderItemSelector';
import { RiPlantLine } from "react-icons/ri";
import IconButton from '../components/common/IconButton';
import Button from '../components/common/Button';
import StatusMessageWrapper from '../components/common/StatusMessageWrapper';

const ChallanCreatePage = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    challanNo: '',
    vehicleId: '',
    dispatchDate: '',
    routeDetails: '',
    notes: '',
    items: []
  });

  const [newItem, setNewItem] = useState({ orderItemId: '', quantity: '' });
  const [showSelector, setShowSelector] = useState(false);

  // Load vehicles and orderItems on mount
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



  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setErrorMessage('');

  try {
 const response = await api.post('/challans', form);
    console.log('Challan created successfully:', response.data);
    // Navigate first before resetting the form (avoids unnecessary re-renders)
    navigate('/challans', {
      state: { success: 'Challan created successfully' }
    });

    // Optional: If staying on the same page (e.g., with a modal), reset here
    setForm({
      challanNo: '',
      vehicleId: '',
      dispatchDate: '',
      notes: '',
      items: []
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
      <div className="w-52 h-full p-4">
        <h3 className="text-lg font-bold mb-4">Order Status</h3>
        <ul className="space-y-2">
          <li>
            <Link to="/add-challan" className="cursor-pointer px-5 py-2 rounded-full flex gap-4 items-center hover:bg-blue-100">
              <FiPlus />
              Add Challan
            </Link>
          </li>
          <li>
            <Link to="/challans" className="cursor-pointer px-5 py-2 rounded-full flex gap-4 items-center bg-blue-500 text-white">
              <FiTruck />
              Challans
            </Link>
          </li>
        </ul>
      </div>
      <div className="px-8 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl shadow">
        {
<StatusMessageWrapper
  loading={isLoading}
  success={message.type === 'success' ? message.text : ''}
  error={message.type === 'error' ? message.text : ''}
/>        }
        <h2 className="text-3xl font-bold mb-4">Challan Details</h2>
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex gap-10 justify-between ">
            <div className="mb-2 w-full">
              <InputText label={'Challan No'} type="text" value={form.challanNo} handleOnChange={e => setForm({ ...form, challanNo: e.target.value })} className="input" required />
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
                required
              />
            </div>
          </div>
          <div className="flex gap-10 justify-between ">

            <div className=" w-full">
              <InputText type="date" label={'Dispatch Date'} value={form.dispatchDate} handleOnChange={e => setForm({ ...form, dispatchDate: e.target.value })} />
            </div>
            <InputText type="text" label={'Route Details'} value={form.routeDetails} handleOnChange={e => setForm({ ...form, routeDetails: e.target.value })} />
          </div>
          <div className="mt-4">
            <div className='flex justify-between pb-4'><h4 className="font-semibold">Items</h4>
              {/* <button type="button"
                onClick={() => setShowSelector(!showSelector)} className='flex gap-3 items-center border border-gray-300 px-4 py-1 rounded-md focus:outline-blue-50 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 cursor-pointer'  ><FiPlus />Add Items</button> */}
            </div>
            <ul className="space-y-2 mt-2">
              {form.items.map((item, idx) => {
                const orderItem = orderItems.find(oi => oi._id === item.orderItemId);

                if (!orderItem) return null;

                return (
                  <li key={idx} className="border border-gray-300 p-2 rounded-lg flex gap-5 text-lg font-semibold items-center justify-between">
                   <div className='flex gap-8 items-center'>
                    <div className=" w-6 h-6 bg-blue-50 border border-blue-300 font-semibold flex justify-center items-center text-blue-700 rounded-full">{idx + 1}</div>
                    <div className='flex items-center gap-2 min-w-44'> <FiUser /> {orderItem.farmerId?.name}</div>
                    <div className='flex items-center gap-2'> <FiCalendar /> {new Date(orderItem.orderId.orderDate).toLocaleDateString()}</div>
                    <div className='flex items-center gap-2 min-w-30'> <RiPlantLine />{orderItem.plantTypeId?.name}</div>
                    <div className='flex items-center gap-2'> <FiBox />{item.quantity}</div>
                   </div>
          <IconButton icon={<FiX />} shape='pill' label=''  onClick={() => {
            setForm(prev => ({
              ...prev,
              items: prev.items.filter((_, i) => i !== idx)
            }));
          }} className="btn btn-sm" />
                  </li>
                );
              })}
            </ul>
            <div className="flex gap-3 mt-4 justify-end">
              <IconButton onClick={() => setShowSelector(!showSelector)} icon={<FiPlus />} className="btn btn-sm" />

            </div>
          </div>
          <div className="mb-2 flex flex-col gap-1">
            <label className='w-full'>Notes:</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="border rounded-md border-gray-400 px-3 py-2 focus:border-blue-300 focus:outline-0 w-full" />
          </div>

          {showSelector && (
            <div className="w-screen h-screen p-5 fixed top-0 left-0 bg-black/50 z-50 flex justify-center items-center">
              <div className="mb-2 p-10 min-h-full bg-white rounded-2xl w-6xl relative">
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
          )}

          <div className="flex pt-5 justify-center">

            <Button type="submit" className="btn btn-primary w-sm ">Create Challan</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallanCreatePage;
