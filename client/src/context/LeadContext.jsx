import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { ROLES, LEAD_STATUS } from '../types/constants';
import { leadAPI } from '../services/api';

const LeadContext = createContext(null);

export const LeadProvider = ({ children }) => {
  const { currentUser, isAdmin, users } = useAuth();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);

  // Sync leads dynamically from backend MongoDB API
  const fetchLeads = useCallback(async () => {
    if (!currentUser) {
      setLeads([]);
      return;
    }
    setLoading(true);
    try {
      const res = await leadAPI.getLeads();
      if (res.success && Array.isArray(res.leads)) {
        setLeads(res.leads);
      }
    } catch (err) {
      console.warn('Backend fetch leads error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Active callers for distribution
  const callers = users.filter(
    (u) =>
      (u.role === ROLES.CALLER || u.role === 'Caller' || u.role === 'Telecaller') &&
      (u.status === 'Active' || !u.status)
  );

  // Leads accessible to current user
  const accessibleLeads = isAdmin
    ? leads
    : leads.filter(
        (lead) =>
          String(lead.assignedTo) === String(currentUser?._id) ||
          (currentUser?.name &&
            lead.assignedToName &&
            lead.assignedToName.toLowerCase() === currentUser.name.toLowerCase())
      );

  // Update lead status with activity timeline history & sync to backend
  const updateLeadStatus = async (leadId, newStatus, note = '', callbackDate = null) => {
    // Optimistic UI update
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (lead._id !== leadId) return lead;

        const historyEntry = {
          _id: `h_${Date.now()}`,
          callerName: currentUser ? currentUser.name : 'Telecaller',
          callerId: currentUser ? currentUser._id : null,
          fromStatus: lead.status,
          toStatus: newStatus,
          note: note.trim() || `Status updated to ${newStatus}`,
          timestamp: new Date().toISOString(),
        };

        return {
          ...lead,
          status: newStatus,
          callbackDate: newStatus === LEAD_STATUS.CALLBACK_REQUIRED ? callbackDate : null,
          lastContactedAt: new Date().toISOString(),
          notes: note.trim()
            ? `${note.trim()} (Updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
            : lead.notes,
          history: [historyEntry, ...(lead.history || [])],
        };
      })
    );

    // Sync to MongoDB backend
    try {
      const res = await leadAPI.updateStatus(leadId, newStatus, note, callbackDate);
      if (res.success && res.lead) {
        setLeads((prev) => prev.map((l) => (l._id === leadId ? res.lead : l)));
        return { success: true, lead: res.lead };
      }
      return { success: false, message: res.message };
    } catch (err) {
      console.warn('Backend updateLeadStatus warning:', err.message);
      return { success: false, message: err.message };
    }
  };

  // Add notes to a lead dynamically
  const addLeadNote = async (leadId, noteText) => {
    if (!noteText.trim()) return;

    try {
      const res = await leadAPI.addNote(leadId, noteText.trim());
      if (res.success && res.lead) {
        setLeads((prev) => prev.map((l) => (l._id === leadId ? res.lead : l)));
        return { success: true, lead: res.lead };
      }
      return { success: false, message: res.message };
    } catch (err) {
      console.warn('Backend addLeadNote error:', err.message);
      return { success: false, message: err.message };
    }
  };

  // Assign single lead to a specific caller
  const assignLead = async (leadId, callerId) => {
    try {
      await leadAPI.assign([leadId], callerId);
      await fetchLeads();
      return { success: true };
    } catch (err) {
      console.warn('Backend assignLead error:', err.message);
      return { success: false, message: err.message };
    }
  };

  // Bulk assign multiple leads
  const bulkAssignLeads = async (leadIds, callerId) => {
    try {
      await leadAPI.assign(leadIds, callerId);
      await fetchLeads();
      return { success: true };
    } catch (err) {
      console.warn('Backend bulkAssignLeads error:', err.message);
      return { success: false, message: err.message };
    }
  };

  // Auto-distribute leads round-robin via backend API
  const autoDistributeLeads = async (leadIdsToDistribute = null) => {
    try {
      const res = await leadAPI.autoDistribute(leadIdsToDistribute);
      if (res.success) {
        await fetchLeads();
        return { success: true, count: res.count, message: res.message };
      }
      return { success: false, message: res.message || 'Auto-distribution failed' };
    } catch (err) {
      console.warn('Backend autoDistribute error:', err.message);
      return { success: false, message: err.message };
    }
  };

  // Import CSV parsed leads dynamically via backend API
  const importLeads = async (newLeadsList, options = {}) => {
    try {
      const res = await leadAPI.uploadCsv(newLeadsList, options);
      if (res.success) {
        await fetchLeads();
        return {
          success: true,
          count: res.count,
          assignedTo: res.assignedTo,
          tasksCount: res.tasks?.length || 0,
        };
      }
      return { success: false, message: res.message || 'CSV upload failed' };
    } catch (err) {
      console.warn('Backend importLeads error:', err.message);
      return { success: false, message: err.message };
    }
  };

  // Add single lead manually dynamically
  const addLead = async (leadData) => {
    try {
      const res = await leadAPI.createLead(leadData);
      if (res.success && res.lead) {
        setLeads((prev) => [res.lead, ...prev]);
        return res.lead;
      }
      return null;
    } catch (err) {
      console.warn('Backend addLead error:', err.message);
      return null;
    }
  };

  // Delete a lead dynamically
  const deleteLead = async (leadId) => {
    try {
      await leadAPI.deleteLead(leadId);
      setLeads((prev) => prev.filter((l) => l._id !== leadId));
      return { success: true };
    } catch (err) {
      console.warn('Backend deleteLead error:', err.message);
      return { success: false, message: err.message };
    }
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        accessibleLeads,
        callers,
        loading,
        currentLeadIndex,
        setCurrentLeadIndex,
        fetchLeads,
        updateLeadStatus,
        addLeadNote,
        assignLead,
        bulkAssignLeads,
        autoDistributeLeads,
        importLeads,
        addLead,
        deleteLead,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
};

export default LeadContext;
