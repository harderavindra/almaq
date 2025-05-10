import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import InputText from '../components/common/InputText';
import Button from '../components/common/Button';

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
    items: [
      {
        farmer: '',
        plants: [
          { plantType: '', quantity: '', amount: '', status: 'Pending' }
        ]
      }
    ]
  });

  useEffect(() => {
    const fetchData = async () => {
      const [deptRes, farmerRes, plantRes] = await Promise.all([
        api.get('/departments'),
        api.get('/farmers'),
        api.get('/plants'),
      ]);
      setDepartments(deptRes.data);
      setFarmers(farmerRes.data);
      setPlants(plantRes.data);
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFarmerChange = (index, e) => {
    const newItems = [...form.items];
    newItems[index].farmer = e.target.value;
    setForm({ ...form, items: newItems });
  };

  const handlePlantChange = (farmerIndex, plantIndex, e) => {
    const { name, value } = e.target;
    const updatedItems = [...form.items];
    const plantItem = updatedItems[farmerIndex].plants[plantIndex];

    plantItem[name] = value;

    if ((name === 'plantType' || name === 'quantity') && plantItem.plantType && plantItem.quantity) {
      const plant = plants.find(p => p._id === plantItem.plantType);
      const qty = parseFloat(plantItem.quantity);
      if (plant && !isNaN(qty)) {
        plantItem.amount = plant.price * qty;
      }
    }

    setForm({ ...form, items: updatedItems });
  };

  const addFarmer = () => {
    setForm({
      ...form,
      items: [
        ...form.items,
        {
          farmer: '',
          plants: [{ plantType: '', quantity: '', amount: '', status: 'Pending' }]
        }
      ]
    });
  };

  const removeFarmer = (index) => {
    const updatedItems = form.items.filter((_, i) => i !== index);
    setForm({ ...form, items: updatedItems });
  };

  const addPlantToFarmer = (index) => {
    const updatedItems = [...form.items];
    updatedItems[index].plants.push({ plantType: '', quantity: '', amount: '', status: 'Pending' });
    setForm({ ...form, items: updatedItems });
  };

  const removePlantFromFarmer = (farmerIndex, plantIndex) => {
    const updatedItems = [...form.items];
    updatedItems[farmerIndex].plants = updatedItems[farmerIndex].plants.filter((_, i) => i !== plantIndex);
    setForm({ ...form, items: updatedItems });
  };

  const isFormValid = () => {
    if (!form.department || !form.orderLetterNumber || !form.orderDate || !form.contactPerson || !form.contactNumber) {
      return false;
    }

    for (const f of form.items) {
      if (!f.farmer) return false;
      for (const p of f.plants) {
        if (!p.plantType || !p.quantity) return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      alert('Please complete all required fields');
      return;
    }

    try {
      await api.post('/orders', form);
      console.log('Order created successfully',form);
      return;
      alert('Order created successfully!');
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert('Failed to create order');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Order</h2>

      <label className="block mb-2 font-medium">Department</label>
      <select
        name="department"
        value={form.department}
        onChange={handleChange}
        className="border rounded-md w-full px-3 py-2 mb-4"
      >
        <option value="">Select Department</option>
        {departments.map(dept => (
          <option key={dept._id} value={dept._id}>{dept.name}</option>
        ))}
      </select>

      <InputText label="Order Letter Number" name="orderLetterNumber" value={form.orderLetterNumber} handleOnChange={handleChange} />
      <label className="block mb-1 mt-4">Order Date</label>
      <input
        type="date"
        name="orderDate"
        value={form.orderDate}
        onChange={handleChange}
        className="border rounded-md w-full px-3 py-2 mb-4"
      />
      <InputText label="Contact Person" name="contactPerson" value={form.contactPerson} handleOnChange={handleChange} />
      <InputText label="Contact Number" name="contactNumber" type="number" value={form.contactNumber} handleOnChange={handleChange} />

      {form.items.map((f, fi) => (
        <div key={fi} className="border p-4 my-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Farmer {fi + 1}</h3>
            {form.items.length > 1 && (
              <button type="button" className="text-red-600 text-sm" onClick={() => removeFarmer(fi)}>Remove</button>
            )}
          </div>

          <label className="block mb-1">Select Farmer</label>
          <select
            value={f.farmer}
            onChange={(e) => handleFarmerChange(fi, e)}
            className="border rounded-md w-full px-3 py-2 mb-4"
          >
            <option value="">Select Farmer</option>
            {farmers.map(farmer => (
              <option key={farmer._id} value={farmer._id}>{farmer.name}</option>
            ))}
          </select>

          {f.plants.map((plant, pi) => (
            <div key={pi} className="bg-white border p-3 rounded mb-3">
              <label className="block mb-1">Plant Type</label>
              <select
                name="plantType"
                value={plant.plantType}
                onChange={(e) => handlePlantChange(fi, pi, e)}
                className="border rounded-md w-full px-3 py-2 mb-2"
              >
                <option value="">Select Plant Type</option>
                {plants.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>

              <InputText
                label="Quantity"
                name="quantity"
                type="number"
                value={plant.quantity}
                handleOnChange={(e) => handlePlantChange(fi, pi, e)}
              />

              <InputText
                label="Amount"
                name="amount"
                value={plant.amount}
                disabled
                handleOnChange={() => {}}
              />

              {f.plants.length > 1 && (
                <button type="button" className="text-red-500 text-sm mt-1" onClick={() => removePlantFromFarmer(fi, pi)}>Remove Plant</button>
              )}
            </div>
          ))}

          <button type="button" className="text-blue-600 text-sm" onClick={() => addPlantToFarmer(fi)}>+ Add Plant</button>
        </div>
      ))}

      <button type="button" onClick={addFarmer} className="text-blue-700 font-medium mb-4">
        + Add Farmer
      </button>

      <Button type="submit" disabled={!isFormValid()}>
        Submit Order
      </Button>
    </form>
  );
};

export default OrderCreatePage;
