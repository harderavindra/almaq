import mongoose from "mongoose";
import Contact from "../models/Contact.js";

export const createContact = async (req, res) => {
  try {
    const data = req.body;
    data.createdBy = req.user._id;

    const contact = await Contact.create(data);

    res.status(201).json({
      success: true,
      message: "Contact created successfully",
      data: contact,
    });
  } catch (error) {
    console.log("Create Contact Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getContactsTaskbatch = async (req, res) => {
  try {
    console.log("Fetching contacts for task batch");
    const {
      search,
      state,
      district,
      taluka,
      category,
      tag,
      callStatus,
      ownerId,
      dnd,
      language,
      excludeIds,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      status: { $ne: "deleted" }, // safety
    };

    /* =====================
       SEARCH
    ===================== */
    if (search) {
      query.$or = [
        { fullName: new RegExp(search, "i") },
        { mobile: new RegExp(search, "i") },
      ];
    }

    /* =====================
       LOCATION
    ===================== */
    if (state) query["address.state"] = state;
    if (district) query["address.district"] = district;
    if (taluka) query["address.taluka"] = taluka;

    /* =====================
       FILTERS
    ===================== */
    if (category) query.categories = category;
    if (tag) query.tags = tag;
    if (callStatus) query.callStatus = callStatus;
    if (ownerId) query.ownerId = ownerId;
    if (language) query.preferredLanguage = language;
    if (dnd !== undefined) query.doNotDisturb = dnd === "true";

    /* =====================
       EXCLUDE IDS (TaskBatch)
    ===================== */
    if (excludeIds) {
      const ids = excludeIds
        .split(",")
        .filter(Boolean)
        .map((id) => new mongoose.Types.ObjectId(id));

      query._id = { $nin: ids };
    }

    /* =====================
       PAGINATED QUERY (FIXED)
    ===================== */
    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .select(
          "firstName lastName fullName mobile address gender doNotDisturb"
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),

      Contact.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET CONTACTS ERROR", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch contacts",
      error: err.message,
    });
  }
};
export const getContacts = async (req, res) => {
  try {
    const {
      search,
      state,
      district,
      taluka,
      category,
      tag,
      callStatus,
      ownerId,
      dnd,
      language,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { fullName: new RegExp(search, "i") },
        { mobile: new RegExp(search, "i") },
      ];
    }
    if (state) query["address.state"] = state;
    if (district) query["address.district"] = district;
    if (taluka) query["address.taluka"] = taluka;
    
    if (category) query.categories = category;
    if (tag) query.tags = tag;
    
    if (callStatus) query.callStatus = callStatus;
    if (ownerId) query.ownerId = ownerId;
    if (dnd !== undefined) query.doNotDisturb = dnd === "true";
    if (language) query.preferredLanguage = language;
    
    const contacts = await Contact.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

    const total = await Contact.countDocuments(query);
// console.log( "controller" + contacts)
    res.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch contacts", error: err.message });
  }
};


export const getContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: contact });
  } catch (error) {
    console.log("Get Contact Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateContact = async (req, res) => {
  try {
    const data = req.body;
    data.updatedBy = req.user._id;
console.log(data)
    const contact = await Contact.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    res.json({
      success: true,
      message: "Contact updated",
      data: contact,
    });
  } catch (error) {
    console.log("Update Contact Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: "deleted", updatedBy: req.user._id },
      { new: true }
    );

    res.json({
      success: true,
      message: "Contact deleted",
      data: contact,
    });
  } catch (error) {
    console.log("Delete Contact Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const searchByMobile = async (req, res) => {
  try {
    const { mobile } = req.query;

    if (!mobile) {
      return res.json({ success: true, data: [] });
    }

    const regex = new RegExp("^" + mobile); // match starting digits

    const contacts = await Contact.find(
      { mobile: regex },
      "firstName lastName mobile address"
    )
      .limit(4)
      .sort({ firstName: 1 });

    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


