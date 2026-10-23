import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// @desc    Login user & get JWT token
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Fallback only if MongoDB is not connected
    if (mongoose.connection.readyState !== 1) {
      const demoUsers = [
        { _id: 'usr_admin_1', name: 'Vikram Malhotra', email: 'admin@qevnaro.com', role: 'Super Admin', department: 'Management' },
        { _id: 'usr_caller_1', name: 'Rajesh Sharma', email: 'rajesh@qevnaro.com', role: 'Caller', department: 'Sales & Telecalling' },
        { _id: 'usr_caller_2', name: 'Priya Patel', email: 'priya@qevnaro.com', role: 'Caller', department: 'Sales & Telecalling' },
        { _id: 'usr_emp_1', name: 'Neha Mehta', email: 'neha@qevnaro.com', role: 'Employee', department: 'Client Operations' },
      ];

      const found = demoUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        const token = generateToken(found._id, found.role);
        return res.status(200).json({
          success: true,
          token,
          user: found,
          note: 'Authenticated in standalone mode',
        });
      }
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        department: user.department,
        designation: user.designation || 'IT Specialist',
        phone: user.phone || '',
        status: user.status || 'Active',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Register new user (Admin only)
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, department, designation, phone, avatar, status } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
      department: department || 'Frontend Development',
      designation: designation || 'IT Specialist',
      phone: phone || '+91 98000 00000',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: status || 'Active',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phone: user.phone,
        avatar: user.avatar,
        status: user.status,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// @desc    Get all active team members / callers
// @route   GET /api/auth/users
export const getAllUsers = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const demoUsers = [
        { _id: 'usr_admin_1', name: 'Vikram Malhotra', email: 'admin@qevnaro.com', role: 'Super Admin', department: 'Management & Architecture', designation: 'IT Director & Technical Architect', status: 'Active' },
        { _id: 'usr_caller_1', name: 'Rajesh Sharma', email: 'rajesh@qevnaro.com', role: 'Caller', department: 'IT Sales & B2B Telecalling', designation: 'IT Telecaller & B2B Client Closer', status: 'Active' },
        { _id: 'usr_caller_2', name: 'Priya Patel', email: 'priya@qevnaro.com', role: 'Caller', department: 'Graphic Design & UI/UX', designation: 'UI/UX & Senior Graphic Designer', status: 'Active' },
        { _id: 'usr_emp_1', name: 'Aman Verma', email: 'aman@qevnaro.com', role: 'Employee', department: 'Frontend Development', designation: 'Senior Frontend Developer (React / Next.js)', status: 'Active' },
        { _id: 'usr_emp_2', name: 'Neha Mehta', email: 'neha@qevnaro.com', role: 'Employee', department: 'Graphic Design & UI/UX', designation: 'Graphic Designer & Visual Artist', status: 'Active' },
      ];
      return res.status(200).json({ success: true, count: demoUsers.length, users: demoUsers });
    }
    const query = req.user.role === 'Super Admin' ? {} : { status: 'Active' };
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/users/:id
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, designation, phone, status, avatar } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase().trim();
    if (role) user.role = role;
    if (department) user.department = department;
    if (designation) user.designation = designation;
    if (phone) user.phone = phone;
    if (status) user.status = status;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        designation: user.designation,
        phone: user.phone,
        status: user.status,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update user password (Admin or Self)
// @route   PUT /api/auth/users/:id/password
export const updateUserPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.trim().length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    // Only Admin or the user themselves can change the password
    if (req.user.role !== 'Super Admin' && String(req.user._id) !== String(req.params.id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to change this password' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password.trim();
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/users/:id
export const deleteUser = async (req, res) => {
  try {
    if (String(req.user._id) === String(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Toggle employee Active/Inactive status
// @route   PATCH /api/auth/users/:id/status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.status = user.status === 'Active' ? 'Inactive' : 'Active';
    await user.save();

    res.status(200).json({ success: true, status: user.status, message: `User marked as ${user.status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
