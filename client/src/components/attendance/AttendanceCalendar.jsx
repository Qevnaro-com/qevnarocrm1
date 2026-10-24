import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';
import { ATTENDANCE_STATUS, ATTENDANCE_STATUS_CONFIG } from '../../types/constants';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  X
} from 'lucide-react';

export const AttendanceCalendar = () => {
  const { records } = useAttendance();
  const { users } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCellRecord, setSelectedCellRecord] = useState(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Number of days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Helper to find record for user on specific day
  const getRecordForDay = (userId, day) => {
    const dayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const userObj = users.find((u) => String(u._id) === String(userId));
    return records.find(
      (r) =>
        (String(r.userId) === String(userId) || (userObj && r.userName === userObj.name)) &&
        r.date === dayStr
    );
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3.5 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header with Month Selector and Legend */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">Monthly Team Attendance Sheet</h3>
          <p className="text-[11px] sm:text-xs text-slate-500">Comprehensive tabular overview of attendance status per team member</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Legend */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Present (P)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-amber-700" title="Punched in after 11:30 AM">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Late (L &gt; 11:30 AM)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-orange-700" title="Checked out before 4:30 PM or < 4 hrs">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              Half Day (HD &lt; 4:30 PM)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-purple-700" title="Approved leave request">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              Leave (LV)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
              Absent (A)
            </span>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2 min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabular Attendance Grid */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <th className="p-3 sticky left-0 bg-slate-50 z-10 min-w-[180px] border-r border-slate-200">
                Employee / Role
              </th>
              {daysArray.map((day) => {
                const dayDate = new Date(currentYear, currentMonth, day);
                const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === currentMonth &&
                  new Date().getFullYear() === currentYear;

                return (
                  <th
                    key={day}
                    className={`p-2 text-center min-w-[38px] border-r border-slate-200 ${
                      isToday
                        ? 'bg-blue-100 text-brand-navy font-black ring-1 ring-brand-accent'
                        : isWeekend
                        ? 'bg-slate-100/60 text-slate-400'
                        : ''
                    }`}
                  >
                    <div>{day}</div>
                    <div className="text-[9px] font-normal text-slate-400">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dayDate.getDay()]}
                    </div>
                  </th>
                );
              })}
              <th className="p-3 text-center min-w-[70px]">Total P</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              let userPresentCount = 0;

              return (
                <tr key={user._id} className="hover:bg-slate-50/60">
                  {/* Sticky user info column */}
                  <td className="p-3 sticky left-0 bg-white z-10 border-r border-slate-200">
                    <div className="flex items-center gap-2">
                      <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                      <div>
                        <p className="font-bold text-slate-800 leading-tight">{user.name}</p>
                        <p className="text-[10px] text-slate-400">{user.role}</p>
                      </div>
                    </div>
                  </td>

                  {/* Day cells */}
                  {daysArray.map((day) => {
                    const record = getRecordForDay(user._id, day);
                    const dayDate = new Date(currentYear, currentMonth, day);
                    const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;

                    let badgeContent = '—';
                    let badgeClass = 'text-slate-300';

                    if (record) {
                      if (record.status === ATTENDANCE_STATUS.PRESENT) {
                        badgeContent = 'P';
                        badgeClass = 'bg-emerald-100 text-emerald-800 font-bold border-emerald-300';
                        userPresentCount++;
                      } else if (record.status === ATTENDANCE_STATUS.LATE) {
                        badgeContent = 'L';
                        badgeClass = 'bg-amber-100 text-amber-800 font-bold border-amber-300';
                        userPresentCount++;
                      } else if (record.status === ATTENDANCE_STATUS.HALF_DAY) {
                        badgeContent = 'HD';
                        badgeClass = 'bg-orange-100 text-orange-800 font-bold border-orange-300';
                        userPresentCount += 0.5;
                      } else if (record.status === ATTENDANCE_STATUS.LEAVE) {
                        badgeContent = 'LV';
                        badgeClass = 'bg-purple-100 text-purple-800 font-bold border-purple-300';
                      } else if (record.status === ATTENDANCE_STATUS.ABSENT) {
                        badgeContent = 'A';
                        badgeClass = 'bg-rose-100 text-rose-800 font-bold border-rose-300';
                      }
                    } else if (isWeekend) {
                      badgeContent = 'OFF';
                      badgeClass = 'text-slate-300 text-[9px] font-mono';
                    }

                    return (
                      <td
                        key={day}
                        onClick={() => record && setSelectedCellRecord({ ...record, user })}
                        className={`p-1 text-center border-r border-slate-100 ${
                          record ? 'cursor-pointer hover:bg-blue-50/50' : ''
                        }`}
                      >
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] border ${badgeClass}`}
                        >
                          {badgeContent}
                        </span>
                      </td>
                    );
                  })}

                  <td className="p-3 text-center font-bold text-brand-navy bg-slate-50/50">
                    {userPresentCount}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drill-down modal when clicking on a specific attendance day record */}
      {selectedCellRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-brand-lg border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedCellRecord.user?.avatar}
                  alt={selectedCellRecord.userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-800">{selectedCellRecord.userName}</h4>
                  <p className="text-[11px] text-slate-500">
                    {new Date(selectedCellRecord.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCellRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  selectedCellRecord.status === 'Present'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedCellRecord.status === 'Late'
                    ? 'bg-amber-100 text-amber-800'
                    : selectedCellRecord.status === 'Leave'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {selectedCellRecord.status}
                </span>
              </div>

              {selectedCellRecord.status === 'Leave' ? (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Leave Type:</span>
                    <span className="font-semibold text-purple-700">
                      {selectedCellRecord.leaveType || 'Full Day Leave'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Leave Status:</span>
                    <span className="font-semibold text-slate-700">Approved</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Punch In:</span>
                    <span className="font-mono font-medium">
                      {selectedCellRecord.punchIn
                        ? new Date(selectedCellRecord.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Punch Out:</span>
                    <span className="font-mono font-medium">
                      {selectedCellRecord.punchOut
                        ? new Date(selectedCellRecord.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Active / In Progress'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Total Hours:</span>
                    <span className="font-bold text-brand-navy">
                      {selectedCellRecord.durationHours ? `${selectedCellRecord.durationHours} hrs` : 'In Progress'}
                    </span>
                  </div>
                </>
              )}
            </div>

            {(selectedCellRecord.leaveReason || selectedCellRecord.workSummary) && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {selectedCellRecord.status === 'Leave' ? 'Reason for Leave:' : 'Daily Work Summary:'}
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedCellRecord.leaveReason || selectedCellRecord.workSummary}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;
