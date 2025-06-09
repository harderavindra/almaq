// components/common/OrderItemSelector.js
import React, { useState } from 'react';
import SearchableDepartmentSelect from '../order/SearchableDepartmentSelect';
import api from '../../api/axios'
import InputText from '../common/InputText';
const OrderItemSelector = () => {
  const [selectedOrder, setSelectedOrder] = useState({});
  const [orderItems, setOrderItems] = useState([]);

  const fetchOrderItems = async (departmentId) => {
  const { data } = await api.get(`/orderItems/challan-items?departmentId=${departmentId}`);
    setOrderItems(data);
  };

  return (
    <div className="space-y-4">

      <SearchableDepartmentSelect
        label="Department *"
        onChange={async (id, deptObj) => {
          setSelectedOrder({
            departmentId: id,
            contactPerson: deptObj.contactPerson || '',
            contactNumber: deptObj.contactNumber || '',
          });
          await fetchOrderItems(id);
        }}
      />
      <div className="text-sm text-gray-700">
        Selected Department ID: <span className="font-semibold">{selectedOrder.departmentId || 'None'}</span>
      </div>
      <div className='flex'>

        <div className='w-full'>

          {orderItems.map(item => (
            <div key={item._id} className="border p-2 rounded">
              <div><strong>Farmer:</strong> {item.farmerId?.name}</div>
              <div><strong>Plant:</strong> {item.plantTypeId?.name}</div>
              <div><strong>Remaining:</strong> {item.quantity - item.deliveredQuantity}</div>
              <InputText
                type="number"
                min={1}
                placeholder="Enter qty"
              />
            </div>
          ))}
        </div>
        <div className='w-full'>
          Add selected list with quntity
        </div>
      </div>
    </div>
  );
};

export default OrderItemSelector;
