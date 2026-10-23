import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_ATTENDANCE } from '../services/mockData';
import { useAuth } from './AuthContext';
import { ATTENDANCE_STATUS } from '../types/constants';
import { attendanceAPI } from '../services/api';

const AttendanceContext = createContext(null);

export const AttendanceProvider = ({ children }) => {
  const { currentUser, users, isAdmin } = useAuth();

  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('qevnaro_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [liveDuration, setLiveDuration] = useState('00:00:00');
  const [loading, setLoading] = useState(false);

  // Today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);

  // Sync attendance records with backend API
  const fetchAttendance = useCallback(async () => {
    if (!currentUser) return;
    try {
      // 1. Fetch user's today attendance status
      const todayRes = await attendanceAPI.getToday();
      if (todayRes.success && todayRes.record) {
        setRecords((prev) => {
          const exists = prev.some((r) => r._id === todayRes.record._id || (r.userId === currentUser._id && r.date === todayStr));
          if (!exists) {
            return [todayRes.record, ...prev];
          }
          return prev.map((r) =>
            r.userId === currentUser._id && r.date === todayStr ? todayRes.record : r
          );
        });
      }

      // 2. If Super Admin, fetch all monthly records
      if (isAdmin) {
        const now = new Date();
        const monthlyRes = await attendanceAPI.getMonthly(now.getFullYear(), now.getMonth() + 1);
        if (monthlyRes.success && Array.isArray(monthlyRes.records) && monthlyRes.records.length > 0) {
          setRecords(monthlyRes.records);
          localStorage.setItem('qevnaro_attendance', JSON.stringify(monthlyRes.records));
        }
      }
    } catch (err) {
      console.warn('Backend attendance sync fallback:', err.message);
    }
  }, [currentUser, isAdmin, todayStr]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    localStorage.setItem('qevnaro_attendance', JSON.stringify(records));
  }, [records]);

  // Find today's record for currently logged-in user
  const todayRecord = records.find(
    (r) => (String(r.userId) === String(currentUser?._id) || r.userName === currentUser?.name) && r.date === todayStr
  );

  const hasPunchedIn = !!todayRecord?.punchIn;
  const hasPunchedOut = !!todayRecord?.punchOut;

  // Running live timer when punched in
  useEffect(() => {
    if (!hasPunchedIn || hasPunchedOut) {
      if (hasPunchedOut && todayRecord?.durationHours) {
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
  }, [hasPunchedIn, hasPunchedOut, todayRecord]);

  // Punch In Handler connected to Backend API
  const punchIn = async () => {
    if (!currentUser) return { success: false, message: 'Please login first' };

    // Prevent duplicate punch-in on same day
    if (todayRecord) {
      return { success: false, message: 'You have already punched in for today!' };
    }

    try {
      const res = await attendanceAPI.punchIn();
      if (res.success && res.attendance) {
        setRecords((prev) => [res.attendance, ...prev]);
        return { success: true, message: res.message || 'Punched in successfully!' };
      }
    } catch (err) {
      console.warn('Backend punchIn warning, using local:', err.message);
      if (err.message && err.message.includes('already')) {
        return { success: false, message: err.message };
      }
    }

    // Local fallback
    const now = new Date();
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
    const initialStatus = isLate ? ATTENDANCE_STATUS.LATE : ATTENDANCE_STATUS.PRESENT;

    const newRecord = {
      _id: `att_${Date.now()}`,
      userId: currentUser._id,
      userName: currentUser.name,
      userRole: currentUser.role,
      date: todayStr,
      punchIn: now.toISOString(),
      punchOut: null,
      status: initialStatus,
      durationHours: null,
      workSummary: '',
    };

    setRecords((prev) => [newRecord, ...prev]);
    return {
      success: true,
      message: `Punched in successfully at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    };
  };

  // Punch Out Handler (Mandatory work summary) connected to Backend API
  const punchOut = async (workSummaryText) => {
    if (!currentUser) return { success: false, message: 'Please login first' };
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
            (r._id === todayRecord._id || (r.userId === currentUser._id && r.date === todayStr))
              ? res.attendance
              : r
          )
        );
        return { success: true, message: res.message || 'Punched out successfully!' };
      }
    } catch (err) {
      console.warn('Backend punchOut warning, using local:', err.message);
    }

    // Local fallback
    const now = new Date();
    const punchInDate = new Date(todayRecord.punchIn);
    const diffHours = Math.max(0.1, Number(((now - punchInDate) / (1000 * 60 * 60)).toFixed(2)));

    let finalStatus = todayRecord.status;
    if (diffHours < 4) {
      finalStatus = ATTENDANCE_STATUS.HALF_DAY;
    }

    setRecords((prev) =>
      prev.map((r) => {
        if (r._id !== todayRecord._id) return r;
        return {
          ...r,
          punchOut: now.toISOString(),
          durationHours: diffHours,
          status: finalStatus,
          workSummary: trimmedSummary,
        };
      })
    );

    return {
      success: true,
      message: `Punched out successfully! Total logged hours: ${diffHours} hrs.`,
    };
  };

  // Stats calculation for Admin and callers
  const getTodayTeamStats = () => {
    const todayList = records.filter((r) => r.date === todayStr);
    const totalPresent = todayList.filter((r) => r.status === ATTENDANCE_STATUS.PRESENT).length;
    const totalLate = todayList.filter((r) => r.status === ATTENDANCE_STATUS.LATE).length;
    const totalHalfDay = todayList.filter((r) => r.status === ATTENDANCE_STATUS.HALF_DAY).length;
    const totalCheckedOut = todayList.filter((r) => r.punchOut).length;
    const totalActiveNow = todayList.filter((r) => !r.punchOut).length;

    return {
      totalEmployees: users.length,
      punchedInCount: todayList.length,
      totalPresent,
      totalLate,
      totalHalfDay,
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
        liveDuration,
        punchIn,
        punchOut,
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
