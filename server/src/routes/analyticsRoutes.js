import express from 'express';
import Lead from '../models/Lead.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, authorize('Super Admin'));

router.get('/overview', async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const converted = await Lead.countDocuments({ status: 'Converted' });
    const interested = await Lead.countDocuments({ status: 'Interested' });
    const callbackRequired = await Lead.countDocuments({ status: 'Callback Required' });
    const connected = await Lead.countDocuments({ status: 'Connected' });

    const callers = await User.find({ role: 'Caller', status: 'Active' }).select('-password');

    // Aggregate performance per caller
    const callerStats = await Promise.all(
      callers.map(async (caller) => {
        const assigned = await Lead.countDocuments({ assignedTo: caller._id });
        const closed = await Lead.countDocuments({ assignedTo: caller._id, status: 'Converted' });
        const callerInterested = await Lead.countDocuments({ assignedTo: caller._id, status: 'Interested' });
        const callbacks = await Lead.countDocuments({ assignedTo: caller._id, status: 'Callback Required' });

        return {
          caller,
          assigned,
          closed,
          interested: callerInterested,
          callbacks,
          conversionRate: assigned > 0 ? ((closed / assigned) * 100).toFixed(1) : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      summary: {
        totalLeads,
        converted,
        interested,
        callbackRequired,
        connected,
        conversionRate: totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : 0,
      },
      callerStats,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
