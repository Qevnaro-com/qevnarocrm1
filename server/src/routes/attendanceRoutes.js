import express from 'express';
import {
  punchIn,
  punchOut,
  getTodayAttendance,
  getMonthlyAttendance,
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.get('/today', getTodayAttendance);
router.get('/monthly', getMonthlyAttendance);

export default router;
