import PlantType from '../models/PlantType.js';

// Get all plant types (with pagination)
export const getPlantTypes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const total = await PlantType.countDocuments();
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    const data = await PlantType.find()
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 }); // optional sort

    res.status(200).json({ data, totalPages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plant types', error });
  }
};

// Get a single plant type by ID
export const getPlantTypeById = async (req, res) => {
  try {
    const plantType = await PlantType.findById(req.params.id);
    if (!plantType) return res.status(404).json({ message: 'Plant type not found' });
    res.status(200).json({ data: plantType });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch plant type', error });
  }
};

// Create a new plant type
export const createPlantType = async (req, res) => {
  try {
    const plantType = new PlantType(req.body);
    await plantType.save();
    res.status(201).json({ message: 'Plant type created successfully', data: plantType });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create plant type', error });
  }
};

// Update an existing plant type
export const updatePlantType = async (req, res) => {
  try {
    const updated = await PlantType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ message: 'Plant type not found' });
    res.status(200).json({ message: 'Plant type updated successfully', data: updated });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update plant type', error });
  }
};

// Delete a plant type
export const deletePlantType = async (req, res) => {
  try {
    const deleted = await PlantType.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Plant type not found' });
    res.status(200).json({ message: 'Plant type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete plant type', error });
  }
};
