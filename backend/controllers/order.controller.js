import Order from '../models/order.model.js'; // Adjust the path as necessary
import mongoose from 'mongoose'; // Import mongoose for ObjectId type checking


export const getOrders = async (req, res) => {
  try {
    // Destructure query parameters
    const { search = '', page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit; // Calculate the number of orders to skip for pagination
    const limitParsed = parseInt(limit, 10);

    // Build the search query
    const searchQuery = {
      $or: [
        { "orderLetterNumber": { $regex: search, $options: 'i' } },
        { "contactPerson": { $regex: search, $options: 'i' } },
        { "department.name": { $regex: search, $options: 'i' } }
      ]
    };

    // Fetch orders with pagination and search query
    const orders = await Order.find(searchQuery)
      .skip(skip)
      .limit(limitParsed)
      .populate('department', 'name') // Assuming you want department name populated
      .populate('items.farmer', 'name') // Example for populating farmer name in items
      .exec();

    // Get the total count of orders for pagination
    const totalCount = await Order.countDocuments(searchQuery);

    // Send the response
    res.json({
      orders,
      total: totalCount
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


