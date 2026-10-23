import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLeads } from '../../context/LeadContext';
import { useAttendance } from '../../context/AttendanceContext';
import { LEAD_STATUS, LEAD_STATUS_CONFIG } from '../../types/constants';
import { Link, useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  Phone,
  Clock,
  Award,
  Users,
  Copy,
  Check,
  CalendarCheck2,
  ArrowRight,
  Headphones,
  CheckCircle2,
  Sparkles,
  Zap,
  Building2,
  Tag
} from 'lucide-react';

export const CallerDashboardView = ({ onOpenPunchModal }) => {
  const { currentUser } = useAuth();
  const { accessibleLeads = [], currentLeadIndex, setCurrentLeadIndex } = useLeads();
  const { hasPunchedIn, hasPunchedOut, liveDuration } = useAttendance();
  const navigate = useNavigate();

  const [copiedPhone, setCopiedPhone] = useState(null);

  const safeLeads = Array.isArray(accessibleLeads) ? accessibleLeads : [];

  const handleCopy = (phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Metrics for current caller
  const myTotalLeads = safeLeads.length;
  const myNewLeads = safeLeads.filter((l) => l.status === LEAD_STATUS.NEW);
  const myCallbacks = safeLeads.filter((l) => l.status === LEAD_STATUS.CALLBACK_REQUIRED);
  const myInterested = safeLeads.filter((l) => l.status === LEAD_STATUS.INTERESTED);
  const myConverted = safeLeads.filter((l) => l.status === LEAD_STATUS.CONVERTED);

  // Jump to specific lead in telecalling deck
  const handleDialLead = (leadId) => {
    const idx = accessibleLeads.findIndex((l) => l._id === leadId);
    if (idx !== -1) {
      setCurrentLeadIndex(idx);
    }
    navigate('/calling');
  };

  // My recent interactions
  const myRecentEvents = [];
  safeLeads.forEach((lead) => {
    if (lead.history) {
      lead.history.forEach((h) => {
        if (h.callerId === currentUser?._id || h.callerName === currentUser?.name) {
          myRecentEvents.push({
            ...h,
            leadName: lead.name,
            leadPhone: lead.phone,
            leadId: lead._id,
            leadService: lead.serviceCategory || lead.service || 'IT Solutions',
          });
        }
      });
    }
  });
  myRecentEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  const latestMyEvents = myRecentEvents.slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* High-Impact Hero Calling Station */}
      <div className="bg-gradient-to-r from-brand-navy via-brand-navy-light to-brand-navy rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-brand relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-accent/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-semibold text-blue-200">
              <Headphones className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
              <span>Telecaller Outreach Deck</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Welcome, {currentUser?.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-xl">
              You have <span className="font-bold text-white">{myNewLeads.length} new leads</span> ready for dialing, and{' '}
              <span className="font-bold text-amber-300">{myCallbacks.length} scheduled callbacks</span> awaiting your call today.
            </p>
          </div>

          {/* Quick Calling CTAs */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/calling"
              className="flex-1 sm:flex-initial justify-center px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-brand-accent hover:bg-brand-accent-hover text-white shadow-accent-glow flex items-center gap-2 transition-all active:scale-95"
            >
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
              <span>Launch Calling Deck</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>

            <Link
              to="/leads"
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>My Leads ({myTotalLeads})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Caller KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Assigned */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Queue</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-brand-accent flex items-center justify-center">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">{myTotalLeads}</p>
            <p className="text-[10px] sm:text-xs text-blue-600 font-semibold mt-0.5">
              {myNewLeads.length} fresh leads
            </p>
          </div>
        </div>

        {/* Callbacks Due */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Callbacks</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-700">{myCallbacks.length}</p>
            <p className="text-[10px] sm:text-xs text-amber-600 font-semibold mt-0.5">
              Due today
            </p>
          </div>
        </div>

        {/* Converted */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Converted</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-700">{myConverted.length}</p>
            <p className="text-[10px] sm:text-xs text-purple-600 font-semibold mt-0.5">
              {myInterested.length} interested
            </p>
          </div>
        </div>

        {/* Shift Clock */}
        <div
          onClick={onOpenPunchModal}
          className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-brand-accent transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Shift</span>
            <div
              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${
                hasPunchedIn ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-mono font-black text-brand-navy truncate">
              {liveDuration.slice(0, 8)}
            </p>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-600">
                {hasPunchedOut ? 'Completed' : hasPunchedIn ? 'Active' : 'Punch In'}
              </span>
              <span className="text-[9px] sm:text-[10px] text-brand-accent font-bold group-hover:underline">Clock &rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Scheduled Callbacks + Up Next in Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Callbacks & Scheduled Follow-ups */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-800">
                  Priority Callbacks & Scheduled Follow-ups ({myCallbacks.length})
                </h3>
              </div>
              <Link to="/leads" className="text-xs font-semibold text-brand-accent hover:underline">
                View All Leads &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {myCallbacks.length > 0 ? (
                myCallbacks.map((lead) => (
                  <div
                    key={lead._id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{lead.name}</span>
                        {lead.company && (
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {lead.company}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="font-mono font-bold text-brand-navy">{lead.phone}</span>
                        <button
                          onClick={() => handleCopy(lead.phone)}
                          className="text-slate-400 hover:text-brand-accent p-0.5 rounded"
                          title="Copy phone"
                        >
                          {copiedPhone === lead.phone ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <span>&bull;</span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-brand-accent font-medium bg-blue-50 px-2 py-0.5 rounded">
                          <Tag className="w-2.5 h-2.5" />
                          {lead.serviceCategory || lead.service || 'IT Service'}
                        </span>
                      </div>

                      {lead.callbackDate && (
                        <p className="text-[11px] font-semibold text-amber-700 pt-0.5">
                          Follow-up Time: {new Date(lead.callbackDate).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      )}

                      {lead.notes && (
                        <p className="text-xs text-slate-500 italic line-clamp-1">
                          "{lead.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`tel:${lead.phone}`}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 shadow-xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-brand-accent" />
                        <span>Dial</span>
                      </a>

                      <button
                        onClick={() => handleDialLead(lead._id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-accent hover:bg-brand-accent-hover text-white flex items-center gap-1.5 shadow-brand"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Open Lead</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">No pending callbacks right now!</p>
                  <p className="text-[11px] text-slate-400 mt-1">Start dialing your fresh leads in queue.</p>
                </div>
              )}
            </div>
          </div>

          {/* Up Next in Queue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-brand-accent" />
                <h3 className="font-bold text-sm text-slate-800">Up Next in Your Calling Queue</h3>
              </div>
              <button
                onClick={() => navigate('/calling')}
                className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1"
              >
                <span>Dial Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {myNewLeads.slice(0, 4).map((lead) => (
                <div
                  key={lead._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:bg-blue-50/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-brand-accent flex items-center justify-center font-bold text-xs">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{lead.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {lead.city || 'India'} &bull; {lead.serviceCategory || lead.service || 'IT Project'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${lead.phone}`}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3 text-brand-accent" />
                      <span>{lead.phone}</span>
                    </a>
                    <button
                      onClick={() => handleDialLead(lead._id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white"
                    >
                      Call
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Personal Dial History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <h3 className="font-bold text-sm text-slate-800">My Call History</h3>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {latestMyEvents.length > 0 ? (
              latestMyEvents.map((event, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-navy">{event.leadName}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    {event.note || 'Dialed lead'}
                  </p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-accent text-white">
                      {event.toStatus}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                <p>No calls logged yet today.</p>
                <p className="text-[10px] mt-1 text-slate-400">Calls you make in Telecaller Mode will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallerDashboardView;
