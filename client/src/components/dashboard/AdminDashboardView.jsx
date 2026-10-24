import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLeads } from '../../context/LeadContext';
import { useAttendance } from '../../context/AttendanceContext';
import { LEAD_STATUS, LEAD_STATUS_CONFIG, ROLES } from '../../types/constants';
import { Link } from 'react-router-dom';
import {
  Users,
  PhoneCall,
  Award,
  CalendarCheck2,
  Upload,
  UserPlus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  Headphones,
  Laptop,
  Palette
} from 'lucide-react';

export const AdminDashboardView = ({ onOpenCsvModal, onOpenPunchModal }) => {
  const { currentUser, users = [] } = useAuth();
  const { leads = [] } = useLeads();
  const { records = [], liveDuration, hasPunchedIn } = useAttendance();

  // Metrics calculation
  const safeLeads = Array.isArray(leads) ? leads : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeRecords = Array.isArray(records) ? records : [];

  const totalLeads = safeLeads.length;
  const newLeadsCount = safeLeads.filter((l) => l.status === LEAD_STATUS.NEW).length;
  const interestedCount = safeLeads.filter((l) => l.status === LEAD_STATUS.INTERESTED).length;
  const callbacksDueCount = safeLeads.filter((l) => l.status === LEAD_STATUS.CALLBACK_REQUIRED).length;
  const convertedCount = safeLeads.filter((l) => l.status === LEAD_STATUS.CONVERTED).length;
  const conversionRate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(1) : 0;

  // Active Callers
  const callers = safeUsers.filter((u) => u.role === ROLES.CALLER && u.status === 'Active');
  const employees = safeUsers.filter((u) => u.role === ROLES.EMPLOYEE && u.status === 'Active');

  // Today's attendance stats
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const todayLogs = safeRecords.filter((r) => r.date === today);
  const presentCount = todayLogs.filter((r) => r.status === 'Present' || r.status === 'Late').length;

  // Recent timeline events
  const recentEvents = [];
  safeLeads.forEach((lead) => {
    if (lead.history) {
      lead.history.forEach((h) => {
        recentEvents.push({
          ...h,
          leadName: lead.name,
          leadPhone: lead.phone,
          leadId: lead._id,
          leadService: lead.serviceCategory || lead.service || 'IT Services',
        });
      });
    }
  });
  recentEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const latestEvents = recentEvents.slice(0, 6);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Super Admin Command Banner */}
      <div className="bg-gradient-to-r from-brand-navy via-brand-navy-light to-brand-navy rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-brand relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-semibold text-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
              <span>Super Admin Console</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Executive Overview &bull; {currentUser?.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-xl">
              Oversee company IT sales pipeline, telecaller outreach quotas, and team shift attendance across all departments.
            </p>
          </div>

          {/* Super Admin Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenCsvModal}
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs bg-brand-accent hover:bg-brand-accent-hover text-white shadow-brand flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV</span>
            </button>

            <Link
              to="/team"
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>IT Team</span>
            </Link>

            <Link
              to="/attendance"
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Attendance</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Leads */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Leads Pool</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-brand-accent flex items-center justify-center">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">{totalLeads}</p>
            <p className="text-[10px] sm:text-xs text-blue-600 font-semibold mt-0.5">
              {newLeadsCount} fresh leads
            </p>
          </div>
        </div>

        {/* Converted Deals */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Deals Closed</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-700">{convertedCount}</p>
            <p className="text-[10px] sm:text-xs text-purple-600 font-semibold mt-0.5">
              {conversionRate}% conversion
            </p>
          </div>
        </div>

        {/* Callbacks Scheduled */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Callbacks</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-700">{callbacksDueCount}</p>
            <p className="text-[10px] sm:text-xs text-amber-600 font-semibold mt-0.5">
              Follow-ups due
            </p>
          </div>
        </div>

        {/* Team Attendance Rate */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Shift</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-700">
              {presentCount} / {safeUsers.length}
            </p>
            <p className="text-[10px] sm:text-xs text-emerald-600 font-semibold mt-0.5">
              Punched in today
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline Status Breakdown Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800">IT Solutions Sales Pipeline Status</h3>
            <p className="text-xs text-slate-500">Live breakdown across all uploaded client leads</p>
          </div>
          <Link to="/leads" className="text-xs font-bold text-brand-accent hover:underline">
            Manage Leads Directory &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {Object.entries(LEAD_STATUS).map(([key, val]) => {
            const count = safeLeads.filter((l) => l.status === val).length;
            const cfg = LEAD_STATUS_CONFIG[val];
            return (
              <div
                key={key}
                className={`p-3 rounded-xl border ${cfg.border} ${cfg.bg} flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>
                    {cfg.label}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${cfg.badge}`} />
                </div>
                <p className={`text-xl font-black mt-2 ${cfg.text}`}>{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Telecaller Performance Table + Live Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Caller Operations Leaderboard */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Headphones className="w-4 h-4 text-brand-accent" />
              <h3 className="font-bold text-sm text-slate-800">Telecaller Performance & Quotas</h3>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-brand-accent hover:underline">
              Full Telecalling Analytics &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Caller Name</th>
                  <th className="py-2.5 px-3">Assigned Leads</th>
                  <th className="py-2.5 px-3">Interested</th>
                  <th className="py-2.5 px-3">Converted</th>
                  <th className="py-2.5 px-3">Callbacks</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {callers.length > 0 ? (
                  callers.map((caller) => {
                    const callerLeads = safeLeads.filter((l) => l.assignedTo === caller._id);
                    const interested = callerLeads.filter((l) => l.status === LEAD_STATUS.INTERESTED).length;
                    const converted = callerLeads.filter((l) => l.status === LEAD_STATUS.CONVERTED).length;
                    const callbacks = callerLeads.filter((l) => l.status === LEAD_STATUS.CALLBACK_REQUIRED).length;

                    return (
                      <tr key={caller._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={caller.avatar}
                              alt={caller.name}
                              className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{caller.name}</p>
                              <p className="text-[10px] text-slate-400">{caller.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {callerLeads.length} leads
                        </td>
                        <td className="py-3 px-3 text-emerald-700 font-bold">{interested}</td>
                        <td className="py-3 px-3 text-purple-700 font-bold">{converted}</td>
                        <td className="py-3 px-3 text-amber-700 font-bold">{callbacks}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 text-xs">
                      No active telecallers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Quick IT Staff Directory overview */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              IT Specialists: {employees.length} Engineers & Designers active
            </span>
            <Link to="/team" className="font-bold text-brand-accent hover:underline">
              View All Employees &rarr;
            </Link>
          </div>
        </div>

        {/* Right Col: Live Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <h3 className="font-bold text-sm text-slate-800">Live Team Feed</h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {latestEvents.length > 0 ? (
              latestEvents.map((event, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{event.callerName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Spoke with <strong className="text-brand-navy">{event.leadName}</strong> ({event.leadService}): {event.note}
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-navy text-white">
                      {event.toStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No recent interactions logged.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardView;
