import React, { useEffect, useState } from 'react';
import SearchableDepartmentSelect from '../order/SearchableDepartmentSelect';
import api from '../../api/axios';
import InputText from '../common/InputText';
import Pagination from '../Pagination';
import SearchableOrderSelect from '../order/SearchableOrderSelect';

const OrderItemSelector = ({ challanId = "test", chalanItems }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [checkAllExisting, setCheckAllExisting] = useState(false);
  const [checkAllAvailable, setCheckAllAvailable] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [orderItems, setOrderItems] = useState([]);
  const [order, setOrder] = useState();
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemQuantities, setItemQuantities] = useState({});
  const [existingChallanItems, setExistingChallanItems] = useState(chalanItems);
  const [availableItems, setAvailableItems] = useState([]);

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (selectedOrder.departmentId) {
      fetchOrderItems(selectedOrder.orderId, currentPage);
    }
  }, [currentPage]);

  const fetchOrderItems = async (orderId, page = 1) => {
    try {
      const { data } = await api.get(`/orderItems/challan-items`, {
        params: {
          orderId,
          page,
          limit: ITEMS_PER_PAGE,
          search: searchTerm || undefined,
        },
      });

      const items = data.items || [];
      const existing = [];
      const available = [];

      items.forEach((item) => {
        if (item.challanIds?.includes(challanId)) {
          existing.push(item);
        } else {
          available.push(item);
        }
      });
      setOrder(data.order);
      setOrderItems(items);
      setExistingChallanItems(existing);
      setAvailableItems(available);
      setTotalPages(data.pagination?.totalPages || 1);
      setCurrentPage(data.pagination?.currentPage || 1);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const handleUpdateItems = async () => {
    if (!challanId) {
      alert("Challan ID is missing.");
      return;
    }

    const itemsToSend = selectedItems
      .map((id) => {
        const qty = itemQuantities[id];
        if (!qty || qty <= 0) return null;
        return { orderItemId: id, challanQuantity: qty };
      })
      .filter(Boolean);

    if (itemsToSend.length === 0) {
      alert("Please select items and provide valid quantities.");
      return;
    }

    try {
      const { data } = await api.post(`/challans/${challanId}/items`, {
        challanId,
        items: itemsToSend,
      });
      console.log('Items added successfully.', data);
      fetchOrderItems(selectedOrder.orderId, currentPage);
      setSelectedItems([]);
      setItemQuantities({});
      setCheckAllAvailable(false);
      setCheckAllExisting(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add items.');
    }
  };

  return (
    <div className="relative min-h-screen ">
      <div className='flex gap-20 items-center '>
        <div className=" w-full">
          <SearchableOrderSelect
            label=""
            onChange={async (id, deptObj) => {
              setSelectedOrder({ orderId: id });
              setCurrentPage(1);
              await fetchOrderItems(id, 1);
            }}
          />
        </div>
        <div className="w-full">
          Selected: <span className="font-semibold">{order?.orderRefNo || 'None'}</span>
        </div>
      </div>
      <div className='flex gap-10'>
        <div className='flex flex-col gap-5 w-full'>

          {/* Existing Challan Items Table */}
          <div className="mt-4 overflow-x-auto border border-gray-300 w-full rounded-2xl">
            <button onClick={handleUpdateItems} className="mb-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Update
            </button>

            <table className="w-full bg-white  rounded-lg text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-center ">
                    <input
                      type="checkbox"
                       className='w-5 h-5 '
                      checked={checkAllExisting}
                      disabled={existingChallanItems.every(item => item.quantity - item.totalChallanQuantity <= 0)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setCheckAllExisting(isChecked);

                        if (isChecked) {
                          const selectableItems = existingChallanItems
                            .filter(item => item.quantity - item.totalChallanQuantity > 0)
                            .map(item => item._id);

                          setSelectedItems(selectableItems);

                          const updatedQuantities = {};
                          existingChallanItems.forEach(item => {
                            const remaining = item.quantity - item.totalChallanQuantity;
                            if (remaining > 0) {
                              updatedQuantities[item._id] = itemQuantities[item._id] ?? remaining;
                            }
                          });

                          setItemQuantities(prev => ({ ...prev, ...updatedQuantities }));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-2 ">#</th>

                  <th className="px-4 py-2 ">QTY</th>
                </tr>
              </thead>
              <tbody>
                {existingChallanItems.map((item, index) => {
                  const remaining = item.quantity - item.totalChallanQuantity;
                  const isDisabled = remaining <= 0;

                  return (
                    <tr key={item._id} className=" even:bg-gray-100/70">
                      <td className="px-4 py-2 ">
                        <input
                          type="checkbox"
 className='w-5 h-5 '                          checked={selectedItems.includes(item._id)}
                          disabled={isDisabled}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            if (isChecked) {
                              setSelectedItems([...selectedItems, item._id]);
                              setItemQuantities(prev => ({
                                ...prev,
                                [item._id]: prev[item._id] ?? remaining,
                              }));
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== item._id));
                              setItemQuantities(prev => {
                                const updated = { ...prev };
                                delete updated[item._id];
                                return updated;
                              });
                              setCheckAllAvailable(false);
                            }
                          }}
                        /></td>
                      <td className="px-4 py-2 ">
                        {index + 1}
                        {item.farmerId?.firstName || '-'}
                        {item.plantTypeId?.name || '-'}
                        Total: {item.quantity} / {item.totalChallanQuantity}</td>
                      <td className="px-4 py-2 ">
                        <input
                          type="number"
                          min="1"
                          max={remaining}
                          disabled={!selectedItems.includes(item._id) || isDisabled}
                          value={
                            itemQuantities[item._id] !== undefined
                              ? itemQuantities[item._id]
                              : remaining
                          }
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            setItemQuantities(prev => ({
                              ...prev,
                              [item._id]: isNaN(value) ? '' : value
                            }));
                          }}
                          className={`border px-2 py-1 rounded w-20  transition-opacity duration-300 ${!selectedItems.includes(item._id) || isDisabled ? 'opacity-40 pointer-events-none bg-gray-100 border-gray-200' : 'opacity-100 bg-blue-50 border-blue-400'
                            }`}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className='w-full'>

          {/* Available Items Table */}
          <div className="mt-4 overflow-x-auto border border-gray-300 w-full rounded-2xl">
            <button onClick={handleUpdateItems} className="m-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Update
            </button>

            <table className="w-full bg-white  rounded-lg text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-center ">
                    <input
                    className='w-5 h-5 '
                      type="checkbox"
                      checked={checkAllAvailable}
                      disabled={availableItems.every(item => item.quantity - item.totalChallanQuantity <= 0)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setCheckAllAvailable(isChecked);

                        if (isChecked) {
                          const selectableItems = availableItems
                            .filter(item => item.quantity - item.totalChallanQuantity > 0)
                            .map(item => item._id);

                          setSelectedItems(selectableItems);

                          const updatedQuantities = {};
                          availableItems.forEach(item => {
                            const remaining = item.quantity - item.totalChallanQuantity;
                            if (remaining > 0) {
                              updatedQuantities[item._id] = itemQuantities[item._id] ?? remaining;
                            }
                          });

                          setItemQuantities(prev => ({ ...prev, ...updatedQuantities }));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-2 ">#</th>
                  
                  <th className="px-4 py-2 ">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {availableItems.map((item, index) => {
                  const remaining = item.quantity - item.totalChallanQuantity;
                  const isDisabled = remaining <= 0;

                  return (
                    <tr key={item._id} className=" even:bg-gray-100/70">
                      <td className="px-4 py-2 ">
                        <input
                          type="checkbox"
                                              className='w-5 h-5 '

                          checked={selectedItems.includes(item._id)}
                          disabled={isDisabled}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            if (isChecked) {
                              setSelectedItems([...selectedItems, item._id]);
                              setItemQuantities(prev => ({
                                ...prev,
                                [item._id]: prev[item._id] ?? remaining,
                              }));
                            } else {
                              setSelectedItems(selectedItems.filter(id => id !== item._id));
                              setItemQuantities(prev => {
                                const updated = { ...prev };
                                delete updated[item._id];
                                return updated;
                              });
                              setCheckAllExisting(false);
                            }
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 ">{index + 1}
                        {item.farmerId?.firstName || '-'}
                        {item.plantTypeId?.name || '-'}
                         {item.quantity} / {item.totalChallanQuantity}</td>
                      <td className="px-4 py-2 ">
                        <input
                          type="number"
                          min="1"
                          max={remaining}
                          disabled={!selectedItems.includes(item._id) || isDisabled}
                          value={
                            itemQuantities[item._id] !== undefined
                              ? itemQuantities[item._id]
                              : remaining
                          }
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            setItemQuantities(prev => ({
                              ...prev,
                              [item._id]: isNaN(value) ? '' : value
                            }));
                          }}
                          className="border px-2 py-1 rounded w-20"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItemSelector;
