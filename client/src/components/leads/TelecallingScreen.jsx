import React, { useState, useEffect } from 'react';
import { useLeads } from '../../context/LeadContext';
import { useAuth } from '../../context/AuthContext';
import { LEAD_STATUS, LEAD_STATUS_CONFIG } from '../../types/constants';
import {
  Phone,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Building,
  Mail,
  User,
  History,
  Send,
  AlertCircle,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  MessageCircle,
  X,
  ExternalLink,
} from 'lucide-react';

const getCleanWhatsAppPhone = (phone) => {
  if (!phone) return '';
  let clean = phone.replace(/[^\d]/g, '');
  if (clean.length === 10) {
    clean = '91' + clean;
  }
  return clean;
};

const WHATSAPP_TEMPLATES = [
  {
    id: 'intro',
    title: '👋 Introduction & Free Consultation',
    template: (lead, caller) =>
      `Hello ${lead?.name || 'Sir/Madam'},\n\nThis is ${caller?.name || 'our team'} from Qevnaro IT Solutions. We received your inquiry regarding *${lead?.service || 'Custom IT & Web Development'}*.\n\nWe would love to connect for a quick 5-minute discussion to understand your project scope and provide a free estimate.\n\nPlease let us know what time works best for you today.\n\nBest regards,\n${caller?.name || 'Qevnaro Team'}\nQevnaro IT Solutions`,
  },
  {
    id: 'callback',
    title: '⏰ Scheduled Callback Follow-up',
    template: (lead, caller) =>
      `Hi ${lead?.name || 'there'},\n\nFollowing up as requested regarding your *${lead?.service || 'IT'}* project with Qevnaro.\n\nAre you available for a brief phone or Google Meet call today?\n\nLooking forward to hearing from you,\n${caller?.name || 'Qevnaro Team'}`,
  },
  {
    id: 'portfolio',
    title: '📁 Portfolio & Proposal Link',
    template: (lead, caller) =>
      `Hello ${lead?.name || 'Sir/Madam'},\n\nSharing our latest portfolio of high-performance React/Next.js web apps and UI/UX designs for ${lead?.company || 'your brand'}:\n🌐 https://qevnaro.com/portfolio\n\nLet us know if you would like to see a custom proposal tailored for your project.\n\nBest regards,\n${caller?.name || 'Qevnaro Team'}`,
  },
];

