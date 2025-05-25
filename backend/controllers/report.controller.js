import Challan from "../models/Challan.js";
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const ordersDeliveredDuration = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const data = await Challan.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "orderitems",
          localField: "items.orderItemId",
          foreignField: "_id",
          as: "orderItem"
        }
      },
      { $unwind: "$orderItem" },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: {
            $sum: {
              $multiply: ["$items.quantity", "$orderItem.pricePerUnit"]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(data.map(d => ({ date: d._id, revenue: d.revenue })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};