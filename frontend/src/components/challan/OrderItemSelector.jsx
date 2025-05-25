// components/common/OrderItemSelector.js
import React, { useState, useEffect } from 'react';
import InputText from '../common/InputText';
import Button from '../common/Button';
import { FiBox, FiCalendar, FiClipboard, FiUser } from 'react-icons/fi';
import { RiPlantLine } from 'react-icons/ri';

const OrderItemSelector = ({ orderItems, onItemsSelected }) => {
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckboxChange = (checked, orderItem) => {
    if (checked) {
      setSelectedItems(prev => [...prev, { orderItemId: orderItem._id, quantity: '' }]);
    } else {
      setSelectedItems(prev => prev.filter(i => i.orderItemId !== orderItem._id));
    }
  };

  const handleQuantityChange = (orderItemId, quantity) => {
    setSelectedItems(prev =>
      prev.map(i =>
        i.orderItemId === orderItemId ? { ...i, quantity: parseInt(quantity) || '' } : i
      )
    );
  };
  const handleSelectFullQtyChange = (id, checked, remainingQty) => {
  setSelectedItems(prev =>
    prev.map(i =>
      i.orderItemId === id
        ? {
            ...i,
            selectFullQty: checked,
            quantity: checked ? remainingQty : ''
          }
        : i
    )
  );
};

  const handleAdd = () => {
    const valid = selectedItems.filter(i => i.quantity > 0);
    if (valid.length === 0) {
      alert('Enter valid quantities for selected items');
      return;
    }
    onItemsSelected(valid);
    setSelectedItems([]);
  };

  return (
    <div className="mb-4 max-h-full overflow-y-auto min-h-full">
      <label className="font-semibold">Select Order Items:</label>
      <div className="space-y-2 mt-2">
        {orderItems.map(item => {
          const isSelected = selectedItems.some(i => i.orderItemId === item._id);
          const selected = selectedItems.find(i => i.orderItemId === item._id);

          return (
            <div key={item._id} className="border border-gray-300 p-2 rounded-lg flex gap-5 text-lg font-semibold items-center">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={e => handleCheckboxChange(e.target.checked, item)}
              />
              <div className='flex items-center gap-2'> <FiClipboard /> {item?.orderId?.orderRefNo}</div>
              <div className='flex items-center gap-2'> <FiUser /> {item?.farmerId?.name}</div>
              <div className='flex items-center gap-2'> <FiCalendar /> {new Date(item?.orderId?.orderDate).toLocaleDateString()}</div>
              <div className='flex items-center gap-2'> <RiPlantLine /> {item?.plantTypeId?.name}</div>
              <div className='flex items-center gap-2'> <FiBox /> {item?.quantity - item?.deliveredQuantity} remaining</div>
              {/* <span className="flex-1">
              {item?.orderId.orderDate} -{item?.orderId.orderRefNo} - {item?.farmerId?.name} – {item.plantTypeId.name} - {item.quantity - item.deliveredQuantity} remaining
              </span> */}
              {isSelected && (
  <div className="w-20 flex items-center gap-2">
    {/* Select Full Quantity Checkbox */}
    <input
      type="checkbox"
      checked={selected?.selectFullQty || false}
      onChange={e =>
        handleSelectFullQtyChange(
          item._id,
          e.target.checked,
          item.quantity - item.deliveredQuantity
        )
      }
    />

    {/* Quantity Input - visible only if not full qty selected */}
    {!selected?.selectFullQty && (
      <InputText
        type="number"
        min="1"
        max={item.quantity - item.deliveredQuantity}
        value={selected?.quantity || ''}
        handleOnChange={e =>
          handleQuantityChange(item._id, e.target.value)
        }
        className="w-5"
      />
    )}
  </div>
)}
            </div>
          );
        })}
      </div>
      <Button type="button" onClick={handleAdd} className="btn btn-sm mt-2">
        Add Items
      </Button>
    </div>
  );
};

export default OrderItemSelector;
