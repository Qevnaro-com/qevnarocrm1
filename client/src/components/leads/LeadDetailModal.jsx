import React, { useState } from 'react';
import { useLeads } from '../../context/LeadContext';
import { useAuth } from '../../context/AuthContext';
import { LEAD_STATUS, LEAD_STATUS_CONFIG } from '../../types/constants';
import {
  X,
  Phone,
  Copy,
  Check,
  Mail,
  MapPin,
  Building,
  Clock,
  History,
  Send,
  Calendar,
  Sparkles,
  UserCheck
} from 'lucide-react';

export const LeadDetailModal = ({ lead, isOpen, onClose }) => {
  const { updateLeadStatus, addLeadNote, assignLead, callers } = useLeads();
  const { isAdmin } = useAuth();

  const [copied, setCopied] = useState(false);
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState(lead?.status || LEAD_STATUS.NEW);
  const [callbackDateTime, setCallbackDateTime] = useState(lead?.callbackDate || '');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !lead) return null;

  const handleCopyPhone = () => {
    if (!lead.phone) return;
    navigator.clipboard.writeText(lead.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (newStatus === LEAD_STATUS.CALLBACK_REQUIRED && !callbackDateTime) {
      setErrorMsg('Please select a callback reminder date and time!');
      return;
    }
    await updateLeadStatus(lead._id, newStatus, note, newStatus === LEAD_STATUS.CALLBACK_REQUIRED ? callbackDateTime : null);
    setNote('');
    setErrorMsg('');
    onClose();
  };

  const statusConfig = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG[LEAD_STATUS.NEW];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-brand-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-brand-navy text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center font-bold text-white text-lg">
              {lead.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">{lead.name}</h3>
              <p className="text-xs text-blue-200/80">{lead.company || 'Individual Client'}</p>
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Contact Info</p>
              <div className="flex items-center justify-between">
                <a
                  href={`tel:${lead.phone}`}
                  className="text-base font-bold font-mono text-brand-accent hover:underline flex items-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  <span>{lead.phone}</span>
                </a>
                <button
                  onClick={handleCopyPhone}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {lead.email && (
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.email}</span>
                </p>
              )}
              {lead.city && (
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{lead.city}</span>
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Assignment & State</p>
              <div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.badge}`} />
                  {lead.status}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Assigned: <strong>{lead.assignedToName || 'Unassigned'}</strong>
              </p>
              {lead.callbackDate && (
                <p className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(lead.callbackDate).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Form to update status and add notes */}
          <form onSubmit={handleSave} className="space-y-4 p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
              Update Lead Status & Interaction
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                >
                  {Object.values(LEAD_STATUS).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {newStatus === LEAD_STATUS.CALLBACK_REQUIRED && (
                <div>
                  <label className="block text-xs font-semibold text-amber-700 mb-1">
                    Callback DateTime <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={callbackDateTime}
                    onChange={(e) => setCallbackDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-xs"
                    required
                  />
                </div>
              )}

              {isAdmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Reassign Telecaller</label>
                  <select
                    value={lead.assignedTo || ''}
                    onChange={(e) => assignLead(lead._id, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                  >
                    <option value="">Unassigned</option>
                    {callers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Add Note / Log</label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log call feedback, quotes, customer requirements..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            {errorMsg && <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>}

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold rounded-lg bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>

          {/* Activity Timeline */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-brand-accent" />
              Activity History ({lead.history?.length || 0})
            </h4>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {lead.history && lead.history.length > 0 ? (
                lead.history.map((h, i) => (
                  <div key={h.id || i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{h.callerName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(h.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    {h.toStatus && (
                      <div className="text-[11px] text-slate-600">
                        Status: <strong className="text-brand-navy">{h.toStatus}</strong>
                      </div>
                    )}
                    {h.note && <p className="text-slate-600 text-[11px]">{h.note}</p>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400">No activity logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailModal;
