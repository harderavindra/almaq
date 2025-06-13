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
    const { page = 1, limit = 10 } = req.query;

    const challan = await Challan.findById(id)
      .populate('vehicleId')
      .populate({
        path: 'items.orderItemId',
        populate: [
          { path: 'farmerId', select: 'firstName lastName' }, // Adjust fields as needed
          { path: 'plantTypeId', select: 'name ratePerUnit' }
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

    const uniqueFarmerIds = new Set(
      challan.items.map(item => item.orderItemId?.farmerId?._id?.toString() || item.orderItemId?.farmerId?.toString())
    );
    const totalFarmers = uniqueFarmerIds.size;

    const totalAmount = challan.items.reduce((sum, item) => {
      const price = item.orderItemId?.pricePerUnit || 0;
      return sum + item.challanQuantity * price;
    }, 0);

    // Pagination logic
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit, 10);

    const paginatedItems = challan.items.slice(startIndex, endIndex).map(item => ({
      orderItemId: item.orderItemId?._id || item.orderItemId,
      farmer: item.orderItemId?.farmerId || null,
      plantType: item.orderItemId?.plantTypeId || null,
      challanQuantity: item.challanQuantity,
      status: item.status,
      quantity: item.orderItemId?.quantity,
      pricePerUnit: item.orderItemId?.pricePerUnit || 0,
    }));

    return res.json({
      success: true,
      data: {
        ...challan,
        items: paginatedItems,
        totalChallanQuantity,
        totalFarmers,
        totalAmount,
         pagination: {
          totalItems: challan.items.length,
          currentPage: parseInt(page),
          totalPages: Math.ceil(challan.items.length / limit),
          perPage: parseInt(limit),
        }
      }
    });
  } catch (err) {
    console.error('Error fetching challan:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllChallans = async (req, res) => {
  try {

       const { status } = req.query;
    const query = status ? { status } : {};
    const challans = await Challan.find(query)
      .populate({
        path: 'vehicleId',
        select: 'transportName vehicleNumber driverName driverContact',
      })
      .populate({
        path: 'items.orderItemId',
        select: 'farmerId quantity pricePerUnit',
      })
      .sort({ createdAt: -1 });

    const enrichedChallans = challans.map((challan) => {
      const summary = {
        totalFarmers: new Set(), // Use Set to ensure uniqueness
        totalQuantity: 0,
        totalPrice: 0,
      };

      challan.items.forEach(({ orderItemId, challanQuantity }) => {
        if (!orderItemId) return;

        summary.totalQuantity += challanQuantity;
        summary.totalPrice += challanQuantity * (orderItemId.pricePerUnit || 0);

        if (orderItemId.farmerId) {
          summary.totalFarmers.add(orderItemId.farmerId.toString());
        }
      });

      return {
        ...challan.toObject(),
        summary: {
          totalFarmers: summary.totalFarmers.size,
          totalQuantity: summary.totalQuantity,
          totalPrice: summary.totalPrice,
        },
      };
    });

    res.status(200).json(enrichedChallans);
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


export const updateChallanStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Draft', 'Issued', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedChallan = await Challan.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedChallan) {
      return res.status(404).json({ message: 'Challan not found' });
    }

    res.status(200).json(updatedChallan);
  } catch (err) {
    console.error('Failed to update challan status:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const getChallanStatusCounts = async (req, res) => {
  try {
    const statuses = ['Draft', 'Issued', "Delivered", "Cancelled"];
    const counts = {};

    for (const status of statuses) {
      counts[status] = await Challan.countDocuments({ status });
    }

    res.json(counts);
  } catch (err) {
    console.error('Error fetching challan status counts:', err);
    res.status(500).json({ error: 'Failed to fetch challan status counts' });
  }
};