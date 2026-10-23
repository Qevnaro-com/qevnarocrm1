import express from 'express';
import {
  login,
  register,
  getMe,
  getAllUsers,
  updateUser,
  updateUserPassword,
  deleteUser,
  toggleUserStatus,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', protect, authorize('Super Admin'), register);
router.get('/me', protect, getMe);
router.get('/users', protect, getAllUsers);

// User management
router.put('/users/:id', protect, authorize('Super Admin'), updateUser);
router.put('/users/:id/password', protect, updateUserPassword);
router.delete('/users/:id', protect, authorize('Super Admin'), deleteUser);
router.patch('/users/:id/status', protect, authorize('Super Admin'), toggleUserStatus);

export default router;

