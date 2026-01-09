import Visitor from "../models/Visitor.js";
import Contact from "../models/Contact.js";

// ---------------------------------------------
// AUTO LINK CONTACT BY MOBILE
// ---------------------------------------------
const autoLinkContact = async (mobile) => {
  const existing = await Contact.findOne({ mobile });
  return existing ? existing._id : null;
};

// ---------------------------------------------
// CREATE VISITOR
// ---------------------------------------------
export const createVisitor = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);

    // Auto link or auto create Contact
    if (!data.contactId && data.mobile) {
      let contact = await Contact.findOne({ mobile: data.mobile });

    if (!contact) {
  contact = await Contact.create({
    firstName: data.firstName,
    lastName: data.lastName,
    fullName: data.fullName,
    mobile: data.mobile,
    createdBy: req.user?._id,
  });
}
      data.contactId = contact._id;
    }

    const visitor = await Visitor.create({
      ...data,
      createdBy: req.user?._id,
    });

    res.json({
      success: true,
      message: "Visitor added successfully",
      data: visitor,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create visitor",
      error: err.message,
    });
  }
};


// ---------------------------------------------
// GET VISITORS WITH FILTERS + PAGINATION
// ---------------------------------------------
export const getVisitors = async (req, res) => {
  try {
    const {
      search,
      mobile,
      status,
      visitType,
      locationId,
      contactId,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      query.fullName = new RegExp(search, "i");
    }
    if (req.query.mobileStartsWith) {
  query.mobile = new RegExp("^" + req.query.mobileStartsWith);
}

    if (mobile) query.mobile = mobile;
    if (status) query.status = status;
    if (visitType) query.visitType = visitType;
    if (locationId) query.locationId = locationId;
    if (contactId) query.contactId = contactId;

    const visitors = await Visitor.find(query)
      .populate("contactId")
      .populate("createdBy", "firstName lastName")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Visitor.countDocuments(query);

    res.json({
      success: true,
      data: visitors,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch visitors",
      error: err.message,
    });
  }
};

// ---------------------------------------------
// GET SINGLE VISITOR
// ---------------------------------------------
export const getVisitorById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate("contactId")
      .populate("createdBy", "firstName lastName");

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    res.json({ success: true, data: visitor });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch visitor",
      error: err.message,
    });
  }
};

// ---------------------------------------------
// UPDATE VISITOR
// ---------------------------------------------
export const updateVisitor = async (req, res) => {
  try {
    const data = req.body;

    // re-link contact if mobile changed
    if (data.mobile) {
      data.contactId = await autoLinkContact(data.mobile);
    }

    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true }
    );

    res.json({
      success: true,
      message: "Visitor updated",
      data: visitor,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update visitor",
      error: err.message,
    });
  }
};

// ---------------------------------------------
// UPDATE STATUS ONLY
// waiting → in-progress → completed → cancelled
// ---------------------------------------------
export const updateVisitorStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({
      success: true,
      message: "Status updated",
      data: visitor,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: err.message,
    });
  }
};

// ---------------------------------------------
export const checkoutVisitor = async (req, res) => {
  try {
    const { outTime } = req.body;

    // 1. Use passed outTime if provided, otherwise fallback to server time
    const finalOutTime = outTime ? new Date(outTime) : new Date();

    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      {
        outTime: finalOutTime,
        status: "completed",
      },
      { new: true }
    );

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    res.json({ success: true, data: visitor });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
// ---------------------------------------------
// CONVERT VISITOR → CONTACT
// ---------------------------------------------
export const convertVisitorToContact = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);

    if (!visitor) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }

    // Create contact
    const contact = await Contact.create({
      firstName: visitor.fullName.split(" ")[0],
      lastName: visitor.fullName.split(" ")[1] || "",
      mobile: visitor.mobile,
      address: {
        state: visitor.address?.state,
        district: visitor.address?.district,
        taluka: visitor.address?.taluka,
        city: visitor.address?.city,
      },
      source: "visitor",
    });

    // Update visitor
    visitor.contactId = contact._id;
    await visitor.save();

    res.json({
      success: true,
      message: "Visitor converted to contact",
      data: contact,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to convert visitor",
      error: err.message,
    });
  }
};


export const getVisitorTimeline = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const visitors = await Visitor.find({
      inTime: { $gte: today, $lte: end }
    })
    .sort({ inTime: -1 })
    .lean();

    // Group by date (future ready)
    const grouped = {
      [today.toISOString()]: visitors
    };

    res.json({
      success: true,
      data: grouped
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getVisitorTimelineDays = async (req, res) => {
  try {
    const numDays = Number(req.query.days || 7);
    const today = new Date();

    let days = [];

    for (let i = 0; i < numDays; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);

      days.push({
        date: d.toISOString(),
        visitors: [] // empty for now
      });
    }

    res.json({ success: true, days });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getVisitorsByDay = async (req, res) => {
  try {
    const dayString = req.params.date; // "2025-12-05"
    const day = new Date(dayString);

    const start = new Date(dayString);
    start.setHours(0, 0, 0, 0);

    const end = new Date(dayString);
    end.setHours(23, 59, 59, 999);

    const visitors = await Visitor.find({
      inTime: { $gte: start, $lte: end }
    }).sort({ inTime: -1 });

    res.json({
      success: true,
      date: start,
      visitors
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getVisitorsByWeek = async (req, res) => {
  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({
        success: false,
        error: "start and end dates are required",
      });
    }

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const visitors = await Visitor.find({
      inTime: { $gte: startDate, $lte: endDate },
    }).sort({ inTime: -1 });

    // Group by date
    const grouped = {};

    let cursor = new Date(startDate);
    while (cursor <= endDate) {
      const key = cursor.toISOString().slice(0, 10);
      grouped[key] = [];
      cursor.setDate(cursor.getDate() + 1);
    }

    visitors.forEach((v) => {
      const d = v.inTime.toISOString().slice(0, 10);
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(v);
    });

    res.json({
      success: true,
      data: Object.entries(grouped).map(([date, visitors]) => ({
        date,
        visitors,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

