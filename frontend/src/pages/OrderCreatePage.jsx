import React, { useState, useEffect } from 'react';
import { createOrder } from '../services/orderService';
import InputText from '../components/common/InputText';
import Button from '../components/common/Button';
import api from '../api/axios'; // Adjust the import based on your axios setup
const OrderCreatePage = () => {
    const [departments, setDepartments] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [plants, setPlants] = useState([]);
  const [form, setForm] = useState({
    department: '',
    orderLetterNumber: '',
    orderDate: '',
    contactPerson: '',
    contactNumber: '',
    status: 'Draft',
    items: [{ farmer: '', plantType: '', quantity: '', amount: '', status: 'Pending' }],
  });

  // Fetch master data
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [deptRes, farmerRes, plantRes] = await Promise.all([
          api.get('/departments'),
          api.get('/farmers'),
          api.get('/plants'),
        ]);
        setDepartments(deptRes.data);
        setFarmers(farmerRes.data);
        setPlants(plantRes.data);
        console.log(deptRes.data, farmerRes.data, plantRes.data);
      } catch (err) {
        console.error('Error fetching masters:', err);
      }
    };
    fetchMasters();
  }, []);

  // Handle form field change
  const handleDepartmentChange = (e) => {
    setForm({ ...form, department: e.target.value });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...form.items];
    items[index][name] = value;

    // Calculate amount if plantType and quantity are provided
    if (name === 'plantType' || name === 'quantity') {
      const plant = plants.find(p => p._id === items[index].plantType);
      if (plant && items[index].quantity) {
        const amount = plant.price * items[index].quantity;
        items[index].amount = amount;
      }
    }

    setForm({ ...form, items });
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { farmer: '', plantType: '', quantity: '', amount: '', status: 'Pending' }]
    });
  };

  const removeItem = (index) => {
    const items = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/orders', form);
      alert('Order created successfully!');
      // reset form
      setForm({
        department: '',
        orderLetterNumber: '',
        orderDate: '',
        contactPerson: '',
        contactNumber: '',
        status: 'Draft',
        items: [{ farmer: '', plantType: '', quantity: '', amount: '', status: 'Pending' }]
      });    } catch (err) {
      console.error('Failed to create order:', err);
      alert('Error creating order.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Create New Order</h2>

      <label className="block mb-2 font-medium">Department</label>
      <select
        name="department"
        value={form.department}
        onChange={handleDepartmentChange}
        className="border rounded-md w-full px-3 py-2 mb-4"
      >
        <option value="">Select Department</option>
        {departments.map(dept => (
          <option key={dept._id} value={dept._id}>{dept.name}</option>
        ))}
      </select>
      <InputText
  label="Order Letter Number"
  name="orderLetterNumber"
  value={form.orderLetterNumber}
  handleOnChange={(e) => setForm({ ...form, orderLetterNumber: e.target.value })}
/>

<label className="block mb-1 mt-4">Order Date</label>
<input
  type="date"
  name="orderDate"
  value={form.orderDate}
  onChange={(e) => setForm({ ...form, orderDate: e.target.value })}
  className="border rounded-md w-full px-3 py-2 mb-4"
/>

<InputText
  label="Contact Person"
  name="contactPerson"
  value={form.contactPerson}
  handleOnChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
/>

<InputText
  label="Contact Number"
  name="contactNumber"
  value={form.contactNumber}
  handleOnChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
/>

      {form.items.map((item, idx) => (
        <div key={idx} className="mb-4 border p-4 rounded">
          <div className="flex justify-between mb-2">
            <h3 className="font-semibold">Item {idx + 1}</h3>
            {form.items.length > 1 && (
              <button type="button" onClick={() => removeItem(idx)} className="text-red-500">Remove</button>
            )}
          </div>

          <label className="block mb-1">Farmer</label>
          <select
            name="farmer"
            value={item.farmer}
            onChange={e => handleItemChange(idx, e)}
            className="border rounded-md w-full px-3 py-2 mb-2"
          >
            <option value="">Select Farmer</option>
            {farmers.map(f => (
              <option key={f._id} value={f._id}>{f.name}</option>
            ))}
          </select>

          <label className="block mb-1">Plant Type</label>
          <select
            name="plantType"
            value={item.plantType}
            onChange={e => handleItemChange(idx, e)}
            className="border rounded-md w-full px-3 py-2 mb-2"
          >
            <option value="">Select Plant Type</option>
            {plants.map(p => (
              <option key={p._id} value={p._id}>{p.type}</option>
            ))}
          </select>

          <InputText
            label="Quantity"
            name="quantity"
            value={item.quantity}
            handleOnChange={e => handleItemChange(idx, e)}
          />

          <InputText
            label="Amount"
            name="amount"
            value={item.amount}
            handleOnChange={e => handleItemChange(idx, e)}
            disabled
          />
        </div>
      ))}

      <button type="button" onClick={addItem} className="mb-4 text-blue-600">+ Add Item</button>

      <Button type="submit">Submit Order</Button>
    </form>
  );
};

export default OrderCreatePage;
