import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Pagination from "../Pagination";

const AddItemFromOrders = ({onClose, onAddItems }) => {
  const [orders, setOrders] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalCount, setTotalCount] = useState(0);

  const fetchOrdersWithItems = async () => {
    try {
      const res = await api.get("/orders/with-items", {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      setOrders(res.data.orders || []);
      setTotalCount(res.data.totalOrders || 0);
    } catch (error) {
      console.error("Error fetching orders with items:", error);
    }
  };

  useEffect(() => {
    fetchOrdersWithItems();
  }, [searchTerm, currentPage]);

  const toggleItem = (orderItem) => {
    const exists = selectedItems.some((i) => i._id === orderItem._id);
    if (exists) {
      setSelectedItems((prev) => prev.filter((i) => i._id !== orderItem._id));
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          ...orderItem,
          deliveredQuantity: orderItem.quantity,
          deliveryStatus: "Delivered",
          deliveredAt: new Date().toISOString(),
          returnReason: "",
        },
      ]);
    }
  };

  const handleAddItems = () => {
    console.log("Selected items to add:", selectedItems); 
    const groupedByFarmer = {};

    selectedItems.forEach((item) => {
      const { farmerId, plantTypeId, quantity, pricePerUnit, deliveredQuantity, deliveryStatus, deliveredAt, returnReason } = item;

      const farmerKey = farmerId?._id || farmerId;

      if (!groupedByFarmer[farmerKey]) {
        groupedByFarmer[farmerKey] = {
          farmer: farmerId,
          plants: [],
        };
      }

      groupedByFarmer[farmerKey].plants.push({
        plantType: plantTypeId,
        quantity,
        amount: pricePerUnit,
        deliveredQuantity,
        deliveryStatus,
        deliveredAt,
        returnReason,
      });
    });

    const preparedItems = Object.values(groupedByFarmer);
    onAddItems(preparedItems);
    setSelectedItems([]);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="fixed max-h-full p-10 overflow-scroll inset-0 bg-black bg-opacity-40 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl relative mx-auto">
      <button
        onClick={onClose}
        className=" top-2 right-2 text-gray-600 hover:text-red-600 text-lg"
      >
        &times;
      </button>
      <h3 className="text-lg font-semibold mb-4">Select Plants from Orders</h3>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by order ref no"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full p-2 border border-gray-300 rounded-md pr-10"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-2 top-2 text-gray-400 hover:text-black"
          >
            ✕
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <p className="text-gray-500">No matching orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className="border border-gray-300 p-4 rounded mb-4">
            <strong className="block mb-2">
              Order #{order.orderRefNo} | Department: {order.departmentId?.name || "N/A"} | Date:{" "}
              {new Date(order.date).toLocaleDateString()}
            </strong>

            {order.items?.length === 0 ? (
              <p className="text-sm text-gray-400">No items for this order.</p>
            ) : (
              order.items.map((item) => {
                const checked = selectedItems.some((i) => i._id === item._id);
                return (
                  <div key={item._id} className="ml-4 mb-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItem(item)}
                      />
                      Farmer: {item.farmerId?.name || "N/A"} - {item.plantTypeId?.name || "Plant"} - Qty:{" "}
                      {item.quantity} - ₹{item.pricePerUnit}
                    </label>
                  </div>
                );
              })
            )}
          </div>
        ))
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <button
        type="button"
        onClick={handleAddItems}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4 disabled:opacity-50"
        disabled={selectedItems.length === 0}
      >
        + Add{" "}
        {selectedItems.length > 0 ? `${selectedItems.length} Selected Plant(s)` : "Selected Plants"}
      </button>
    </div>
    </div>
  );
};

export default AddItemFromOrders;
