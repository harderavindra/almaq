import Farmer from "../models/Farmer.js";

export const getLatestFarmers = async (req, res) => {
  try {
    const { search, state, district, taluka, city } = req.query;

    // Build dynamic query
    const query = {};

    // Search filter on firstName or lastName
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } }
      ];
    }

    // Optional location filters
    if (state) query.state = state;
    if (district) query.district = district;
    if (taluka) query.taluka = taluka;
    if (city) query.city = city;

    const farmers = await Farmer.find(query)
      .sort({ createdAt: -1 })
      .limit();

    res.json({ success: true, data: farmers });
  } catch (err) {
    console.error("Error fetching latest farmers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createFarmer = async (req, res) => {
  try {
    const {
      firstName, lastName, gender,
      state, district, taluka, city,
      contactNumber, idNumber, address,
    } = req.body;

    // Manual validation for required fields
    if (!firstName || !lastName || !gender || !state || !district || !taluka) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields: firstName, lastName, gender, state, district, taluka.",
      });
    }

    const farmer = await Farmer.create({
      firstName,
      lastName,
      gender,
      state,
      district,
      taluka,
      city,
      contactNumber,
      idNumber,
      address,
    });

    res.status(201).json({ success: true, data: farmer });

  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }

    if (error.code === 11000) {
      // Duplicate key error (contactNumber or idNumber)
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `The ${field} '${error.keyValue[field]}' already exists.`,
      });
    }

    console.error(error); // Optional: log for debugging
    return res.status(500).json({
      success: false,
      message: "An unexpected server error occurred. Please try again.",
    });
  }
};

// Get paginated farmers list
export const getFarmers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    console.log(limit)

    const { state, district, taluka, city } = req.query;

    const query = {
      $and: [
        {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } }
          ]
        }
      ]
    };

    if (state) query.$and.push({ state });
    if (district) query.$and.push({ district });
    if (taluka) query.$and.push({ taluka });
    if (city) query.$and.push({ city });

    const totalFarmers = await Farmer.countDocuments(query);
    const farmers = await Farmer.find(query)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalFarmers / limit),
      totalFarmers,
      data: farmers
    });
  } catch (err) {
    console.error("Error fetching farmers:", err);
    res.status(500).json({ success: false, message: "Failed to fetch farmers" });
  }
};

// Get single farmer by ID
export const getFarmerById = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id);

    if (!farmer) {
      return res.status(404).json({ success: false, message: "Farmer not found" });
    }

    res.json({ success: true, data: farmer });
  } catch (err) {
    console.error("Error fetching farmer:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update farmer by ID
export const updateFarmer = async (req, res) => {
  try {
    const {
      firstName, lastName, gender, contactNumber,
      idNumber, state, district, taluka, city, address
    } = req.body;

    const updatedFarmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      {
        firstName, lastName, gender, contactNumber,
        idNumber, state, district, taluka, city, address
      },
      { new: true, runValidators: true }
    );

    if (!updatedFarmer) {
      return res.status(404).json({ success: false, message: "Farmer not found" });
    }

    res.json({ success: true, data: updatedFarmer });
  } catch (err) {
    console.error("Update farmer error:", err);
    res.status(500).json({ success: false, message: "Server error while updating farmer" });
  }
};

// Delete farmer by ID
export const deleteFarmer = async (req, res) => {
  try {
    const deletedFarmer = await Farmer.findByIdAndDelete(req.params.id);

    if (!deletedFarmer) {
      return res.status(404).json({ success: false, message: "Farmer not found" });
    }

    res.json({ success: true, message: "Farmer deleted successfully" });
  } catch (err) {
    console.error("Delete farmer error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const bulkUploadFarmers = async (req, res) => {
  try {
    const farmers = req.body; // Expecting array of farmer objects

    if (!Array.isArray(farmers) || farmers.length === 0) {
      return res.status(400).json({ message: "No farmer data provided." });
    }

    // Optional: Remove duplicates based on contactNumber or idNumber
    const uniqueFarmers = farmers.filter(
      (farmer, index, self) =>
        index ===
        self.findIndex(
          (f) =>
            f.contactNumber === farmer.contactNumber ||
            (f.idNumber && f.idNumber === farmer.idNumber)
        )
    );

    const createdFarmers = await Farmer.insertMany(uniqueFarmers, {
      ordered: false, // continues even if some fail
    });

    res.status(201).json({
      message: `${createdFarmers.length} farmers uploaded successfully.`,
      data: createdFarmers,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error uploading farmers.",
      error: error.message,
    });
  }
};