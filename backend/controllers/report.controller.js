import Challan from "../models/Challan.js";
import Department from "../models/Department.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

export const ordersOverTime = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$orderDate" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const formatted = data.map(item => ({
      month: item._id,
      orders: item.count
    }));

    res.json(formatted);
    console.log("Orders over time data:", formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}

export const ordersThisMonth = async (req, res) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const data = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: firstDay, $lte: lastDay }
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$orderDate" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formatted = data.map(item => ({
      day: `Day ${item._id}`,
      orders: item.count
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


export const ordersPlacedDuration = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6); 

    const data = await OrderItem.aggregate([
      // Join with Order to get orderDate
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order"
        }
      },
      { $unwind: "$order" },

      // Filter for orderDate in last 6 months
      {
        $match: {
          "order.orderDate": { $gte: sixMonthsAgo }
        }
      },

      // Group by orderDate (formatted)
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$order.orderDate" }
          },
          revenue: {
            $sum: { $multiply: ["$quantity", "$pricePerUnit"] }
          }
        }
      },

      // Sort by date
      { $sort: { _id: 1 } }
    ]);

    res.json(data.map(d => ({ date: d._id, revenue: d.revenue })));
    console.log("Orders placed data:", data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const ordersDeliveredDuration = async (req, res) => {
    try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6); 

    const data = await OrderItem.aggregate([
      // Join with Order to get orderDate
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order"
        }
      },
      { $unwind: "$order" },

      // Filter for orderDate in last 6 months
      {
        $match: {
           status: "Delivered",
          "order.orderDate": { $gte: sixMonthsAgo }
        }
      },

      // Group by orderDate (formatted)
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$order.orderDate" }
          },
          revenue: {
            $sum: { $multiply: ["$quantity", "$pricePerUnit"] }
          }
        }
      },

      // Sort by date
      { $sort: { _id: 1 } }
    ]);

    res.json(data.map(d => ({ date: d._id, revenue: d.revenue })));
    console.log("Orders Deliverd data:", data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getDashboardStats = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Step 1: Get all relevant orders
    const recentOrders = await Order.find({
      orderDate: { $gte: sixMonthsAgo }
    }).select('_id departmentId');

    const orderIds = recentOrders.map(order => order._id);
    const departmentIds = [...new Set(recentOrders.map(o => o.departmentId.toString()))];

    // Step 2: Aggregate for Placed & Delivered
    const [summary, deliveredSummary, departments] = await Promise.all([
      // All placed items
      OrderItem.aggregate([
        { $match: { orderId: { $in: orderIds } } },
        {
          $group: {
            _id: null,
            totalPlantQuantity: { $sum: '$quantity' },
            totalRevenue: { $sum: { $multiply: ['$quantity', '$pricePerUnit'] } }
          }
        }
      ]),

      // Only delivered items
      OrderItem.aggregate([
        {
          $match: {
            orderId: { $in: orderIds },
            status: "Delivered",
            invoiceId: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            deliveredPlantQuantity: { $sum: '$quantity' },
            deliveredRevenue: { $sum: { $multiply: ['$quantity', '$pricePerUnit'] } }
          }
        }
      ]),

      // Department info
      Department.find({ _id: { $in: departmentIds } })
        .select('name district taluka')
        .lean()
    ]);

    const result = {
      totalPlantQuantity: summary[0]?.totalPlantQuantity || 0,
      totalRevenue: summary[0]?.totalRevenue || 0,
      deliveredPlantQuantity: deliveredSummary[0]?.deliveredPlantQuantity || 0,
      deliveredRevenue: deliveredSummary[0]?.deliveredRevenue || 0,
      totalDepartments: departments.length,
      departmentsList: departments
    };

    res.json(result);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};