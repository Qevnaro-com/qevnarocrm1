import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  LogOut,
  LogIn,
  Calendar,
  Sparkles,
  CalendarOff,
  Sun,
  AlertTriangle,
  Info
} from 'lucide-react';

export const PunchModal = ({ isOpen, onClose, initialTab = 'punch' }) => {
  const { currentUser, isAdmin } = useAuth();
  const {
    todayRecord,
    hasPunchedIn,
    hasPunchedOut,
    isOnLeave,
    liveDuration,
    punchIn,
    punchOut,
    applyLeave,
  } = useAttendance();

  const [activeTab, setActiveTab] = useState(initialTab); // 'punch' or 'leave'
  const [workSummary, setWorkSummary] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [leaveDate, setLeaveDate] = useState(
    new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())
  );
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate current IST hours and minutes for live warnings
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
  });
  const parts = istFormatter.formatToParts(now);
  const currentHours = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const currentMinutes = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);

  const isAfterLateCutoff = currentHours > 11 || (currentHours === 11 && currentMinutes >= 30);
  const isBeforeShiftStart = currentHours < 10;
  const isBeforeHalfDayCutoff = currentHours < 16 || (currentHours === 16 && currentMinutes < 30); // Before 4:30 PM

  const handlePunchIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    const res = await punchIn();
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    }
  };

  const handlePunchOut = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!workSummary.trim() || workSummary.trim().length < 10) {
      setErrorMsg('Mandatory: Please describe your tasks and accomplishments today (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    const res = await punchOut(workSummary);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!leaveReason.trim()) {
      setErrorMsg('Please provide a reason for taking leave.');
      return;
    }

    setIsSubmitting(true);
    const res = await applyLeave({
      date: leaveDate,
      leaveReason: leaveReason.trim(),
      leaveType,
    });
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessMsg(res.message);
      setLeaveReason('');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-brand-lg border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-brand-navy text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-accent flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Daily Attendance & Work Shift</h3>
              <p className="text-[10px] sm:text-xs text-blue-200/80">Shift: 10:00 AM – 5:30 PM &bull; Leave & Punch Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        {!isOnLeave && (
          <div className="flex border-b border-slate-200 bg-slate-50/80 shrink-0">
            <button
              type="button"
              onClick={() => { setActiveTab('punch'); setErrorMsg(''); }}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'punch'
                  ? 'border-brand-accent text-brand-navy bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-brand-accent" />
              <span>Shift Punch Clock</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('leave'); setErrorMsg(''); }}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === 'leave'
                  ? 'border-purple-600 text-purple-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CalendarOff className="w-3.5 h-3.5 text-purple-600" />
              <span>Apply for Leave</span>
            </button>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Status Alert Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Shift Timings & Guidelines Box */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-slate-700 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-brand-navy">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                Office Shift Schedule
              </span>
              <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-brand-accent">
                10:00 AM – 05:30 PM
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-blue-100 text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span>Punch in after <strong>11:30 AM</strong>: Marked <strong>Late</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                <span>Punch out before <strong>04:30 PM</strong>: Marked <strong>Half Day</strong></span>
              </div>
            </div>
          </div>

          {/* Current Status Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Today's Date</p>
              <p className="text-xs sm:text-sm font-black text-slate-800">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Logged in as: <strong className="text-brand-navy">{currentUser?.name}</strong></p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Active Time</p>
              <p className="text-lg sm:text-xl font-mono font-black text-brand-accent">{liveDuration}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                isOnLeave
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : hasPunchedOut
                  ? 'bg-slate-200 text-slate-700'
                  : hasPunchedIn
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isOnLeave ? 'On Leave' : hasPunchedOut ? 'Completed Shift' : hasPunchedIn ? 'Currently Active' : 'Not Punched In'}
              </span>
            </div>
          </div>

          {/* CASE 0: USER IS ON LEAVE TODAY */}
          {isOnLeave && (
            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <CalendarOff className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-purple-900">You are On Leave Today</h4>
                <p className="text-xs text-purple-700 mt-0.5">
                  Type: <strong className="font-semibold">{todayRecord?.leaveType || 'Full Day Leave'}</strong>
                </p>
              </div>
              {todayRecord?.leaveReason && (
                <div className="p-3 bg-white rounded-xl border border-purple-200 text-xs text-slate-700 text-left">
                  <span className="font-bold text-purple-900 block text-[10px] uppercase mb-1">Reason:</span>
                  <p>{todayRecord.leaveReason}</p>
                </div>
              )}
              <p className="text-[11px] text-purple-600">
                Attendance is marked as Leave. No shift punch is required today.
              </p>
            </div>
          )}

          {/* TAB 1: PUNCH CLOCK (IF NOT ON LEAVE) */}
          {!isOnLeave && activeTab === 'punch' && (
            <>
              {/* SUB-CASE 1: NOT PUNCHED IN YET */}
              {!hasPunchedIn && (
                <div className="space-y-4 text-center py-2">
                  {isBeforeShiftStart && (
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-2 text-left">
                      <Info className="w-4 h-4 shrink-0 text-blue-600" />
                      <span>Shift officially starts at 10:00 AM. Punching in now will be recorded as early on-time arrival.</span>
                    </div>
                  )}

                  {isAfterLateCutoff && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 text-left">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>Notice: It is past 11:30 AM. Punching in now will be recorded with <strong>Late</strong> status.</span>
                    </div>
                  )}

                  <p className="text-xs text-slate-600">
                    Click below to start your shift. Your timestamp will be recorded.
                  </p>

                  <button
                    disabled={isSubmitting}
                    onClick={handlePunchIn}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-brand-navy hover:bg-brand-navy-light text-white shadow-brand flex items-center justify-center gap-2 transition-all transform hover:scale-101 active:scale-98 disabled:opacity-50"
                  >
                    <LogIn className="w-4 h-4 text-emerald-400" />
                    <span>{isSubmitting ? 'Punching In...' : 'Punch In Shift'}</span>
                  </button>

                  <div className="pt-2 text-xs text-slate-500">
                    Need to take off today?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('leave')}
                      className="font-bold text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      Apply for Leave here &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-CASE 2: PUNCHED IN, READY FOR END-OF-DAY CHECKOUT */}
              {hasPunchedIn && !hasPunchedOut && (
                <form onSubmit={handlePunchOut} className="space-y-4">
                  {isBeforeHalfDayCutoff && (
                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-bold">Early Departure Alert</p>
                        <p className="text-[11px] text-orange-800 mt-0.5">
                          Punching out before <strong>4:30 PM</strong> will automatically mark your shift as <strong>Half Day</strong> as per company policy.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs">
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      Mandatory End-of-Day Checkout
                    </p>
                    <p>Company policy requires entering your daily work summary before punching out.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Daily Work Summary / Tasks Completed <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={workSummary}
                      onChange={(e) => setWorkSummary(e.target.value)}
                      placeholder="e.g. Completed 45 client calls, 6 callbacks scheduled, converted 1 enterprise IT lead, updated CRM records..."
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      Punched in at {new Date(todayRecord?.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {todayRecord?.status === 'Late' && ' (Late)'}
                    </span>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="py-2.5 px-5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Punching Out...' : 'Submit & Punch Out'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* SUB-CASE 3: ALREADY PUNCHED OUT TODAY */}
              {hasPunchedOut && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Punched In:</span>
                    <span className="font-semibold">{new Date(todayRecord.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Punched Out:</span>
                    <span className="font-semibold">{new Date(todayRecord.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Final Shift Status:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      todayRecord.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : todayRecord.status === 'Late'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {todayRecord.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Duration:</span>
                    <span className="font-bold text-brand-navy">{todayRecord.durationHours} Hours</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[11px] font-bold uppercase text-slate-500 mb-1">Submitted Work Summary:</p>
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                      {todayRecord.workSummary}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: APPLY FOR LEAVE (IF NOT ON LEAVE) */}
          {!isOnLeave && activeTab === 'leave' && (
            <form onSubmit={handleApplyLeave} className="space-y-4 py-1">
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-purple-900 text-xs">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <CalendarOff className="w-3.5 h-3.5 text-purple-600" />
                  Leave Request Application
                </p>
                <p className="text-purple-700">
                  Marking leave will set your attendance to <strong>Leave</strong>. You will not need to punch in on this date.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Select Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Leave Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-600"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Sick Leave">Sick Leave (Medical)</option>
                  <option value="Emergency Leave">Emergency / Urgent Work</option>
                  <option value="Compensatory Off">Compensatory Off</option>
                  <option value="Privilege Leave">Privilege Leave (Planned)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Reason for Leave <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Fever and doctor appointment / Personal family emergency..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('punch')}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  &larr; Back to Punch Clock
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-5 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <CalendarOff className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting Leave...' : 'Submit Leave'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PunchModal;
