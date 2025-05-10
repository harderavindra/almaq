import Vehicle from "../models/Vehicle.model.js";

export const createVehicle = async (req, res) => {
    try {
        const vehicle = new Vehicle(req.body);
        await vehicle.save();
        res.status(201).json(vehicle);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getVehicles = async (req, res) => {
    try {
      const vehicles = await Vehicle.find({ isActive: true }).sort({ createdAt: -1 });
      res.status(200).json(vehicles);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch vehicles", message: err.message });
    }
  };