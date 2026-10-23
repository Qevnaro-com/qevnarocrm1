import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { ROLES } from '../../types/constants';
import {
  Bell,
  Clock,
  UserCheck,
  ChevronDown,
  LogOut,
  Sparkles,
  PhoneCall,
  Search,
  CheckCircle2,
  AlertCircle,
  Menu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

export const Navbar = ({ onOpenPunchModal, onToggleMobileSidebar }) => {
  const { currentUser, logout, isAdmin, isCaller } = useAuth();
  const { hasPunchedIn, hasPunchedOut, liveDuration } = useAttendance();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-4 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Menu Trigger + Search or Brand */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md">
        {/* Mobile Hamburger Drawer Trigger */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden flex items-center justify-center shrink-0 active:scale-95 transition-all"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 text-brand-navy" />
        </button>

        {/* Mobile Logo Mark */}
        <div className="lg:hidden shrink-0">
          <Link to="/" className="flex items-center">
            <span className="font-black text-sm text-brand-navy tracking-tight">Qevnaro<span className="text-brand-accent">CRM</span></span>
          </Link>
        </div>

        {/* Desktop Search input */}
        <div className="relative w-full hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, phone number, client..."
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Rapid Calling Shortcut for Callers & Admins */}
        {(isAdmin || isCaller) && (
          <Link
            to="/calling"
            className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-brand-accent border border-blue-200 hover:bg-blue-100 transition-colors shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
            <span>Telecaller Mode</span>
          </Link>
        )}

        {/* Live Attendance Status Widget */}
        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
          <button
            onClick={onOpenPunchModal}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium border transition-all ${
              hasPunchedOut
                ? 'bg-slate-100 text-slate-700 border-slate-200'
                : hasPunchedIn
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 shadow-xs'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 animate-pulse'
            }`}
            title="Click to manage Punch-in / Punch-out"
          >
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${
                hasPunchedOut
                  ? 'bg-slate-400'
                  : hasPunchedIn
                  ? 'bg-emerald-500 animate-ping'
                  : 'bg-amber-500'
              }`}
            />
            <Clock className="w-3.5 h-3.5 shrink-0 hidden sm:inline" />
            <span className="font-semibold truncate max-w-[110px] sm:max-w-none">
              {hasPunchedOut
                ? 'Checked Out'
                : hasPunchedIn
                ? `In (${liveDuration.slice(0, 5)})`
                : 'Punch In'}
            </span>
          </button>
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="text-right hidden lg:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</p>
              <p className="text-[10px] text-brand-accent font-medium leading-none">{currentUser?.role}</p>
            </div>
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-slate-100"
            />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-brand-lg border border-slate-200 py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser?.email}</p>
                <div className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-navy text-white">
                  {currentUser?.role}
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
