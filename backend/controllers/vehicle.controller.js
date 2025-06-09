import Challan from '../models/Challan.js';
import Vehicle from '../models/Vehicle.js';

// Create vehicle
export const createVehicle = async (req, res) => {
  try {
    const vehicle = new Vehicle(req.body);
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all vehicles
export const getVehicles = async (req, res) => {
   try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      const total = await Vehicle.countDocuments();
      const totalPages = Math.ceil(total / limit);
      const skip = (page - 1) * limit;
  
      const data = await Vehicle.find()
        .skip(skip)
        .limit(limit)
        .sort({ name: 1 }); // optional sort
  
      res.status(200).json({ data, totalPages });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch plant types', error });
    }
};

// Get single vehicle
export const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    console.log('Fetching vehicle with ID:',vehicle);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update vehicle
export const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete vehicle
export const deleteOrDeactivateVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the vehicle is used in any Challan
    const isReferenced = await Challan.exists({ vehicleId: id });

    if (isReferenced) {
      // Soft delete (mark inactive)
      const updatedVehicle = await Vehicle.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!updatedVehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Vehicle is in use and has been marked as inactive.',
        vehicle: updatedVehicle,
      });
    } else {
      // Hard delete
      const deletedVehicle = await Vehicle.findByIdAndDelete(id);

      if (!deletedVehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }

      return res.status(200).json({
        success: true,
        message: 'Vehicle deleted successfully.',
        vehicle: deletedVehicle,
      });
    }

  } catch (err) {
    console.error('Vehicle deletion error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
