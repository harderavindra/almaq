import React, { useEffect, useState } from 'react';
import SearchableOrderSelect from '../order/SearchableOrderSelect';
import api from '../../api/axios';
import Pagination from '../Pagination';

const OrderItemSelector = ({ challanId = "test", chalanItems }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [checkAllExisting, setCheckAllExisting] = useState(false);
  const [checkAllAvailable, setCheckAllAvailable] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState({});
  const [order, setOrder] = useState();
  const [itemQuantities, setItemQuantities] = useState({});
  const [existingChallanItems, setExistingChallanItems] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);

  const [existingPage, setExistingPage] = useState(1);
  const [availablePage, setAvailablePage] = useState(1);

  const [existingPagination, setExistingPagination] = useState({ totalPages: 1 });
  const [availablePagination, setAvailablePagination] = useState({ totalPages: 1 });
const [availableSearch, setAvailableSearch] = useState('');
const [existingSearch, setExistingSearch] = useState('');
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (selectedOrder.orderId) {
      fetchOrderItems(selectedOrder.orderId, existingPage, availablePage);
    }
  }, [existingPage, availablePage]);

  const fetchOrderItems = async (orderId, existingPage = 1, availablePage = 1) => {
    try {
      const { data } = await api.get(`/orderItems/challan-items`, {
        params: {
          orderId,
          challanId,
          limit: ITEMS_PER_PAGE,
          existingPage,
          availablePage,
  existingSearch,
    availableSearch
        },
      });

      setOrder(data.order);
      setExistingChallanItems(data.existingItems || []);
      setAvailableItems(data.availableItems || []);
      setExistingPagination(data.existingPagination || { totalPages: 1 });
      setAvailablePagination(data.availablePagination || { totalPages: 1 });
      setExistingPage(data.existingPagination?.currentPage || 1);
      setAvailablePage(data.availablePagination?.currentPage || 1);
      console.log('data.existingItems',data, challanId)
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };

  const handleUpdateItems = async () => {
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

      fetchOrderItems(selectedOrder.orderId, existingPage, availablePage);
      setSelectedItems([]);
      setItemQuantities({});
      setCheckAllAvailable(false);
      setCheckAllExisting(false);
    } catch (err) {
      console.error(err);
      alert('Failed to add items.');
    }
  };

  const renderTable = (items, checkAll, setCheckAll, type, currentPage, itemsPerPage) => (
    <table className="w-full bg-white text-sm text-left rounded-lg">
      <thead className="bg-blue-100 border-b border-blue-300 text-blue-600">
        <tr>
          <th className="px-4 py-2">#</th>
          <th className="px-4 py-2">Farmer</th>
          <th className="px-4 py-2">QTY</th>
          <th className="px-4 py-2 text-center">
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={checkAll}
              disabled={items.every(item => item.quantity - item.totalChallanQuantity <= 0)}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setCheckAll(isChecked);

                if (isChecked) {
                  const selectable = items.filter(item => item.quantity - item.totalChallanQuantity > 0);
                  const ids = selectable.map(item => item._id);
                  setSelectedItems(ids);

                  const updatedQuantities = {};
                  selectable.forEach(item => {
                    const remaining = item.quantity - item.totalChallanQuantity;
                    updatedQuantities[item._id] = itemQuantities[item._id] ?? remaining;
                  });

                  setItemQuantities(prev => ({ ...prev, ...updatedQuantities }));
                } else {
                  setSelectedItems([]);
                }
              }}
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => {
          const remaining = item.quantity - item.totalChallanQuantity;
          const isDisabled = remaining <= 0;
 const isInChallan = item.challanIds.includes(challanId);
          return (
            
            <tr key={item._id} className={` ${selectedItems.includes(item._id) ? 'bg-blue-100/30 border-b border-blue-200':'even:bg-gray-100/70'}`}>
              <td className="px-4 py-2">
<span className={`w-5 h-5 ${isInChallan ? 'bg-green-300 text-green-800' : 'bg-blue-100 text-blue-800'} flex items-center justify-center rounded-full font-semibold text-xs`}>

                {(currentPage - 1) * itemsPerPage + index + 1}
                </span>
                </td>
                <td className="px-4 py-2">
 {item.farmerId?.firstName || '-'} {item.farmerId?.lastName || '-'} | {item.plantTypeId?.name || '-'} <br />
                Total: {item.quantity} / {item.totalChallanQuantity}
              </td>
              <td className="px-4 py-2">
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
                      [item._id]: isNaN(value) ? '' : value,
                    }));
                  }}
                  className={`border px-2 py-1 rounded w-20 ${!selectedItems.includes(item._id) || isDisabled ? 'opacity-40 pointer-events-none bg-gray-100 border-gray-200' : 'bg-white border-blue-400'
                    }`}
                />
              </td>
              <td className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  className="w-5 h-5"
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
                      if (type === 'existing') setCheckAllExisting(false);
                      else setCheckAllAvailable(false);
                    }
                  }}
                />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="min-h-screen">
      <div className="flex flex-col md:flex-row gap-4 md:gap-20 items-start md:items-center mb-6">
        <div className="w-full md:w-1/2">
          <SearchableOrderSelect
            label=""
            onChange={async (id) => {
              setSelectedOrder({ orderId: id });
              setExistingPage(1);
              setAvailablePage(1);
              await fetchOrderItems(id, 1, 1);
            }}
          />
        </div>
        <div className="w-full md:w-1/2">
          <span className="text-gray-600">Selected:</span>{' '}
          <span className="font-semibold">{order?.orderRefNo || 'Please select an order'}</span>
        </div>
      </div>

      {order && (
        <div className="flex gap-10">
          {/* Challan Items */}
          <div className="w-full border border-blue-300 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Challan Items ({existingPagination.totalItems})</h2>
              <button
                onClick={handleUpdateItems}
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
              >
                Update
              </button>
            </div>
            <input
  type="text"
  placeholder="Search by farmer..."
  value={existingSearch}
  onChange={(e) => {
    setExistingSearch(e.target.value);
        setAvailableSearch('');
    setAvailablePage(1);

    fetchOrderItems(selectedOrder.orderId, 1, availablePage, e.target.value);
    setExistingPage(1);
  }}
  className={`mb-2 p-2 border border-gray-400 rounded-lg w-full focus:border-blue-300 focus:outline-0`}
/>
{renderTable(existingChallanItems, checkAllExisting, setCheckAllExisting, 'existing', existingPage, ITEMS_PER_PAGE)}
            <div className="mt-4">
              <Pagination
                currentPage={existingPage}
                totalPages={existingPagination.totalPages}
                onPageChange={(page) => setExistingPage(page)}
              />
            </div>
          </div>

          {/* Available Items */}
          <div className="w-full border border-gray-300 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Available Items ({availablePagination.totalItems})</h2>
              <button
                onClick={handleUpdateItems}
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
              >
                Update
              </button>
            </div>
            <input
  type="text"
  placeholder="Search available items by farmer"
  value={availableSearch}
  onChange={(e) => {
    setAvailableSearch(e.target.value);
        setExistingSearch('');
    setExistingPage(1);

    setAvailablePage(1);
    fetchOrderItems(selectedOrder.orderId, existingPage, 1);
  }}
  className={`mb-2 p-2 border border-gray-400 rounded-lg w-full focus:border-blue-300 focus:outline-0`}
/>
{renderTable(availableItems, checkAllAvailable, setCheckAllAvailable, 'available', availablePage, ITEMS_PER_PAGE)}
            <div className="mt-4">
              <Pagination
                currentPage={availablePage}
                totalPages={availablePagination.totalPages}
                onPageChange={(page) => setAvailablePage(page)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderItemSelector;
