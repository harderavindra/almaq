import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../api/axios';
import StatusMessageWrapper from '../components/common/StatusMessageWrapper';
import OrderSidebar from '../components/layout/OrderSidebar';
import SelectDropdown from '../components/common/SelectDropdown';
import InputText from '../components/common/InputText';
import IconButton from '../components/common/IconButton';
import SearchableFarmerSelect from '../components/common/SearchableFarmerSelect';
import { FiCheck, FiMapPin, FiPhone, FiPlus, FiTrash, FiTrash2, FiUser, FiX } from 'react-icons/fi';
import LocationDropdowns from '../components/common/LocationDropdowns';
import { hasAccess } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';

const OrderEditPage = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const { orderId } = useParams();
  const location = useLocation();
  const successMessage = location.state?.successMessage || '';

  const [order, setOrder] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluka, setSelectedTaluka] = useState('');
  const [addNewFarmer, setAddNewFarmer] = useState(false);
  const [newFarmer, setNewFarmer] = useState({});
  const [summary, setSummary] = useState({ totalFarmers: 0, totalQuantity: 0, totalAmount: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const ITEMS_PER_PAGE = 2;

  const canEdit = hasAccess(user?.role, ['admin', 'manager']);


  const [form, setForm] = useState({
    farmerId: '',
    plantTypeId: '',
    quantity: '',
    pricePerUnit: ''
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [farmerRes, plantRes] = await Promise.all([
          api.get('/farmers'),
          api.get('/plants')
        ]);

        setFarmers(farmerRes.data);
        setPlants(plantRes.data.data);
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

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/orders/${orderId}/draft`, {
        params: {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined, // optional
        },
      });
      setOrder(res.data.order);
      setItems(res.data.items); // <- Add this line
      setSummary(res.data.summary);
      setTotalPages(res.data.pagination.totalPages || 1);
            setCurrentPage(res.data.pagination.currentPage || 1);

      setSelectedDistrict(res.data.order.departmentId.district);
      setSelectedTaluka(res.data.order.departmentId.taluka);
      if (successMessage) {
        setMessage({ type: 'success', text: successMessage });
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setMessage({ type: 'error', text: 'Failed to load order' });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {


    fetchOrderDetails();
  }, [currentPage]);

  const handleItemChange = (field, value) => {
    const updatedForm = { ...form, [field]: value };

    if (field === 'plantTypeId') {
      const selectedPlant = plants.find((p) => p._id === value);
      updatedForm.pricePerUnit = selectedPlant?.ratePerUnit || '';
    }

    setForm(updatedForm);
  };

  const updateItemToOrder = async () => {
    const { farmerId, plantTypeId, quantity, pricePerUnit } = form;

    if ((!farmerId && !addNewFarmer) || !plantTypeId || !quantity || !pricePerUnit) {
      setMessage({ type: 'error', text: 'Please fill all fields.' });
      return;
    }

    try {
      const res = await api.post(`/orders/${orderId}/item`, {
        farmerId: addNewFarmer ? undefined : farmerId,
        newFarmer: addNewFarmer ? newFarmer : undefined,
        plantTypeId,
        quantity: parseInt(quantity),
        pricePerUnit: parseFloat(pricePerUnit)
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Item added successfully.' });

        setForm({ farmerId: '', plantTypeId: '', quantity: '', pricePerUnit: '' });
        setNewFarmer({});
        setAddNewFarmer(false);
        fetchOrderDetails();

      } else {
        setMessage({ type: 'error', text: res.data.message });
      }
    } catch (error) {
      console.error('Error adding item:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Something went wrong' });
    }
  };

  const deleteItemFromOrder = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      await api.delete(`/orderItems/${itemId}`);
      setItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
      fetchOrderDetails()
      setMessage({ type: 'success', text: 'Item deleted successfully.' });
    } catch (error) {
      console.error('Error deleting item:', error);
      setMessage({ type: 'error', text: 'Failed to delete item.' });
    }
  };
  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus });
      setOrder(prev => ({ ...prev, status: newStatus }));
      fetchOrderDetails(); // Refresh order data

    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update order status');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row h-full px-10 gap-10 py-10">
        <OrderSidebar activeStatus={'Add'} />

        <div className="px-18 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl relative">
          <StatusMessageWrapper
            loading={isLoading}
            success={message.type === 'success' ? message.text : ''}
            error={message.type === 'error' ? message.text : ''}
            className="sticky top-0 z-10"
          />

          <h2 className="text-3xl font-bold mb-4">Edit Draft Order</h2>

          {order && (
            <>
              <div className="bg-blue-100/50 rounded-2xl p-8 mb-6 space-y-1">

                <div className="flex gap-6 justify-between mb-4">
                  <div className="flex flex-col gap-1">
                    <label>Department:</label>
                    <p className="text-lg text-blue-700 font-medium">{order.departmentId?.name}</p>
                  </div>
                  <div className="flex flex-col gap-1 min-w-50">
                    <label>Status </label>
                    {canEdit ? (
                      <select
                        value={order.status}
                        onChange={handleStatusChange}
                        className="text-lg text-blue-700 font-medium bg-white border rounded-md px-2 py-1"
                      >
                        <option value={order.status}>{order.status}</option>

                        {/* For Draft orders */}
                        {(order.status === 'Draft' && (user.role === 'admin' || user.role === 'manager')) && (
                          <>
                            <option value="Submitted">Submitted</option>
                            <option value="Cancelled">Cancelled</option>
                          </>
                        )}
                        {(order.status === 'Submitted' && (user.role === 'admin' || user.role === 'manager')) && (
                          <option value="Approved">Approved</option>
                        )}


                        {/* ✅ Updated condition for Delivered */}
                        {items?.every(group => group.items.every(item => item.status === 'Delivered')) && order?.status === 'Approved' && (
                          <option value="Delivered">Delivered</option>
                        )}
                      </select>

                    ) : (
                      <p className="text-lg text-blue-700 font-medium capitalize">{order.status}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-8">
                  <div className="flex gap-6 justify-between w-full">
                    <div className="flex flex-col gap-1">
                      <label>Order Ref No</label>
                      <p className="text-lg text-blue-700 font-medium">{order?.orderRefNo}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label>Order Date</label>
                      <p className="text-lg text-blue-700 font-medium">{new Date(order?.orderDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label>Contact Person</label>
                      <p className="text-lg text-blue-700 font-medium capitalize">{order?.departmentId?.contactPerson}</p>
                    </div>
                    <div className="flex flex-col gap-1 min-w-50">
                      <label>Contact Number</label>
                      <p className="text-lg text-blue-700 font-medium capitalize">{order.departmentId?.contactNumber}</p>
                    </div>
                  </div>
                </div>
                <div >
                  <div className='flex  gap-5 justify-between pt-5 border-t border-blue-500 mt-6'>
                    <div className='border border-blue-200 bg-white flex  py-0 px-4 rounded-lg items-center'>
                      <label className='text-blue-400 leading-4 pr-5 '>Total Farmers</label>
                      <h4 className='text-2xl text-blue-500 font-bold border-l border-blue-400 pl-5'>{summary.totalFarmers}</h4>
                    </div>
                    <div className='border border-blue-200 bg-white flex  py-0 px-4 rounded-lg items-center'>
                      <label className='text-blue-400 leading-4 pr-5 '>Total Quantity</label>
                      <h4 className='text-2xl text-blue-500 font-bold border-l border-blue-400 pl-5'>{summary.totalQuantity}</h4>
                    </div>
                    <div className='border border-blue-200 bg-white flex  py-0 px-4 rounded-lg items-center'>
                      <label className='text-blue-400 leading-4 pr-5 '>Total Amount</label>
                      <h4 className='text-2xl text-blue-500 font-bold border-l border-blue-400 pl-5'> ₹{summary.totalAmount.toLocaleString()}</h4>
                    </div>

                  </div>
                </div>
              </div>
            </>

          )}

          <div className="flex justify-between items-center mt-8 mb-2">
            <h2 className="text-lg font-semibold">Add Farmer + Plant</h2>
          </div>

          <div className="flex flex-col gap-4 border border-gray-300 rounded-lg">
            {addNewFarmer && (


              <div className='flex flex-col gap-4 p-5 bg-gray-100'>

                <div className='flex flex-col gap-4 '>
                  <h2 className='font-bold text-xl flex justify-between'>Add Farmer and add to order
                    <IconButton onClick={() => setAddNewFarmer(false)} icon={<FiX />} variant='outline' label='' shape='pill' className='bg-white' />
                  </h2>
                  <div className='flex gap-4 '>
                    <div className='w-full'>
                      <SelectDropdown name={'gender'} label={'Gender'}
                        options={['male', 'female', 'Other'].map(gender => ({

                          label: gender,
                          value: gender
                        })

                        )}
                        value={newFarmer.gender || 'Male'}
                        onChange={(e) => setNewFarmer({ ...newFarmer, gender: e.target.value })}
                        placeholder="Select Gender"
                        className='w-full'
                      />
                    </div>
                    <InputText
                      type="text"
                      label="First Name"
                      value={newFarmer.firstName || ''}
                      handleOnChange={(e) => setNewFarmer({ ...newFarmer, firstName: e.target.value })}
                    />
                    <InputText
                      type="text"
                      label="Last Name"
                      value={newFarmer.lastName || ''}
                      handleOnChange={(e) => setNewFarmer({ ...newFarmer, lastName: e.target.value })}
                    />
                  </div>
                  <div className='flex gap-4 '>

                    <InputText
                      type="number"
                      label="Contact Number"
                      value={newFarmer.contactNumber || ''}
                      handleOnChange={(e) => setNewFarmer({ ...newFarmer, contactNumber: e.target.value })}
                      required
                    />

                    <InputText label="Address Line" autoComplete={"Address line"}
                      type="text"
                      value={newFarmer.address || ''}
                      handleOnChange={(e) => setNewFarmer({ ...newFarmer, address: e.target.value })} />
                    <InputText
                      type="text"
                      label="Identification Number "
                      value={newFarmer.idNumber || ''}
                      handleOnChange={(e) => setNewFarmer({ ...newFarmer, idNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <LocationDropdowns
                  onChange={(locationData) => {
                    console.log('Location Data:', locationData);
                    setNewFarmer((prev) => ({
                      ...prev,
                      ...locationData // Directly updates state, district, taluka, city
                    }));
                  }}
                  defaultDistrict={selectedDistrict}
                  defaultTaluka={selectedTaluka}
                  className='flex-row gap-4'
                />
              </div>
            )}
            <div className="flex gap-4 items-end mb-4 p-4 ">
              <div className='flex items-end gap-2 min-w-xs'>
                <SearchableFarmerSelect
                  value={form.farmerId}
                  onChange={(val) => handleItemChange('farmerId', val)}
                  district={selectedDistrict}
                  taluka={selectedTaluka}
                  disabled={addNewFarmer}
                />
                <IconButton disabled={addNewFarmer} onClick={() => setAddNewFarmer(true)} icon={<FiPlus size={24} />} label='' className={'w-14'} />
              </div>
              <div className='w-sm'>

                <SelectDropdown
                  label="Plant Type"
                  optionLabel="name"
                  optionValue="_id"
                  key="_id"
                  value={form.plantTypeId}
                  options={plants}
                  onChange={(e) => handleItemChange('plantTypeId', e.target.value)}
                />
              </div>
              <div className='w-30'>

                <InputText
                  label="Price"
                  type="number"
                  value={form.pricePerUnit}
                  handleOnChange={(e) => handleItemChange('pricePerUnit', e.target.value)}
                  min={0}
                  step="0.01"
                  disabled
                  required
                  readOnly
                />
              </div>
              <div className='w-30'>
                <InputText
                  label="Quantity *"
                  type="number"
                  value={form.quantity}
                  handleOnChange={(e) => handleItemChange('quantity', e.target.value)}
                  min={1}
                  step={1}
                  required
                />

              </div>

              <IconButton
                onClick={updateItemToOrder}
                label=""
                size="md"
                shape="pill"
                icon={<FiCheck />}
              />
            </div>
          </div>
          <table className="w-full border-collapse mt-10">
            <thead className="bg-blue-50 text-blue-500 font-semibold border-b border-blue-200">
              <tr>
                <th className="px-4 py-2 text-left">Farmer</th>
                <th className="px-4 py-2 text-left">Plant Type</th>
                <th className="px-4 py-2 text-left">Quantity</th>
                <th className="px-4 py-2 text-left">Price/Unit</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((itemGroup, idx) => {
                const allDelivered = itemGroup.items.every((item) => item.status === 'Delivered');
                const hasInvoice = itemGroup.items.some((item) => item.invoiceId);
                const invoiceId = hasInvoice ? itemGroup.items.find((item) => item.invoiceId)?.invoiceId : null;
                const hasPaymentStatus = itemGroup.items.some((item) => item.paymentStatus);

                return (
                  <React.Fragment key={idx}>
                    {itemGroup.items.map((item, itemIdx) => (
                      <tr key={item._id} className='border-b border-gray-200 '>
                        {/* Render farmer info only once, spanning all rows for this group */}
                        {itemIdx === 0 && (
                          <td rowSpan={itemGroup.items.length} className="px-4 py-3 align-top border-r border-gray-200 " align='top'>
                            <div className="text-gray-700 flex items-start gap-3">
                              <FiUser />
                              <div>
                                <strong>{itemGroup.farmer?.firstName} {itemGroup.farmer?.lastName}</strong>
                                <FiMapPin className="inline" /> {itemGroup.farmer?.district}
                                <FiPhone className="inline" /> {itemGroup.farmer?.contactNumber}
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Item-specific data */}
                        <td className="px-4 py-1">{item.plantTypeId?.name?.trim()}</td>
                        <td className="px-4 py-1">{item.quantity}</td>
                        <td className="px-4 py-1">{item.pricePerUnit}</td>
                        <td className="px-4 py-1 text-right">
                          <IconButton
                            icon={<FiTrash2 />}
                            label=""
                            size='sm'
                            variant="danger"
                            shape="pill"
                            onClick={() => deleteItemFromOrder(item._id)}
                            className="ml-auto"
                          />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}

            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
                        onPageChange={setCurrentPage}
          />


        </div>
      </div>
    </div>
  );
};

export default OrderEditPage;
