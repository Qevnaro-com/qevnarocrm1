import React from 'react';
import AttendanceCalendar from '../components/attendance/AttendanceCalendar';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck2,
  Clock,
  LogIn,
  LogOut,
  UserCheck,
  AlertCircle,
  FileText,
  Sparkles,
  CheckCircle2,
  CalendarOff,
  Sun
} from 'lucide-react';

export const AttendancePage = ({ onOpenPunchModal }) => {
  const { currentUser } = useAuth();
  const {
    records,
    todayRecord,
    hasPunchedIn,
    hasPunchedOut,
    isOnLeave,
    liveDuration,
    getTodayTeamStats,
  } = useAttendance();

  const stats = getTodayTeamStats();

  // Find all submitted daily work summaries
  const recentSummaries = records
    .filter((r) => r.workSummary && r.workSummary.trim().length > 0)
    .slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner with Today's Punch In/Out & Leave Action */}
      <div className="bg-brand-navy rounded-2xl p-4 sm:p-6 text-white shadow-brand flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck2 className="w-5 h-5 text-brand-accent" />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Daily Attendance & Work Logs</h1>
          </div>
          <p className="text-[11px] sm:text-xs text-blue-200/90 mt-1">
            Official Shift: <strong className="text-white">10:00 AM – 5:30 PM</strong> &bull; Late arrival: <strong className="text-amber-300">After 11:30 AM</strong> &bull; Half Day: <strong className="text-orange-300">Checkout before 4:30 PM</strong>
          </p>
        </div>

        {/* Live Punch Clock Widget & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-4 bg-white/10 p-3 rounded-2xl border border-white/10">
          <div className="text-left sm:text-right">
            <p className="text-[10px] text-blue-200 uppercase font-semibold">Today's Status</p>
            <p className="text-base sm:text-lg font-mono font-black text-white">{liveDuration}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPunchModal()}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-brand transition-all active:scale-95 ${
                isOnLeave
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : hasPunchedOut
                  ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                  : hasPunchedIn
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white animate-pulse'
              }`}
            >
              {isOnLeave ? (
                <>
                  <CalendarOff className="w-4 h-4" />
                  <span>On Leave Today</span>
                </>
              ) : hasPunchedOut ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Shift Completed</span>
                </>
              ) : hasPunchedIn ? (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Punch Out / EOD</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Punch In Now</span>
                </>
              )}
            </button>

            {!isOnLeave && !hasPunchedIn && (
              <button
                onClick={() => onOpenPunchModal()}
                className="px-3.5 py-2.5 rounded-xl font-bold text-xs bg-white/15 hover:bg-white/25 text-white border border-white/20 flex items-center gap-1.5 transition-all"
                title="Apply for Leave"
              >
                <CalendarOff className="w-3.5 h-3.5 text-purple-300" />
                <span className="hidden sm:inline">Take Leave</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Team Attendance KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Team Members</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{stats.totalEmployees}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Active workforce</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Punched In Today</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{stats.punchedInCount}</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">{stats.totalPresent} on-time arrivals</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase">Late Arrivals</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{stats.totalLate}</p>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">Punched in after 11:30 AM</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-orange-700 uppercase">Half Day Shifts</span>
          <p className="text-2xl font-black text-orange-700 mt-1">{stats.totalHalfDay}</p>
          <p className="text-[10px] text-orange-600 font-medium mt-0.5">Checkout before 4:30 PM</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs col-span-2 md:col-span-1">
          <span className="text-[11px] font-bold text-purple-700 uppercase">On Leave Today</span>
          <p className="text-2xl font-black text-purple-700 mt-1">{stats.totalLeave || 0}</p>
          <p className="text-[10px] text-purple-600 font-medium mt-0.5">Approved leave logs</p>
        </div>
      </div>

      {/* Admin Monthly Calendar Sheet */}
      <AttendanceCalendar />

      {/* Recent Daily Work Summaries List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-accent" />
            <h3 className="font-bold text-sm text-slate-800">Recent Employee EOD Work & Leave Logs</h3>
          </div>
          <span className="text-xs text-slate-400">Verified System Records</span>
        </div>

        <div className="space-y-3">
          {recentSummaries.length > 0 ? (
            recentSummaries.map((record) => (
              <div
                key={record._id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:bg-white transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{record.userName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-brand-navy border border-blue-200">
                      {record.userRole}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      record.status === 'Leave'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : record.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : record.status === 'Late'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-orange-100 text-orange-800 border border-orange-200'
                    }`}>
                      {record.status}
                    </span>
                    <span className="text-[11px] text-slate-400">({record.date})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                    {record.status === 'Leave' ? (
                      <span className="font-sans text-purple-700 font-semibold text-[11px]">{record.leaveType || 'Leave Granted'}</span>
                    ) : (
                      <>
                        <span>In: {record.punchIn ? new Date(record.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                        <span>&bull;</span>
                        <span>Out: {record.punchOut ? new Date(record.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}</span>
                        <span className="font-bold text-brand-navy font-sans">({record.durationHours || 0} hrs)</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                  "{record.workSummary}"
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No shift or leave records submitted yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
