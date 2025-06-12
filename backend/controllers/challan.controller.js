import mongoose from 'mongoose';
// controllers/challan.controller.js
import Challan from '../models/Challan.js';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

import OrderItem from '../models/OrderItem.js';
import Vehicle from '../models/Vehicle.js';

export const createChallan = async (req, res) => {
  try {
    const { vehicleId, challanNo, dispatchDate, routeDetails, note } = req.body;


    const challan = new Challan({
      vehicleId,
      challanNo,
      dispatchDate,
      note,
      routeDetails,
      items: [],
    });

    await challan.save();
    console.log(req.body)

    res.status(201).json({ message: 'Challan created successfully', challan });
  } catch (error) {
    console.error("Error creating empty challan:", error);
    res.status(500).json({ message: 'Failed to create challan' });
  }
};

export const addItemsToChallan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { challanId, items } = req.body;

    const challan = await Challan.findById(challanId).session(session);
    if (!challan) {
      throw new Error('Challan not found');
    }

    for (const { orderItemId, challanQuantity } of items) {
      const orderItem = await OrderItem.findById(orderItemId).session(session);
      if (!orderItem) throw new Error(`OrderItem ${orderItemId} not found`);

      // Push challan ID to order item if not already present
      if (!orderItem.challanIds.includes(challan._id)) {
        orderItem.challanIds.push(challan._id);
        await orderItem.save({ session });
      }

      // Check if the orderItemId already exists in the challan
      const existingItem = challan.items.find(item =>
        item.orderItemId.toString() === orderItemId
      );

      if (existingItem) {
        // Update existing item's quantity
        existingItem.challanQuantity += challanQuantity;
      } else {
        // Add new item
        challan.items.push({ orderItemId, challanQuantity });
      }
    }

    await challan.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'Items added/updated in challan successfully',
      challan
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error adding items to challan:', error);
    res.status(500).json({ message: 'Failed to add items to challan' });
  }
};

export const getChallanById = async (req, res) => {
   try {
    const { id } = req.params;

    const challan = await Challan.findById(id)
      .populate('vehicleId')
     .populate({
        path: 'items.orderItemId',
        populate: [
          { path: 'farmerId', select: 'firstName lastName' }, // Adjust fields as needed
          { path: 'plantTypeId', select: 'name variety' }
        ]
      })
      .lean();

    if (!challan) {
      return res.status(404).json({ success: false, message: 'Challan not found' });
    }

    // Calculate total challan quantity
    const totalChallanQuantity = challan.items.reduce((sum, item) => {
      return sum + item.challanQuantity;
    }, 0);

    return res.json({
      success: true,
      data: {
        ...challan,
        items: challan.items.map(item => ({
          orderItemId: item.orderItemId?._id || item.orderItemId,
          farmer: item.orderItemId?.farmerId || null,
          plantType: item.orderItemId?.plantTypeId || null,
          challanQuantity: item.challanQuantity,
          status: item.status,
          quantity:item.orderItemId?.quantity
          
        })),
        totalChallanQuantity
      }
    });
  } catch (err) {
    console.error('Error fetching challan:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllChallans = async (req, res) => {
  try {
    const challans = await Challan.find()
      .populate({
        path: 'vehicleId',
        select: 'transportName vehicleNumber driverName driverContact',
      })
      .populate({
        path: 'items.orderItemId',
        populate: [
          { path: 'farmerId', select: 'firstName  lastNamecontact' },
          { path: 'plantTypeId', select: 'name' },
          { path: 'orderId', select: 'orderRefNo orderDate' }
        ]
      })
      .sort({ createdAt: -1 }); // Optional: latest first

    res.status(200).json(challans);
  } catch (err) {
    console.error('Error fetching challans:', err);
    res.status(500).json({ message: 'Failed to fetch challans' });
  }
};

export const deleteChallan = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedChallan = await Challan.findByIdAndDelete(id);

    if (!deletedChallan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    return res.status(200).json({ message: 'Challan deleted successfully', deletedChallan });
  } catch (error) {
    console.error('Error deleting challan:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const updateChallanItemDeliveryStatus = async (req, res) => {
  try {
    const { challanId, itemId } = req.params;

    const challan = await Challan.findById(challanId);
    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    const item = challan.items.find(i => i.orderItemId.toString() === itemId);
    if (!item) {
      return res.status(404).json({ message: 'Challan item not found' });
    }

    if (item.status === 'Delivered') {
      return res.status(400).json({ message: 'Item already marked as Delivered' });
    }

    const orderItem = await OrderItem.findById(item.orderItemId);
    if (!orderItem) {
      return res.status(404).json({ message: 'Associated order item not found' });
    }

    // ✅ Correct property: item.challanQuantity instead of item.quantity
    const updatedDeliveredQty = (orderItem.deliveredQuantity || 0) + item.challanQuantity;
    const cappedDeliveredQty = Math.min(updatedDeliveredQty, orderItem.quantity);

    let newStatus = 'Pending';
    if (cappedDeliveredQty === orderItem.quantity) {
      newStatus = 'Delivered';
    } else if (cappedDeliveredQty > 0) {
      newStatus = 'Partially Delivered';
    }

    await OrderItem.findByIdAndUpdate(item.orderItemId, {
      deliveredQuantity: cappedDeliveredQty,
      status: newStatus,
    });

    item.status = 'Delivered';
    await challan.save();

    return res.status(200).json({
      message: 'Challan item marked as Delivered',
      challan,
    });
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to update delivery status',
      error: err.message,
    });
  }
};


export const getDeliveredChallanItems = async (req, res) => {
  try {
    const challans = await Challan.find({ 'items.status': 'Delivered' })
      .populate('vehicleId')
      .lean();

    const grouped = new Map();

    for (const challan of challans) {
      for (const item of challan.items) {
        if (item.status !== 'Delivered') continue;

        const orderItem = await OrderItem.findById(item.orderItemId)
          .populate('farmerId')
          .populate('plantTypeId')
          .lean();

        if (!orderItem || !orderItem.farmerId || !orderItem.plantTypeId) continue;

        const key = `${challan._id}_${orderItem.farmerId._id}`;

        if (!grouped.has(key)) {
          grouped.set(key, {
            uniqueId: uuidv4(),
            challanId: challan._id,
            challanNo: challan.challanNo,
            dispatchDate: challan.dispatchDate,
            vehicle: challan.vehicleId?.vehicleNumber || challan.vehicleId?.number || 'Unknown',
            farmerId: orderItem.farmerId._id,
            farmerName: orderItem.farmerId.name,
            farmerAddress: orderItem.farmerId.address,
            items: [],
            totalPrice: 0
          });
        }

        const group = grouped.get(key);
        const price = item.quantity * orderItem.pricePerUnit;

        group.items.push({
          plantType: orderItem.plantTypeId.name,
          pricePerUnit: orderItem.pricePerUnit,
          quantity: item.quantity,
          price
        });

        group.totalPrice += price;
      }
    }
    console.log("Grouped Delivered Items:", Array.from(grouped.values()));
    res.json({ items: Array.from(grouped.values()) });
  } catch (error) {
    console.error('Error fetching delivered challan items:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};