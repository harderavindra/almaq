import express from "express";
import Farmer from "../models/Farmer.js";

const router = express.Router();
router.get('/latest', async (req, res) => {
 try {
    const { search } = req.query;

    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: 'i' } };
    }

    const farmers = await Farmer.find(query)
      .sort({ createdAt: -1 }) // latest first
      .limit(5);
      console.log('Latest farmers:', farmers);

    res.json(farmers);
  } catch (err) {
    console.error('Error fetching farmers:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post("/", async (req, res) => {
   try {
    const { firstName, lastName, gender, contactNumber , idNumber, state, district, taluka,city, address} = req.body;
    if (!firstName || !lastName) {
      return res.status(400).json({ message: "Farmer name is required" });
    }

    const farmer = await Farmer.create({ firstName, lastName, gender, contactNumber , idNumber, state, district, taluka, city, address});
    res.status(201).json(farmer);
  } catch (err) {
    console.error("Error creating farmer:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {
      name: { $regex: search, $options: "i" }
    };

    const totalOrders = await Farmer.countDocuments(query);
    const farmers = await Farmer.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      data: farmers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
});
// DELETE /farmers/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFarmer = await Farmer.findByIdAndDelete(id);

    if (!deletedFarmer) {
      return res.status(404).json({ message: 'Farmer not found' });
    }

    res.status(200).json({ message: 'Farmer deleted successfully' });
  } catch (error) {
    console.error('Delete farmer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single farmer
// @route   GET /api/farmers/:id
// @access  Public
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Fetching farmer with ID:', id);
  const farmer = await Farmer.findById(req.params.id);
  
  if (!farmer) {
    res.status(404);
    throw new Error('Farmer not found');
  }

  res.json({
    success: true,
    data: farmer
  });
});

// Update a farmer
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, gender, contactNumber , idNumber, state, district, taluka, city, address} = req.body;

    const updatedFarmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      {firstName, lastName, gender, contactNumber , idNumber, state, district, taluka, city, address},
      { new: true, runValidators: true }
    );

    if (!updatedFarmer) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    res.json(updatedFarmer);
  } catch (err) {
    console.error('Update Error:', err);
    res.status(500).json({ error: 'Server error while updating farmer' });
  }
});

export default router;
