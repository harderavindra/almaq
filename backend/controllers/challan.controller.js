import mongoose from 'mongoose';
// controllers/challan.controller.js
import Challan from '../models/Challan.js';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

import OrderItem from '../models/OrderItem.js';
import Vehicle from '../models/Vehicle.js';

export const createChallan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  console.log("Challan creation request body:", req.body);
  try {
    const { vehicleId, challanNo, dispatchDate, routeDetails, note, items } = req.body;

    // Step 1: Create Challan
    const challan = new Challan({
      vehicleId,
      challanNo,
      dispatchDate,
      note,
      routeDetails,
      items,
    });

    await challan.save({ session });

    // Step 2: Update each order item
    for (const item of items) {
      const { orderItemId, quantity } = item;

      const orderItem = await OrderItem.findById(orderItemId).session(session);
      if (!orderItem) throw new Error(`OrderItem ${orderItemId} not found`);

      // Update delivered quantity and challan reference
      const qty = Number(quantity);
      // orderItem.deliveredQuantity += qty;
      orderItem.challanIds.push(challan._id);

      // // Optional: Mark as Delivered if fully delivered
      // if (orderItem.deliveredQuantity >= orderItem.quantity) {
      //   orderItem.status = 'Delivered';
      // }

      await orderItem.save({ session });
    }

    // Step 3: Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Challan created successfully', challan });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const getChallanById = async (req, res) => {
  try {
    const { id } = req.params;
    const challanBase = await Challan.findById(id);
    const challan = await Challan.findById(id)
      .populate('vehicleId', 'transportName vehicleNumber driverName driverContact')
      .populate({
        path: 'items.orderItemId',
        populate: [
          { path: 'farmerId', select: 'name contact' },
          { path: 'plantTypeId', select: 'name' },
          { path: 'orderId', select: 'orderRefNo orderDate' }
        ]
      });
    // console.log("Challan ID:", id);
    // console.log("Challan challanBase:", challanBase);

    if (!challan) {
      return res.status(404).json({ message: 'Challan not found' });
    }
    // console.log("Challan details:", challan);

    res.status(200).json(challan);
  } catch (error) {
    console.error('Error fetching challan by ID:', error);
    res.status(500).json({ message: 'Failed to retrieve challan' });
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
        populate: {
          path: 'farmerId plantTypeId',
          select: 'name',
        },
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
    console.log("Item:", item);
    if (item.status === 'Delivered') {
      return res.status(400).json({ message: 'Item already marked as Delivered' });
    }

    console.log("Item:", item);
    const orderItem = await OrderItem.findById(item.orderItemId);
    if (!orderItem) {
      return res.status(404).json({ message: 'Associated order item not found' });
    }
console.log("Order Item:", orderItem);
    const updatedDeliveredQty = (orderItem.deliveredQuantity || 0) + item.quantity;
    const cappedDeliveredQty = Math.min(updatedDeliveredQty, orderItem.quantity);

    let newStatus = 'Pending';
    if (cappedDeliveredQty === orderItem.quantity) {
      newStatus = 'Delivered';
    } else if (cappedDeliveredQty > 0) {
      newStatus = 'Partially Delivered';
    }
console.log("Capped Delivered Quantity:", cappedDeliveredQty);
    await OrderItem.findByIdAndUpdate(item.orderItemId, {
      deliveredQuantity: cappedDeliveredQty,
      status: newStatus,
    });
console.log("Order Item Updated:", orderItem);
    item.status = 'Delivered';
    await challan.save();

    return res.status(200).json({ message: 'Challan item marked as Delivered', challan });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update delivery status', error: err.message });
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