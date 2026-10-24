import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

// Helper to get consistent Indian Standard Time (IST) info
export const getISTTimeInfo = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const map = {};
  parts.forEach((p) => {
    map[p.type] = p.value;
  });
  const year = map.year;
  const month = map.month;
  const day = map.day;
  const hours = parseInt(map.hour, 10);
  const minutes = parseInt(map.minute, 10);
  const dateStr = `${year}-${month}-${day}`;
  return { dateStr, hours, minutes };
};

// @desc    Punch in for the day (Shift starts 10:00 AM, Late at or after 11:30 AM)
// @route   POST /api/attendance/punch-in
export const punchIn = async (req, res) => {
  try {
    const now = new Date();
    const { dateStr, hours, minutes } = getISTTimeInfo(now);

    // Prevent duplicate punch-in on same calendar day or if already marked leave
    const existing = await Attendance.findOne({
      userId: req.user._id,
      date: dateStr,
    });

    if (existing) {
      if (existing.status === 'Leave') {
        return res.status(400).json({
          success: false,
          message: 'You are marked On Leave for today. Punch-in is not allowed.',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'You have already punched in for today!',
      });
    }

    // Shift timing: 10:00 AM to 5:30 PM (17:30)
    // Late cutoff: 11:30 AM (Punching at or after 11:30 AM -> Late)
    const isLate = hours > 11 || (hours === 11 && minutes >= 30);
    const status = isLate ? 'Late' : 'Present';

    const attendance = await Attendance.create({
      userId: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      date: dateStr,
      punchIn: now,
      status,
    });

    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let statusMsg = isLate ? ' (Marked Late - punched after 11:30 AM)' : ' (On Time)';
    if (hours < 10) {
      statusMsg = ' (Early Punch-in - Shift begins at 10:00 AM)';
    }

    res.status(201).json({
      success: true,
      message: `Punched in successfully at ${timeFormatted}${statusMsg}`,
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
//          Shift ends 5:30 PM (17:30). Early departure before 4:30 PM (16:30) or < 4 hrs -> Half Day
// @route   POST /api/attendance/punch-out
export const punchOut = async (req, res) => {
  try {
    const now = new Date();
    const { dateStr, hours, minutes } = getISTTimeInfo(now);
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
      date: dateStr,
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No punch-in record found for today.',
      });
    }

    if (attendance.status === 'Leave') {
      return res.status(400).json({
        success: false,
        message: 'You are marked On Leave today.',
      });
    }

    if (attendance.punchOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already punched out today.',
      });
    }

    const diffHours = Math.max(0.1, Number(((now - attendance.punchIn) / (1000 * 60 * 60)).toFixed(2)));

    // Early exit rule:
    // Office shift ends at 5:30 PM. Leaving before 4:30 PM (16:30) or active time < 4 hrs marks Half Day
    const isEarlyDeparture = hours < 16 || (hours === 16 && minutes < 30);
    const isUnderHours = diffHours < 4;

    let finalStatus = attendance.status;
    let note = '';

    if (isEarlyDeparture || isUnderHours) {
      finalStatus = 'Half Day';
      if (isEarlyDeparture) {
        note = ' (Marked Half Day: punched out before 4:30 PM)';
      } else {
        note = ' (Marked Half Day: worked less than 4 hours)';
      }
    }

    attendance.punchOut = now;
    attendance.durationHours = diffHours;
    attendance.workSummary = workSummary.trim();
    attendance.status = finalStatus;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Punched out successfully! Logged ${diffHours} active hours. Status: ${finalStatus}${note}`,
      attendance,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Apply / Mark Leave for today or a specific date
// @route   POST /api/attendance/leave
export const applyLeave = async (req, res) => {
  try {
    const now = new Date();
    const { dateStr } = getISTTimeInfo(now);
    const { date, leaveReason, leaveType, userId } = req.body;
    const targetDate = date || dateStr;

    // Super Admin can mark leave for other employees
    let targetUserId = req.user._id;
    let targetUserName = req.user.name;
    let targetUserRole = req.user.role;

    if (userId && req.user.role === 'Super Admin' && String(userId) !== String(req.user._id)) {
      const targetUser = await User.findById(userId);
      if (targetUser) {
        targetUserId = targetUser._id;
        targetUserName = targetUser.name;
        targetUserRole = targetUser.role;
      }
    }

    const existing = await Attendance.findOne({
      userId: targetUserId,
      date: targetDate,
    });

    if (existing) {
      if (existing.status === 'Leave') {
        return res.status(400).json({
          success: false,
          message: `Leave is already marked for ${targetDate}.`,
        });
      }
      return res.status(400).json({
        success: false,
        message: `An attendance record (${existing.status}) already exists for ${targetDate}. Cannot apply leave.`,
      });
    }

    const reason = leaveReason && leaveReason.trim() ? leaveReason.trim() : 'Personal Leave';
    const type = leaveType && leaveType.trim() ? leaveType.trim() : 'Full Day Leave';

    const attendance = await Attendance.create({
      userId: targetUserId,
      userName: targetUserName,
      userRole: targetUserRole,
      date: targetDate,
      punchIn: null,
      punchOut: null,
      durationHours: 0,
      leaveReason: reason,
      leaveType: type,
      workSummary: `Leave [${type}]: ${reason}`,
      status: 'Leave',
    });

    res.status(201).json({
      success: true,
      message: `Leave marked successfully for ${targetDate} (${targetUserName})`,
      attendance,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An attendance or leave record already exists for this date.',
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user's attendance status for today
// @route   GET /api/attendance/today
export const getTodayAttendance = async (req, res) => {
  try {
    const { dateStr } = getISTTimeInfo(new Date());
    const record = await Attendance.findOne({
      userId: req.user._id,
      date: dateStr,
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
    const now = new Date();
    const { dateStr } = getISTTimeInfo(now);
    const targetYear = year || dateStr.slice(0, 4);
    const targetMonth = month ? String(month).padStart(2, '0') : dateStr.slice(5, 7);

    const regex = new RegExp(`^${targetYear}-${targetMonth}`);

    const query = { date: { $regex: regex } };
    if (req.user.role !== 'Super Admin') {
      query.userId = req.user._id;
    }

    const records = await Attendance.find(query).sort({ date: 1 });
    const users = req.user.role === 'Super Admin'
      ? await User.find({ status: 'Active' }).select('-password')
      : [req.user];

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
