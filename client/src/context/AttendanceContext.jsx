import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { ATTENDANCE_STATUS } from '../types/constants';
import { attendanceAPI } from '../services/api';

const AttendanceContext = createContext(null);

export const AttendanceProvider = ({ children }) => {
  const { currentUser, users, isAdmin } = useAuth();

  const [records, setRecords] = useState([]);
  const [liveDuration, setLiveDuration] = useState('00:00:00');
  const [loading, setLoading] = useState(false);

  // Today's date string YYYY-MM-DD in IST
  const getTodayStr = () => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  };
  const todayStr = getTodayStr();

  // Sync attendance records dynamically with backend MongoDB API
  const fetchAttendance = useCallback(async () => {
    if (!currentUser) {
      setRecords([]);
      return;
    }
    setLoading(true);
    try {
      // 1. Fetch user's today attendance status
      const todayRes = await attendanceAPI.getToday();

      // 2. Fetch monthly records for the calendar view
      const now = new Date();
      const monthlyRes = await attendanceAPI.getMonthly(now.getFullYear(), now.getMonth() + 1);

      let merged = [];
      if (monthlyRes.success && Array.isArray(monthlyRes.records)) {
        merged = monthlyRes.records;
      }

      if (todayRes.success && todayRes.record) {
        const exists = merged.some(
          (r) => r._id === todayRes.record._id || (String(r.userId) === String(currentUser._id) && r.date === todayStr)
        );
        if (!exists) {
          merged = [todayRes.record, ...merged];
        } else {
          merged = merged.map((r) =>
            (String(r.userId) === String(currentUser._id) && r.date === todayStr) ? todayRes.record : r
          );
        }
      }

      setRecords(merged);
    } catch (err) {
      console.warn('Dynamic attendance sync error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, todayStr]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Find today's record for currently logged-in user
  const todayRecord = records.find(
    (r) =>
      (String(r.userId) === String(currentUser?._id) || (currentUser?.name && r.userName?.toLowerCase() === currentUser.name.toLowerCase())) &&
      r.date === todayStr
  );

  const hasPunchedIn = !!todayRecord?.punchIn;
  const hasPunchedOut = !!todayRecord?.punchOut;
  const isOnLeave = todayRecord?.status === ATTENDANCE_STATUS.LEAVE;

  // Running live timer when punched in
  useEffect(() => {
    if (!hasPunchedIn || hasPunchedOut || isOnLeave) {
      if (isOnLeave) {
        setLiveDuration('On Leave Today');
      } else if (hasPunchedOut && todayRecord?.durationHours) {
        const totalMinutes = Math.floor(todayRecord.durationHours * 60);
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        setLiveDuration(`${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m (Completed)`);
      } else {
        setLiveDuration('00:00:00');
      }
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(todayRecord.punchIn).getTime();
      const now = Date.now();
      const diffMs = Math.max(0, now - start);

      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      setLiveDuration(
        `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [hasPunchedIn, hasPunchedOut, isOnLeave, todayRecord]);

  // Punch In Handler dynamically connected to Backend MongoDB API
  const punchIn = async () => {
    if (!currentUser) return { success: false, message: 'Please login first' };

    if (isOnLeave) {
      return { success: false, message: 'You are marked On Leave for today. Punch-in is disabled.' };
    }

    if (todayRecord) {
      return { success: false, message: 'You have already punched in for today!' };
    }

    try {
      const res = await attendanceAPI.punchIn();
      if (res.success && res.attendance) {
        setRecords((prev) => [res.attendance, ...prev]);
        return { success: true, message: res.message || 'Punched in successfully!' };
      }
      return { success: false, message: res.message || 'Punch in failed' };
    } catch (err) {
      console.warn('Dynamic punchIn error:', err.message);
      return { success: false, message: err.message || 'Failed to punch in' };
    }
  };

  // Punch Out Handler dynamically connected to Backend MongoDB API
  const punchOut = async (workSummaryText) => {
    if (!currentUser) return { success: false, message: 'Please login first' };
    if (isOnLeave) return { success: false, message: 'You are on Leave today.' };
    if (!todayRecord) return { success: false, message: 'No punch-in recorded for today.' };
    if (todayRecord.punchOut) return { success: false, message: 'You have already punched out today.' };

    const trimmedSummary = workSummaryText ? workSummaryText.trim() : '';
    if (!trimmedSummary || trimmedSummary.length < 10) {
      return {
        success: false,
        message: 'Daily Work Summary is mandatory before checkout! Please enter at least 10 characters explaining tasks completed.',
      };
    }

    try {
      const res = await attendanceAPI.punchOut(trimmedSummary);
      if (res.success && res.attendance) {
        setRecords((prev) =>
          prev.map((r) =>
            (r._id === todayRecord._id || (String(r.userId) === String(currentUser._id) && r.date === todayStr))
              ? res.attendance
              : r
          )
        );
        return { success: true, message: res.message || 'Punched out successfully!' };
      }
      return { success: false, message: res.message || 'Punch out failed' };
    } catch (err) {
      console.warn('Dynamic punchOut error:', err.message);
      return { success: false, message: err.message || 'Failed to punch out' };
    }
  };

  // Apply Leave Handler dynamically connected to Backend MongoDB API
  const applyLeave = async ({ date, leaveReason, leaveType, userId } = {}) => {
    if (!currentUser) return { success: false, message: 'Please login first' };
    try {
      const res = await attendanceAPI.applyLeave({
        date: date || todayStr,
        leaveReason,
        leaveType,
        userId: userId || currentUser._id,
      });
      if (res.success && res.attendance) {
        setRecords((prev) => {
          const filtered = prev.filter(
            (r) => !(String(r.userId) === String(res.attendance.userId) && r.date === res.attendance.date)
          );
          return [res.attendance, ...filtered];
        });
        return { success: true, message: res.message || 'Leave marked successfully!' };
      }
      return { success: false, message: res.message || 'Failed to apply leave' };
    } catch (err) {
      console.warn('Dynamic applyLeave error:', err.message);
      return { success: false, message: err.message || 'Failed to apply leave' };
    }
  };

  // Stats calculation for Admin and callers
  const getTodayTeamStats = () => {
    const todayList = records.filter((r) => r.date === todayStr);
    const totalPresent = todayList.filter((r) => r.status === ATTENDANCE_STATUS.PRESENT).length;
    const totalLate = todayList.filter((r) => r.status === ATTENDANCE_STATUS.LATE).length;
    const totalHalfDay = todayList.filter((r) => r.status === ATTENDANCE_STATUS.HALF_DAY).length;
    const totalLeave = todayList.filter((r) => r.status === ATTENDANCE_STATUS.LEAVE).length;
    const totalCheckedOut = todayList.filter((r) => r.punchOut).length;
    const totalActiveNow = todayList.filter((r) => !r.punchOut && r.status !== ATTENDANCE_STATUS.LEAVE).length;

    return {
      totalEmployees: users.length,
      punchedInCount: todayList.filter((r) => r.status !== ATTENDANCE_STATUS.LEAVE).length,
      totalPresent,
      totalLate,
      totalHalfDay,
      totalLeave,
      totalCheckedOut,
      totalActiveNow,
      absentCount: Math.max(0, users.length - todayList.length),
    };
  };

  return (
    <AttendanceContext.Provider
      value={{
        records,
        attendanceRecords: records,
        todayRecord,
        hasPunchedIn,
        hasPunchedOut,
        isOnLeave,
        liveDuration,
        loading,
        punchIn,
        punchOut,
        applyLeave,
        getTodayTeamStats,
        fetchAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

export default AttendanceContext;
