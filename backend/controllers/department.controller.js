// controllers/departmentController.js
import Department from '../models/Department.js';

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
    const deletedDepartment = await Department.findByIdAndDelete(req.params.id);
    if (!deletedDepartment) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error });
  }
};
