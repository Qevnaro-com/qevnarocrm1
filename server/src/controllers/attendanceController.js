import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// @desc    Punch in for the day
// @route   POST /api/attendance/punch-in
export const punchIn = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);

    // Prevent duplicate punch-in on same calendar day
    const existing = await Attendance.findOne({
      userId: req.user._id,
      date: todayStr,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already punched in for today!',
      });
    }

    const now = new Date();
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
    const status = isLate ? 'Late' : 'Present';

    const attendance = await Attendance.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      date: todayStr,
      punchIn: now,
      status,
    });

    res.status(201).json({
      success: true,
      message: `Punched in successfully at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      attendance,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate punch-in detected for today.',
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Punch out with mandatory EOD work summary
// @route   POST /api/attendance/punch-out
export const punchOut = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const { workSummary } = req.body;

    // Enforce mandatory daily work summary
    if (!workSummary || workSummary.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Mandatory daily work summary / tasks completed is required before punching out (min 10 chars).',
      });
    }

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: todayStr,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No punch-in record found for today.',
      });
    }

    if (attendance.punchOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already punched out today.',
      });
    }

    const now = new Date();
    const diffHours = Math.max(0.1, Number(((now - attendance.punchIn) / (1000 * 60 * 60)).toFixed(2)));

    // Half day if worked less than 4 hours
    let finalStatus = attendance.status;
    if (diffHours < 4) {
      finalStatus = 'Half Day';
    }

    attendance.punchOut = now;
    attendance.durationHours = diffHours;
    attendance.workSummary = workSummary.trim();
    attendance.status = finalStatus;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Punched out successfully! Logged ${diffHours} active hours.`,
      attendance,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user's attendance status for today
// @route   GET /api/attendance/today
export const getTodayAttendance = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().slice(0, 10);
    const record = await Attendance.findOne({
      userId: req.user._id,
      date: todayStr,
    });

    res.status(200).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get monthly tabular attendance sheet (Admin & Managers)
// @route   GET /api/attendance/monthly
export const getMonthlyAttendance = async (req, res) => {
  try {
    const { year, month } = req.query; // year=2026, month=10
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month ? String(month).padStart(2, '0') : String(new Date().getMonth() + 1).padStart(2, '0');

    const regex = new RegExp(`^${targetYear}-${targetMonth}`);

    const records = await Attendance.find({ date: { $regex: regex } }).sort({ date: 1 });
    const users = await User.find({ status: 'Active' }).select('-password');

    res.status(200).json({
      success: true,
      year: targetYear,
      month: targetMonth,
      records,
      users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
