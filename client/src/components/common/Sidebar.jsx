import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLeads } from '../../context/LeadContext';
import { ROLES } from '../../types/constants';
import Logo from './Logo';
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  CalendarCheck2,
  BarChart3,
  CheckSquare,
  ShieldAlert,
  ChevronRight,
  Headphones,
  Upload,
  UserPlus,
  LogOut,
  X
} from 'lucide-react';

export const Sidebar = ({ onOpenCsvModal, isOpen, onClose }) => {
  const { currentUser, isAdmin, isCaller, logout } = useAuth();
  const { accessibleLeads } = useLeads();
  const location = useLocation();

  const pendingCallsCount = accessibleLeads.filter(
    (l) => l.status === 'New' || l.status === 'Callback Required'
  ).length;

  const navItems = [
    {
      name: isAdmin ? 'Admin Console' : isCaller ? 'Caller Station' : 'IT Workspace',
      to: '/',
      icon: LayoutDashboard,
      roles: [ROLES.SUPER_ADMIN, ROLES.CALLER, ROLES.EMPLOYEE],
    },
    {
      name: 'Telecalling Screen',
      to: '/calling',
      icon: PhoneCall,
      roles: [ROLES.SUPER_ADMIN, ROLES.CALLER],
      badge: isCaller && pendingCallsCount > 0 ? `${pendingCallsCount} Due` : null,
      highlight: true,
    },
    {
      name: isAdmin ? 'Leads Management' : 'My Assigned Leads',
      to: '/leads',
      icon: Users,
      roles: [ROLES.SUPER_ADMIN, ROLES.CALLER],
    },
    {
      name: 'Team & Callers',
      to: '/team',
      icon: UserPlus,
      roles: [ROLES.SUPER_ADMIN],
    },
    {
      name: 'Attendance & HRMS',
      to: '/attendance',
      icon: CalendarCheck2,
      roles: [ROLES.SUPER_ADMIN, ROLES.CALLER, ROLES.EMPLOYEE],
    },
    {
      name: 'Team Analytics',
      to: '/analytics',
      icon: BarChart3,
      roles: [ROLES.SUPER_ADMIN],
    },
    {
      name: 'Tasks & Ops',
      to: '/tasks',
      icon: CheckSquare,
      roles: [ROLES.SUPER_ADMIN, ROLES.CALLER, ROLES.EMPLOYEE],
    },
  ];

  const allowedNav = navItems.filter((item) => item.roles.includes(currentUser?.role));

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 lg:w-64 bg-brand-navy border-r border-brand-navy-light flex flex-col justify-between shrink-0 select-none shadow-brand transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between">
            <Logo variant="dark" size="md" />
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Admin Action: Upload CSV button in sidebar if Admin */}
          {isAdmin && onOpenCsvModal && (
            <div className="px-4 pt-4 pb-2">
              <button
                onClick={() => {
                  if (onClose) onClose();
                  onOpenCsvModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-brand-accent hover:bg-brand-accent-hover text-white shadow-brand transition-all transform active:scale-98"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Leads CSV</span>
              </button>
            </div>
          )}

          {/* Navigation List */}
          <nav className="p-3 space-y-1">
            <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-blue-200/50">
              Workspace
            </div>
            {allowedNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-accent text-white font-semibold shadow-accent-glow'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-400 text-slate-900 shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Caller Shift Summary / Telecaller Badge */}
      <div className="p-4 border-t border-white/10 bg-brand-navy-dark/60">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
            <Headphones className="w-4 h-4" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-blue-300/80 truncate">
              {isCaller ? 'Telecaller Online' : currentUser?.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors shrink-0"
            title="Sign Out / Back to Login"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-blue-200/60 px-1">
          <span>Qevnaro v1.0 Production</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>
      </div>
    </aside>
  </>
);
};

export default Sidebar;
