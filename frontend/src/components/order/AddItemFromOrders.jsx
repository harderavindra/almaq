import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Pagination from "../Pagination";

const AddItemFromOrders = ({ onAddItems }) => {
  const [orders, setOrders] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [totalCount, setTotalCount] = useState(0);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/getOrders", {
        params: {
          search: searchTerm,
          page: currentPage,
          limit: itemsPerPage,
        },
      });
      console.log("Fetched Orders:", res.data);
      setOrders(res.data.orders || []);
      setTotalCount(res.data.total || 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchTerm, currentPage]);

  const toggleItem = (orderId, item, plant) => {
    const refKey = `${orderId}-${item._id}-${plant._id}`;
    const exists = selectedItems.some((i) => i._refKey === refKey);
    if (exists) {
      setSelectedItems((prev) => prev.filter((i) => i._refKey !== refKey));
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          ...plant,
          _refKey: refKey,
          deliveredQuantity: plant.quantity || 0,
          deliveryStatus: "Delivered",
          deliveredAt: new Date().toISOString(),
          returnReason: "",
          orderId,
          itemId: item._id,
          farmer: item.farmer?._id || item.farmer, // ✅ FIXED
        },
      ]);
    }
  };

  const handleAddItems = () => {
    const groupedByFarmer = {};

    selectedItems.forEach((item) => {
      const {
        farmer,
        plantType,
        quantity,
        amount,
        deliveredQuantity,
        deliveryStatus,
        deliveredAt,
        returnReason,
      } = item;

      if (!groupedByFarmer[farmer]) {
        groupedByFarmer[farmer] = {
          farmer,
          plants: [],
        };
      }

      groupedByFarmer[farmer].plants.push({
        plantType,
        quantity,
        amount,
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
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4">Select Plants from Orders</h3>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by farmer name or order letter"
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
          <div
            key={order._id}
            className="border border-gray-300 p-4 rounded mb-4"
          >
            <strong className="block mb-2">
              Order #{order.orderLetterNumber} | Department:{" "}
              {order.department?.name || "N/A"} | Date:{" "}
              {new Date(order.orderDate).toLocaleDateString()}
            </strong>

            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item._id} className="ml-4 mb-2">
                  <div className="font-medium text-gray-700 mb-1">
                    Farmer: {item.farmerName || "N/A"} | Ref:{" "}
                    {item.itemReferenceNumber}
                  </div>

                  <ul className="ml-4 space-y-1">
                    {item.plants && item.plants.length > 0 ? (
                      item.plants.map((plant) => {
                        const refKey = `${order._id}-${item._id}-${plant._id}`;
                        const checked = selectedItems.some(
                          (i) => i._refKey === refKey
                        );
                        return (
                          <li key={refKey}>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  toggleItem(order._id, item, plant)
                                }
                              />
                              {plant.plantType?.name || "Plant"} - Qty:{" "}
                              {plant.quantity} - ₹{plant.amount}
                            </label>
                          </li>
                        );
                      })
                    ) : (
                      <li className="text-sm text-gray-400">
                        No plants in this item.
                      </li>
                    )}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">No items in this order.</p>
            )}
          </div>
        ))
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <button
        type="button"
        onClick={handleAddItems}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4 disabled:opacity-50"
        disabled={selectedItems.length === 0}
      >
        + Add{" "}
        {selectedItems.length > 0
          ? `${selectedItems.length} Selected Plant(s)`
          : "Selected Plants"}
      </button>
    </div>
  );
};

export default AddItemFromOrders;
