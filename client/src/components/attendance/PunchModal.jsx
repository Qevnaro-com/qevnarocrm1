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
  Sparkles
} from 'lucide-react';

export const PunchModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const {
    todayRecord,
    hasPunchedIn,
    hasPunchedOut,
    liveDuration,
    punchIn,
    punchOut,
  } = useAttendance();

  const [workSummary, setWorkSummary] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handlePunchIn = async () => {
    setErrorMsg('');
    const res = await punchIn();
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

    const res = await punchOut(workSummary);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-brand-lg border border-slate-200 overflow-hidden max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-brand-navy text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-brand-accent flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Daily Attendance & Punch Clock</h3>
              <p className="text-[10px] sm:text-xs text-blue-200/80">Employee Working Hours & EOD Task Checkout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Status Alert Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Status Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Today's Date</p>
              <p className="text-sm font-black text-slate-800">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-xs text-slate-500 mt-1">Logged in as: <strong className="text-brand-navy">{currentUser?.name}</strong></p>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Active Time</p>
              <p className="text-xl font-mono font-black text-brand-accent">{liveDuration}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                hasPunchedOut
                  ? 'bg-slate-200 text-slate-700'
                  : hasPunchedIn
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {hasPunchedOut ? 'Completed Shift' : hasPunchedIn ? 'Currently Active' : 'Not Punched In'}
              </span>
            </div>
          </div>

          {/* CASE 1: NOT PUNCHED IN YET */}
          {!hasPunchedIn && (
            <div className="space-y-4 text-center py-2">
              <p className="text-xs text-slate-600">
                Click below to record your start time for the day. Duplicate punch-ins on the same calendar day are prevented.
              </p>
              <button
                onClick={handlePunchIn}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-brand-navy hover:bg-brand-navy-light text-white shadow-brand flex items-center justify-center gap-2 transition-all transform hover:scale-101 active:scale-98"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Punch In Now</span>
              </button>
            </div>
          )}

          {/* CASE 2: PUNCHED IN, READY FOR END-OF-DAY CHECKOUT */}
          {hasPunchedIn && !hasPunchedOut && (
            <form onSubmit={handlePunchOut} className="space-y-4">
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
                  placeholder="e.g. Completed 45 calls, 6 callbacks scheduled, converted 1 enterprise lead, updated CRM records..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">Punched in at {new Date(todayRecord?.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-2 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Submit Summary & Punch Out</span>
                </button>
              </div>
            </form>
          )}

          {/* CASE 3: ALREADY PUNCHED OUT TODAY */}
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
        </div>
      </div>
    </div>
  );
};

export default PunchModal;
