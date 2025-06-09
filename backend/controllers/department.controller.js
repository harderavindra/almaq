// controllers/departmentController.js
import Department from '../models/Department.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// Get all departments with pagination
export const getDepartments = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const departments = await Department.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Department.countDocuments();
    res.status(200).json({
      data: departments,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error });
  }
};

export const searchDepartments = async (req, res) => {
  try {
    const search = req.query.search?.trim() || '';
    const state = req.query.state?.trim();
    const district = req.query.district?.trim();
    const taluka = req.query.taluka?.trim();
    const city = req.query.city?.trim();

    const filter = {
      ...(search && { name: { $regex: search, $options: 'i' } }),
      ...(state && { state }),
      ...(district && { district }),
      ...(taluka && { taluka }),
      ...(city && { city })
    };
    console.log(filter)

    const departments = await Department.find(filter)
      .sort({ name: 1 })
      .limit(30)
      .lean();

    res.json({ success: true, data: departments });
  } catch (error) {
    console.error('Error during department search:', error);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};

// Get a single department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json({ data: department });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department', error });
  }
};

// Create a new department
export const createDepartment = async (req, res) => {
  try {
    const newDepartment = new Department(req.body);
    await newDepartment.save();
    res.status(201).json({ message: 'Department created successfully', data: newDepartment });
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error });
  }
};

// Update an existing department
export const updateDepartment = async (req, res) => {
  try {
    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedDepartment) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json({ message: 'Department updated successfully', data: updatedDepartment });
  } catch (error) {
    res.status(500).json({ message: 'Error updating department', error });
  }
};

// Delete a department
export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id; // Assuming you use auth middleware

    // Check if the department is referenced
    const isUsedInOrders = await Order.exists({ departmentId: id });
    const isUsedInUsers = await User.exists({ team: id });

    if (isUsedInOrders || isUsedInUsers) {
      // Soft delete
      const updated = await Department.findByIdAndUpdate(
        id,
        {
          isActive: false,
          deactivatedAt: new Date(),
          deletedBy: userId || null,
        },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ message: 'Department not found' });
      }

      return res.status(200).json({
        message: 'Department in use. Marked as inactive.',
        department: updated,
      });
    }

    // Hard delete
    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({ message: 'Department permanently deleted.' });

  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Error deleting department', error });
  }
};
