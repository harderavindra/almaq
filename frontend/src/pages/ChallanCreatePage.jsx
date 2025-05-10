import React, { useState, useEffect } from "react";
import api from "../api/axios";
import AddItemFromOrders from "../components/order/AddItemFromOrders";
import { FiPlus, FiTruck } from "react-icons/fi";
import Button from "../components/common/Button";

const ChallanCreatePage = () => {
  const [vehicleId, setVehicleId] = useState("");
  const [challanDate, setChallanDate] = useState("");
  const [items, setItems] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [showAddItemPopup, setShowAddItemPopup] = useState(false);

  useEffect(() => {
    api.get("/master/vehicle").then((res) => {
      setVehicles(res.data || []);
    });
  }, []);

  const handleRemoveItem = (indexToRemove) => {
    setItems((prevItems) => prevItems.filter((_, index) => index !== indexToRemove));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleAddItems = (newItems) => {
    console.log("New Items:", newItems);
    const updatedItems = newItems.map((item) => ({
      ...item,
      deliveredQuantity: item.quantity || 0,
    }));
    setItems((prev) => [...prev, ...updatedItems]);
    setShowAddItemPopup(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if all required fields are filled
    if (!vehicleId || !challanDate || items.length === 0) {
      setError(true);
      setMessage("Please fill all required fields and add at least one item.");
      return;
    }
  
    // Log the items array to check if departmentOrderId is present
    console.log("Items array:", items);
  
    // Extract departmentOrderId (assuming it's consistent in all items)
    const departmentOrderId = items[0]?.departmentOrderId;
    console.log("Department Order ID:", departmentOrderId);
  
    // Format the items to ensure all data is structured correctly
    const formattedItems = items.map((item) => ({
      farmer: item.farmerId || item.farmer,
      deliveredQuantity: Number(item.deliveredQuantity),
      deliveryStatus: item.deliveryStatus || "Delivered",
      deliveredAt: new Date().toISOString(),
      returnReason: item.returnReason || "",
      plants: [
        {
          plantType: item.plantType,
          quantity: Number(item.quantity),  // NOT deliveredQuantity
          amount: Number(item.amount),
        },
      ],
    }));
  
    console.log("Sending payload:", {
      vehicleId,
      challanDate,
      items: formattedItems,
    });
  
    try {
      // Make the POST request to create the challan
      await api.post("/challans/create", {
        vehicleId,
        challanDate,
        items: formattedItems,
      });
  
      // Handle successful submission
      setError(false);
      setMessage("Challan created successfully.");
      setVehicleId("");
      setChallanDate("");
      setItems([]);
    } catch (err) {
      // Handle any errors
      console.error(err);
      setError(true);
      setMessage("Error creating challan.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full px-10 gap-10 py-10">
      <div className="w-52 h-full p-4">
        <h3 className="text-lg font-bold mb-4">Order Status</h3>
        <ul className="space-y-2">
          <li className="cursor-pointer px-5 py-2 rounded-full flex gap-4 items-center">
            <FiPlus />
            Add Challan
          </li>
          <li className="cursor-pointer px-5 py-2 rounded-full flex gap-4 items-center bg-blue-500 text-white">
            <FiTruck /> Challans
          </li>
        </ul>
      </div>

      <div className="px-18 py-10 w-full flex-1 flex flex-col bg-white rounded-4xl">
        <h2 className="text-3xl font-bold mb-4">Create Challan</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex mb-4 gap-10">
            <div className="flex flex-col w-full">
              <label className="pb-2 font-semibold">Vehicle</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="border border-gray-300 p-2 mb-4 rounded-lg"
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.transportName} - {v.vehicleNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col w-full">
              <label className="pb-2 font-semibold">Challan Date</label>
              <input
                type="date"
                className="border border-gray-300 p-2 mb-4 rounded-lg"
                value={challanDate}
                onChange={(e) => setChallanDate(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddItemPopup(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Item
          </button>

          {showAddItemPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white max-h-[90vh] overflow-y-auto w-full max-w-3xl rounded-lg shadow-lg p-6 relative">
                <button
                  className="absolute top-3 right-3 text-gray-600 hover:text-black"
                  onClick={() => setShowAddItemPopup(false)}
                >
                  ✕
                </button>
                <AddItemFromOrders onAddItems={handleAddItems} />
              </div>
            </div>
          )}

          <h3 className="mt-6 font-semibold text-lg">Items</h3>
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 border border-gray-300 rounded-xl p-4 mb-2 flex-wrap items-center">
              <div className="font-bold">{index + 1}.</div>
              <div>{item.farmerName || item.farmer}</div>
              <div>{item.plantType}</div>
              <div>Qty: {item.quantity}</div>
              <div>Amount: ₹{item.amount}</div>
              <div>{item.itemReferenceNumber || "N/A"}</div>
              <div>
                <label className="text-sm block">Delivered Qty</label>
                <input
                  type="number"
                  className="border border-gray-300 p-2 rounded-lg w-24"
                  value={item.deliveredQuantity}
                  onChange={(e) => handleItemChange(index, "deliveredQuantity", e.target.value)}
                  min={0}
                  max={item.quantity}
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                className="text-red-600 font-semibold hover:underline ml-auto"
              >
                Remove
              </button>
            </div>
          ))}

          <Button type="submit" className="mt-4">
            Submit Challan
          </Button>
        </form>

        {message && (
          <p className={`mt-4 font-semibold ${error ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChallanCreatePage;
