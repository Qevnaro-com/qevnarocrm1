import React, { useState } from 'react';
import { useLeads } from '../../context/LeadContext';
import { useAuth } from '../../context/AuthContext';
import { LEAD_STATUS, LEAD_STATUS_CONFIG, ROLES } from '../../types/constants';
import {
  Search,
  Filter,
  Phone,
  Copy,
  Check,
  ChevronRight,
  Clock,
  UserPlus,
  Shuffle,
  Eye,
  Trash2,
  MapPin,
  Building,
  Plus,
  MessageCircle,
} from 'lucide-react';

const getCleanWhatsAppPhone = (phone) => {
  if (!phone) return '';
  let clean = phone.replace(/[^\d]/g, '');
  if (clean.length === 10) {
    clean = '91' + clean;
  }
  return clean;
};

export const LeadTable = ({ onOpenCsvModal, onOpenAddLeadModal, onViewLeadDetails }) => {
  const { leads, accessibleLeads, callers, bulkAssignLeads, autoDistributeLeads, deleteLead } = useLeads();
  const { isAdmin, currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [callerFilter, setCallerFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkCallerId, setBulkCallerId] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Filter leads
  const filteredLeads = accessibleLeads.filter((lead) => {
    const matchesSearch =
      lead.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.city?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const leadCallerId = typeof lead.assignedTo === 'object' && lead.assignedTo?._id 
      ? String(lead.assignedTo._id) 
      : (lead.assignedTo ? String(lead.assignedTo) : null);
    const matchesCaller =
      callerFilter === 'ALL' ||
      (callerFilter === 'UNASSIGNED' 
        ? (!lead.assignedTo || lead.assignedTo === 'Unassigned' || lead.assignedToName === 'Unassigned')
        : (leadCallerId === String(callerFilter) || (lead.assignedToName && callers.find((c) => String(c._id) === String(callerFilter))?.name === lead.assignedToName)));

    return matchesSearch && matchesStatus && matchesCaller;
  });

  // Select all handler
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredLeads.map((l) => l._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkCallerId || selectedIds.length === 0) return;
    await bulkAssignLeads(selectedIds, bulkCallerId);
    setSelectedIds([]);
    setBulkCallerId('');
  };

  const handleBulkAutoDistribute = async () => {
    if (selectedIds.length === 0) return;
    await autoDistributeLeads(selectedIds);
    setSelectedIds([]);
  };

  const handleCopy = (id, phone) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 sm:space-y-4 p-3.5 sm:p-5">
      {/* Top Controls: Search, Filters, and Primary CTA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
            >
              <option value="ALL">All Statuses ({accessibleLeads.length})</option>
              {Object.values(LEAD_STATUS).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            {/* Caller Filter (for Admin) */}
            {isAdmin && (
              <select
                value={callerFilter}
                onChange={(e) => setCallerFilter(e.target.value)}
                className="flex-1 sm:flex-initial px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
              >
                <option value="ALL">All Callers</option>
                <option value="UNASSIGNED">Unassigned</option>
                {callers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Buttons: Add Lead & CSV Upload */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={onOpenCsvModal}
                className="flex-1 sm:flex-initial justify-center px-3.5 py-2 text-xs font-semibold rounded-xl border border-brand-accent/40 text-brand-accent hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <span>Upload CSV</span>
              </button>
              <button
                onClick={onOpenAddLeadModal}
                className="flex-1 sm:flex-initial justify-center px-4 py-2 text-xs font-bold rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Single Lead</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bulk Action Bar (when rows selected) */}
      {selectedIds.length > 0 && isAdmin && (
        <div className="p-3 bg-brand-navy rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-brand animate-in fade-in duration-150">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-5 h-5 rounded-full bg-brand-accent flex items-center justify-center text-[10px]">
              {selectedIds.length}
            </span>
            <span>Leads Selected</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Auto Distribute Round-Robin */}
            <button
              onClick={handleBulkAutoDistribute}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors"
            >
              <Shuffle className="w-3.5 h-3.5 text-blue-300" />
              <span>Round-Robin Split</span>
            </button>

            {/* Assign to specific caller */}
            <div className="flex items-center gap-1.5">
              <select
                value={bulkCallerId}
                onChange={(e) => setBulkCallerId(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg text-xs bg-white text-slate-800 font-medium focus:outline-none"
              >
                <option value="">Select Caller...</option>
                {callers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkAssign}
                disabled={!bulkCallerId}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-accent hover:bg-brand-accent-hover text-white disabled:opacity-40 transition-colors"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              {isAdmin && (
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredLeads.length > 0 && selectedIds.length === filteredLeads.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                  />
                </th>
              )}
              <th className="p-3 min-w-[200px]">Lead Name & Company</th>
              <th className="p-3 min-w-[180px]">Contact Details</th>
              <th className="p-3 min-w-[120px]">Location / City</th>
              <th className="p-3 min-w-[140px]">Status</th>
              <th className="p-3 min-w-[150px]">Assigned Agent</th>
              <th className="p-3 min-w-[140px]">Follow-up</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => {
                const statusConfig = LEAD_STATUS_CONFIG[lead.status] || LEAD_STATUS_CONFIG[LEAD_STATUS.NEW];
                const isSelected = selectedIds.includes(lead._id);

                return (
                  <tr
                    key={lead._id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {isAdmin && (
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(lead._id)}
                          className="rounded border-slate-300 text-brand-accent focus:ring-brand-accent"
                        />
                      </td>
                    )}

                    {/* Name & Company */}
                    <td className="p-3">
                      <div className="font-bold text-slate-800 text-sm">{lead.name}</div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>{lead.company || 'Direct Prospect'}</span>
                      </div>
                    </td>

                    {/* Phone with Click-to-Call & One-click Copy */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${lead.phone}`}
                          className="font-mono font-bold text-brand-accent hover:underline flex items-center gap-1"
                          title="Click to Call via system dialer"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </a>
                        <button
                          onClick={() => handleCopy(lead._id, lead.phone)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Copy number"
                        >
                          {copiedId === lead._id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      {lead.email && <div className="text-slate-400 text-[10px] mt-0.5">{lead.email}</div>}
                    </td>

                    {/* Location */}
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{lead.city || '—'}</span>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.badge}`} />
                        {lead.status}
                      </span>
                    </td>

                    {/* Assigned Caller */}
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          lead.assignedTo
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {lead.assignedToName || 'Unassigned'}
                      </span>
                    </td>

                    {/* Callback Reminder */}
                    <td className="p-3">
                      {lead.callbackDate ? (
                        <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                          <Clock className="w-3 h-3" />
                          {new Date(lead.callbackDate).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click WhatsApp */}
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${getCleanWhatsAppPhone(lead.phone)}?text=${encodeURIComponent(
                              `Hello ${lead.name}, this is ${currentUser?.name || 'Qevnaro Team'} from Qevnaro IT Solutions regarding your inquiry for ${lead.service || 'our IT services'}. Can we connect for a quick call?`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors border border-emerald-100"
                            title="Open WhatsApp Chat"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => onViewLeadDetails(lead)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-navy hover:bg-slate-100 transition-colors"
                          title="View lead details & history"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => deleteLead(lead._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  No leads found matching current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;
