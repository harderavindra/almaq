// controllers/chalaanController.js

import Challan from "../models/challan.model.js"
import Order from "../models/order.model.js"; // Optional: If you want to update Order status

export const createChallan = async (req, res) => {
  try {
    const { vehicleId, challanDate, departmentOrderId, items } = req.body;
    // console.log("Request body:", req.body);

    if (!vehicleId || !challanDate || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const challanItems = items.map((item) => ({
      farmer: item.farmerId,
      itemReferenceNumber: item.itemReferenceNumber,
      status: "InProgress",
      overallDeliveryStatus: "Fully Delivered",
      plants: [
        {
          plantType: item.plantTypeId,
          quantity: item.quantity,
          amount: item.amount,
          deliveredQuantity: item.deliveredQuantity,
          deliveryStatus: item.deliveryStatus || "Delivered",
          deliveredAt: item.deliveredAt || new Date(),
          returnReason: item.returnReason || "",
        },
      ],
    }));

    const newChallan = new Challan({
      vehicleId,
      challanDate: new Date(challanDate),
      items: challanItems,
      deliveryLog: [
        {
          status: "Packed",
          remarks: "Challan created and ready for dispatch",
        },
      ],
    });

    await newChallan.save();

    // Optional: Update the related department order status
    // await DepartmentOrder.findByIdAndUpdate(departmentOrderId, { status: 'InProgress' });

    res.status(201).json({ message: "Challan created successfully", challan: newChallan });
  } catch (error) {
    console.error("Error creating challan:", error);
    res.status(500).json({ message: "Failed to create challan", error });
  }
};

// Get all challans
export const getAllChallans = async (req, res) => {
  try {
    const challans = await Challan.find()
      .populate({
        path: 'items.farmer',
        model: 'Farmer', // replace with your actual model name if different
        select: 'name contactNumber'
      })
      .populate({
        path: 'items.plants.plantType',
        model: 'PlantType', // replace with your actual model name
        select: 'name category'
      })
      .populate({
        path: 'vehicleId',
        model: 'Vehicle',
        select: 'vehicleNumber driverName' 
      });

    res.json(challans);
    console.log("Challans fetched:", challans);
  } catch (error) {
    console.error('Error fetching challans:', error);
    res.status(500).json({ error: 'Failed to fetch challans' });
  }
};

// Get challan by ID
export const getChallanById = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("Challan ID:", id);
    const challan = await Challan.findById(id)
    
    .populate("items.farmer", "name")          // Replace "name" with the field you want (e.g., fullName)
   
console.log("Challan fetched:", challan);
  if (!challan) {
    return res.status(404).json({ message: 'Challan not found' });
  }

  res.status(200).json(challan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch challan' });
  }
};

export const deleteChallan = async (req, res) => {
  try {
    const deleted = await Challan.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Challan not found' });
    res.json({ message: 'Challan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete challan' });
  }
};