export const TelecallingScreen = () => {
  const { accessibleLeads, updateLeadStatus, addLeadNote } = useLeads();
  const { currentUser } = useAuth();

  // Active queue index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [callbackDateTime, setCallbackDateTime] = useState('');
  const [statusError, setStatusError] = useState('');
  const [statusSuccessMessage, setStatusSuccessMessage] = useState('');

  // WhatsApp template modal states
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('intro');
  const [customWhatsAppMsg, setCustomWhatsAppMsg] = useState('');

  // Filter queue: uncalled / callback leads first, or all assigned leads
  const activeLead = accessibleLeads[currentIndex] || null;

  // Sync state when activeLead changes
  useEffect(() => {
    if (activeLead) {
      setSelectedStatus(activeLead.status || LEAD_STATUS.NEW);
      setCallbackDateTime(activeLead.callbackDate || '');
      setNoteText('');
      setStatusError('');
      setStatusSuccessMessage('');
      setSelectedTemplateId('intro');
      setCustomWhatsAppMsg(WHATSAPP_TEMPLATES[0].template(activeLead, currentUser));
    }
  }, [currentIndex, activeLead?._id, currentUser]);

  // Handle Copy Number
  const handleCopyPhone = () => {
    if (!activeLead?.phone) return;
    navigator.clipboard.writeText(activeLead.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Status Update & Note submission
  const handleSaveInteraction = async (e) => {
    e?.preventDefault();
    setStatusError('');

    if (!activeLead) return;

    // Check if Callback Required has datetime
    if (selectedStatus === LEAD_STATUS.CALLBACK_REQUIRED && !callbackDateTime) {
      setStatusError('Please select a Follow-up Date & Time for this callback!');
      return;
    }

    await updateLeadStatus(
      activeLead._id,
      selectedStatus,
      noteText,
      selectedStatus === LEAD_STATUS.CALLBACK_REQUIRED ? callbackDateTime : null
    );

    setStatusSuccessMessage('Interaction logged successfully!');
    setTimeout(() => setStatusSuccessMessage(''), 2500);
    setNoteText('');
  };

  // Next & Previous Lead Navigation
  const handleNext = () => {
    if (currentIndex < accessibleLeads.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Telecalling Daily KPI counts for current user
  const totalAssigned = accessibleLeads.length;
  const convertedCount = accessibleLeads.filter((l) => l.status === LEAD_STATUS.CONVERTED).length;
  const interestedCount = accessibleLeads.filter((l) => l.status === LEAD_STATUS.INTERESTED).length;
  const callbackCount = accessibleLeads.filter((l) => l.status === LEAD_STATUS.CALLBACK_REQUIRED).length;
  const newCount = accessibleLeads.filter((l) => l.status === LEAD_STATUS.NEW).length;

  if (!activeLead) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center max-w-xl mx-auto my-12 border border-slate-200 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-brand-accent flex items-center justify-center mx-auto mb-4">
          <PhoneCall className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">No Leads in Calling Queue</h3>
        <p className="text-sm text-slate-500 mt-2">
          You currently have no leads assigned for telecalling. Upload a new CSV or request the Admin to assign leads.
        </p>
      </div>
    );
  }

  const currentStatusConfig = LEAD_STATUS_CONFIG[activeLead.status] || LEAD_STATUS_CONFIG[LEAD_STATUS.NEW];

  return (
    <div className="space-y-6">
      {/* Top Telecalling Stats Bar */}
      <div className="bg-brand-navy rounded-2xl p-3.5 sm:p-4 lg:p-5 text-white shadow-brand">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-accent flex items-center justify-center shadow-accent-glow shrink-0">
              <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">Telecalling Deck</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-200/70">
                Lead {currentIndex + 1} of {totalAssigned} &bull; 1-click calling active
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:flex items-center gap-2">
            <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 border border-white/10 text-center">
              <p className="text-[9px] sm:text-[10px] text-blue-200/80 uppercase font-semibold">Pending</p>
              <p className="text-xs sm:text-sm font-bold text-blue-300">{newCount}</p>
            </div>
            <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 border border-white/10 text-center">
              <p className="text-[9px] sm:text-[10px] text-blue-200/80 uppercase font-semibold">Callbacks</p>
              <p className="text-xs sm:text-sm font-bold text-amber-300">{callbackCount}</p>
            </div>
            <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 border border-white/10 text-center">
              <p className="text-[9px] sm:text-[10px] text-blue-200/80 uppercase font-semibold">Interested</p>
              <p className="text-xs sm:text-sm font-bold text-emerald-300">{interestedCount}</p>
            </div>
            <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 border border-white/10 text-center">
              <p className="text-[9px] sm:text-[10px] text-blue-200/80 uppercase font-semibold">Converted</p>
              <p className="text-xs sm:text-sm font-bold text-purple-300">{convertedCount}</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 sm:mt-4 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-brand-accent h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalAssigned) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Calling Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: High-Focus Lead Card + Big Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-brand overflow-hidden">
            {/* Card Header with Status & Navigation */}
            <div className="p-6 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${currentStatusConfig.bg} ${currentStatusConfig.text} ${currentStatusConfig.border} flex items-center gap-1.5`}
                >
                  <span className={`w-2 h-2 rounded-full ${currentStatusConfig.badge}`} />
                  {activeLead.status}
                </span>
                {activeLead.callbackDate && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Reminder: {new Date(activeLead.callbackDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                )}
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Previous Lead"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-slate-500">
                  {currentIndex + 1} / {totalAssigned}
                </span>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === accessibleLeads.length - 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  title="Next Lead"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lead Identity Details */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{activeLead.name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-slate-600 text-sm">
                    {activeLead.company && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <Building className="w-4 h-4 text-slate-400" />
                        {activeLead.company}
                      </span>
                    )}
                    {activeLead.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {activeLead.city}
                      </span>
                    )}
                  </div>
                </div>

                {/* Service Tag */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-brand-navy border border-blue-100 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
                  <span>{activeLead.service || 'CRM Inquiries'}</span>
                </div>
              </div>

              {/* PRIMARY ACTION BUTTONS: [Click to Call] and [Copy Number] */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-brand-navy to-brand-navy-light text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-brand">
                <div>
                  <p className="text-[10px] sm:text-xs text-blue-200 font-semibold uppercase tracking-wider">Contact Number</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide font-mono mt-0.5">
                    {activeLead.phone || 'No phone provided'}
                  </p>
                  {activeLead.email && (
                    <p className="text-xs text-blue-200/80 flex items-center gap-1.5 mt-1">
                      <Mail className="w-3 h-3" />
                      {activeLead.email}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                  {/* One-Click Copy Button */}
                  <button
                    onClick={handleCopyPhone}
                    className={`flex-1 sm:flex-initial justify-center px-3 py-2.5 sm:px-3.5 sm:py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-all ${
                      copied
                        ? 'bg-emerald-500 text-white border-emerald-400 scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* 1-Click WhatsApp Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId('intro');
                      setCustomWhatsAppMsg(WHATSAPP_TEMPLATES[0].template(activeLead, currentUser));
                      setShowWhatsAppModal(true);
                    }}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl font-bold text-xs sm:text-sm bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    title="Send WhatsApp Message"
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span>WhatsApp</span>
                  </button>

                  {/* Primary Big Click-to-Call Link Button */}
                  <a
                    href={`tel:${activeLead.phone}`}
                    className="flex-2 sm:flex-initial px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold text-xs sm:text-sm bg-brand-accent hover:bg-brand-accent-hover text-white shadow-brand-lg flex items-center justify-center gap-2 transition-all active:scale-95 animate-call-pulse"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span>Click to Call</span>
                  </a>
                </div>
              </div>

              {/* Lead Disposition & Status Engine Form */}
              <form onSubmit={handleSaveInteraction} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Set Call Outcome / Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setStatusError('');
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
                    >
                      {Object.values(LEAD_STATUS).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mandatory Follow-up DateTime Picker if "Callback Required" */}
                  {selectedStatus === LEAD_STATUS.CALLBACK_REQUIRED ? (
                    <div>
                      <label className="block text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Follow-up Date & Time <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={callbackDateTime}
                        onChange={(e) => setCallbackDateTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-300 bg-amber-50/50 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Assigned Telecaller
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={activeLead.assignedToName || 'Unassigned'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>

                {/* Notes Input Area */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Add Call Notes & Client Feedback
                    </label>
                    {/* Quick Note Tags */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      {[
                        'Interested in demo',
                        'Call back later',
                        'Budget constraints',
                        'Busy in meeting',
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setNoteText((prev) => (prev ? `${prev}. ${tag}` : tag))}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Type details about conversation, budget, objections, or next steps..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
                  />
                </div>

                {/* Status messages / errors */}
                {statusError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {statusError}
                  </div>
                )}

                {statusSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {statusSuccessMessage}
                  </div>
                )}

                {/* Action Footer: Save and Move Next */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="hidden sm:block text-xs text-slate-400">
                    Press <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded text-[10px] font-mono">Enter</kbd> to save note
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                      type="submit"
                      className="flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl font-bold text-xs bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Save Note</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleSaveInteraction();
                        handleNext();
                      }}
                      className="flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl font-bold text-xs bg-brand-accent hover:bg-brand-accent-hover text-white shadow-brand flex items-center gap-1.5 transition-all active:scale-95"
                    >
                      <span>Save & Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Col: Lead Activity Timeline History */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-brand-accent" />
                <h3 className="font-bold text-slate-800 text-sm">Activity & Call History</h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {activeLead.history?.length || 0} Events
              </span>
            </div>

            {/* Timeline scrollable list */}
            <div className="mt-4 space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {activeLead.history && activeLead.history.length > 0 ? (
                activeLead.history.map((event, idx) => (
                  <div key={event.id || idx} className="relative pl-6 pb-4 border-l-2 border-slate-100 last:border-none">
                    {/* Timeline bullet */}
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-brand-accent ring-4 ring-blue-50" />

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">{event.callerName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      {event.fromStatus && (
                        <>
                          <span className="text-[10px] font-semibold text-slate-400">{event.fromStatus}</span>
                          <span className="text-[10px] text-slate-300">&rarr;</span>
                        </>
                      )}
                      <span className="text-[10px] font-bold text-brand-navy bg-slate-100 px-1.5 py-0.5 rounded">
                        {event.toStatus}
                      </span>
                    </div>

                    {event.note && (
                      <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        {event.note}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <p>No previous call activity logged for this lead yet.</p>
                  <p className="mt-1 text-[11px]">Dial and submit disposition to start timeline.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Caller Tips / Short Key Help */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
              Telecalling Best Practices
            </h4>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
              <li>Confirm lead requirement within first 30 seconds.</li>
              <li>Always set exact time if "Callback Required".</li>
              <li>Use 1-Click WhatsApp to follow up instantly with proposal links.</li>
              <li>Mark "Invalid" if switched off on 3 attempts.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* WhatsApp Pitch & Templates Modal */}
      {showWhatsAppModal && activeLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-brand-lg border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-[#128C7E] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Send WhatsApp to {activeLead.name}</h3>
                  <p className="text-xs text-white/80 font-mono">
                    +{getCleanWhatsAppPhone(activeLead.phone)} &bull; {activeLead.company || 'Direct Client'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Quick Pitch Template:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {WHATSAPP_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(tmpl.id);
                        setCustomWhatsAppMsg(tmpl.template(activeLead, currentUser));
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all ${
                        selectedTemplateId === tmpl.id
                          ? 'border-[#25D366] bg-emerald-50 text-emerald-900 font-bold ring-1 ring-[#25D366]'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {tmpl.title}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Message Preview & Custom Edit:
                  </label>
                  <span className="text-[11px] text-slate-400">Editable before sending</span>
                </div>
                <textarea
                  rows={6}
                  value={customWhatsAppMsg}
                  onChange={(e) => setCustomWhatsAppMsg(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-300 font-sans focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const clean = getCleanWhatsAppPhone(activeLead.phone);
                    const url = `https://wa.me/${clean}?text=${encodeURIComponent(customWhatsAppMsg)}`;
                    window.open(url, '_blank');
                    addLeadNote(activeLead._id, `Sent WhatsApp Pitch: "${customWhatsAppMsg.slice(0, 75)}..."`);
                    setStatusSuccessMessage('WhatsApp opened & interaction logged in history!');
                    setTimeout(() => setStatusSuccessMessage(''), 2500);
                    setShowWhatsAppModal(false);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-md flex items-center gap-2 transition-all active:scale-95"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>Send on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/80" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TelecallingScreen;
