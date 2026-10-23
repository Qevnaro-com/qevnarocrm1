import React from 'react';
import { useLeads } from '../../context/LeadContext';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { LEAD_STATUS } from '../../types/constants';
import {
  PhoneCall,
  TrendingUp,
  CheckCircle2,
  Clock,
  Users,
  Target,
  Award,
  BarChart3,
  Percent,
  CalendarCheck2
} from 'lucide-react';

export const AnalyticsDashboard = () => {
  const { leads, callers } = useLeads();
  const { users } = useAuth();
  const { getTodayTeamStats } = useAttendance();

  const teamStats = getTodayTeamStats();

  // Aggregate stats across leads
  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.status === LEAD_STATUS.CONVERTED).length;
  const interestedLeads = leads.filter((l) => l.status === LEAD_STATUS.INTERESTED).length;
  const callbackLeads = leads.filter((l) => l.status === LEAD_STATUS.CALLBACK_REQUIRED).length;
  const connectedLeads = leads.filter((l) => l.status === LEAD_STATUS.CONNECTED).length;
  const invalidLeads = leads.filter((l) => l.status === LEAD_STATUS.INVALID_NUMBER).length;
  const notInterestedLeads = leads.filter((l) => l.status === LEAD_STATUS.NOT_INTERESTED).length;
  const newLeads = leads.filter((l) => l.status === LEAD_STATUS.NEW).length;

  // Total call interactions logged in lead history
  const totalDialsLogged = leads.reduce((acc, lead) => acc + (lead.history?.length || 0), 0);

  // Conversion Rate
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

  // Metrics per caller
  const callerMetrics = callers.map((caller) => {
    const callerLeads = leads.filter((l) => l.assignedTo === caller._id);
    const totalAssigned = callerLeads.length;
    const closed = callerLeads.filter((l) => l.status === LEAD_STATUS.CONVERTED).length;
    const interested = callerLeads.filter((l) => l.status === LEAD_STATUS.INTERESTED).length;
    const callbacks = callerLeads.filter((l) => l.status === LEAD_STATUS.CALLBACK_REQUIRED).length;
    const connected = callerLeads.filter((l) => l.status === LEAD_STATUS.CONNECTED).length;
    const dials = callerLeads.reduce((acc, l) => acc + (l.history?.length || 0), 0);
    const callerConversionRate = totalAssigned > 0 ? ((closed / totalAssigned) * 100).toFixed(1) : '0';

    return {
      caller,
      totalAssigned,
      closed,
      interested,
      callbacks,
      connected,
      dials,
      conversionRate: callerConversionRate,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-brand-navy rounded-2xl p-6 text-white shadow-brand flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-accent" />
            <h2 className="text-xl font-bold tracking-tight text-white">Operations & Telecalling Intelligence</h2>
          </div>
          <p className="text-xs text-blue-200/80 mt-1">
            Real-time conversion pipeline, agent productivity, and attendance telemetry
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-right">
            <p className="text-[10px] text-blue-200 uppercase font-semibold">Active Callers</p>
            <p className="text-lg font-black text-white">{callers.length} On Duty</p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-brand-accent/20 border border-brand-accent/30 text-right">
            <p className="text-[10px] text-blue-200 uppercase font-semibold">Team Attendance</p>
            <p className="text-lg font-black text-emerald-400">
              {teamStats.totalEmployees > 0
                ? `${Math.round((teamStats.punchedInCount / teamStats.totalEmployees) * 100)}%`
                : '100%'}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Total Leads</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-accent flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalLeads}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{newLeads} untouched leads</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Dials Logged</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalDialsLogged}</p>
          <p className="text-[11px] text-sky-600 font-semibold mt-0.5">{connectedLeads} connected calls</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Converted Deals</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700 mt-2">{convertedLeads}</p>
          <p className="text-[11px] text-purple-600 font-semibold mt-0.5">{conversionRate}% conversion rate</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Callbacks Due</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{callbackLeads}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-0.5">High priority follow-ups</p>
        </div>
      </div>

      {/* Main Breakdown: Caller Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base text-slate-800">Telecaller Performance Leaderboard</h3>
            <p className="text-xs text-slate-500">Breakdown of total dials, positive interest, callbacks, and closed accounts</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Telecaller</th>
                <th className="p-3 text-center">Assigned Leads</th>
                <th className="p-3 text-center">Total Dials</th>
                <th className="p-3 text-center">Connected</th>
                <th className="p-3 text-center">Interested</th>
                <th className="p-3 text-center">Callbacks</th>
                <th className="p-3 text-center">Converted</th>
                <th className="p-3 text-center">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {callerMetrics.length > 0 ? (
                callerMetrics.map((item) => (
                  <tr key={item.caller._id} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.caller.avatar}
                          alt={item.caller.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-800 leading-tight">{item.caller.name}</p>
                          <p className="text-[10px] text-slate-400">{item.caller.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-700">{item.totalAssigned}</td>
                    <td className="p-3 text-center font-mono font-bold text-blue-600 bg-blue-50/40">
                      {item.dials}
                    </td>
                    <td className="p-3 text-center font-mono text-sky-700">{item.connected}</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-600">
                      {item.interested}
                    </td>
                    <td className="p-3 text-center font-mono text-amber-700">{item.callbacks}</td>
                    <td className="p-3 text-center font-mono font-bold text-purple-700 bg-purple-50/40">
                      {item.closed}
                    </td>
                    <td className="p-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        {item.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No telecallers currently registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Funnel Pipeline Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-sm text-slate-800">Lead Conversion Funnel</h4>
          <div className="space-y-3">
            {[
              { label: 'Total Leads In System', count: totalLeads, color: 'bg-brand-navy', pct: 100 },
              {
                label: 'Connected / Contacted',
                count: connectedLeads + interestedLeads + callbackLeads + convertedLeads,
                color: 'bg-sky-500',
                pct: totalLeads ? Math.round(((connectedLeads + interestedLeads + callbackLeads + convertedLeads) / totalLeads) * 100) : 0,
              },
              {
                label: 'High Interest & In Pipeline',
                count: interestedLeads,
                color: 'bg-emerald-500',
                pct: totalLeads ? Math.round((interestedLeads / totalLeads) * 100) : 0,
              },
              {
                label: 'Converted Accounts',
                count: convertedLeads,
                color: 'bg-purple-600',
                pct: totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0,
              },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{step.label}</span>
                  <span>{step.count} ({step.pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className={`${step.color} h-full rounded-full transition-all duration-500`} style={{ width: `${step.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Status Distribution Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-sm text-slate-800">Status Distribution Breakdown</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-[10px] font-bold text-blue-700 uppercase">New Leads</span>
              <p className="text-xl font-black text-blue-900 mt-1">{newLeads}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 uppercase">Interested</span>
              <p className="text-xl font-black text-emerald-900 mt-1">{interestedLeads}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Callbacks</span>
              <p className="text-xl font-black text-amber-900 mt-1">{callbackLeads}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
              <span className="text-[10px] font-bold text-purple-700 uppercase">Converted</span>
              <p className="text-xl font-black text-purple-900 mt-1">{convertedLeads}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Not Interested</span>
              <p className="text-xl font-black text-rose-900 mt-1">{notInterestedLeads}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-700 uppercase">Invalid Numbers</span>
              <p className="text-xl font-black text-slate-900 mt-1">{invalidLeads}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
