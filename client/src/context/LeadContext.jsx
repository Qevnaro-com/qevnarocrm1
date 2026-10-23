import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_LEADS } from '../services/mockData';
import { useAuth } from './AuthContext';
import { ROLES, LEAD_STATUS } from '../types/constants';
import { leadAPI } from '../services/api';

const LeadContext = createContext(null);

export const LeadProvider = ({ children }) => {
  const { currentUser, isAdmin, users } = useAuth();

  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('qevnaro_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [loading, setLoading] = useState(false);

  // Sync leads from backend MongoDB API
  const fetchLeads = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await leadAPI.getLeads();
      if (res.success && Array.isArray(res.leads) && res.leads.length > 0) {
        setLeads(res.leads);
        localStorage.setItem('qevnaro_leads', JSON.stringify(res.leads));
      }
    } catch (err) {
      console.warn('Backend fetch leads fallback:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    localStorage.setItem('qevnaro_leads', JSON.stringify(leads));
  }, [leads]);

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
      }
    } catch (err) {
      console.warn('Backend updateLeadStatus warning:', err.message);
    }
  };

  // Add notes to a lead
  const addLeadNote = async (leadId, noteText) => {
    if (!noteText.trim()) return;

    // Optimistic UI update
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (lead._id !== leadId) return lead;

        const historyEntry = {
          _id: `h_${Date.now()}`,
          callerName: currentUser ? currentUser.name : 'Agent',
          callerId: currentUser ? currentUser._id : null,
          fromStatus: lead.status,
          toStatus: lead.status,
          note: noteText.trim(),
          timestamp: new Date().toISOString(),
        };

        return {
          ...lead,
          notes: noteText.trim(),
          history: [historyEntry, ...(lead.history || [])],
        };
      })
    );

    try {
      const res = await leadAPI.addNote(leadId, noteText);
      if (res.success && res.lead) {
        setLeads((prev) => prev.map((l) => (l._id === leadId ? res.lead : l)));
      }
    } catch (err) {
      console.warn('Backend addLeadNote warning:', err.message);
    }
  };

  // Assign lead to a specific caller
  const assignLead = async (leadId, callerId) => {
    const caller = users.find((u) => u._id === callerId);
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (lead._id !== leadId) return lead;

        const historyEntry = {
          _id: `h_${Date.now()}`,
          callerName: currentUser?.name || 'Admin',
          fromStatus: lead.status,
          toStatus: lead.status,
          note: caller ? `Assigned to ${caller.name}` : 'Unassigned',
          timestamp: new Date().toISOString(),
        };

        return {
          ...lead,
          assignedTo: callerId || null,
          assignedToName: caller ? caller.name : 'Unassigned',
          history: [historyEntry, ...(lead.history || [])],
        };
      })
    );

    try {
      await leadAPI.assign([leadId], callerId);
    } catch (err) {
      console.warn('Backend assignLead warning:', err.message);
    }
  };

  // Bulk assign multiple leads
  const bulkAssignLeads = async (leadIds, callerId) => {
    const caller = users.find((u) => u._id === callerId);
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (!leadIds.includes(lead._id)) return lead;

        const historyEntry = {
          _id: `h_${Date.now()}_${lead._id}`,
          callerName: currentUser?.name || 'Admin',
          fromStatus: lead.status,
          toStatus: lead.status,
          note: caller ? `Bulk assigned to ${caller.name}` : 'Unassigned',
          timestamp: new Date().toISOString(),
        };

        return {
          ...lead,
          assignedTo: callerId || null,
          assignedToName: caller ? caller.name : 'Unassigned',
          history: [historyEntry, ...(lead.history || [])],
        };
      })
    );

    try {
      await leadAPI.assign(leadIds, callerId);
      fetchLeads();
    } catch (err) {
      console.warn('Backend bulkAssignLeads warning:', err.message);
    }
  };

  // Auto-distribute leads equally among active callers (Round-Robin)
  const autoDistributeLeads = async (leadIdsToDistribute = null) => {
    const activeCallers = users.filter((u) => u.role === ROLES.CALLER && u.status === 'Active');
    if (activeCallers.length === 0) return { success: false, message: 'No active callers available to distribute.' };

    try {
      const res = await leadAPI.autoDistribute(leadIdsToDistribute);
      if (res.success) {
        await fetchLeads();
        return { success: true, count: res.count };
      }
    } catch (err) {
      console.warn('Backend autoDistribute fallback:', err.message);
    }

    // Local fallback
    setLeads((prevLeads) => {
      let callerIndex = 0;
      return prevLeads.map((lead) => {
        const shouldDistribute = leadIdsToDistribute
          ? leadIdsToDistribute.includes(lead._id)
          : !lead.assignedTo;

        if (!shouldDistribute) return lead;

        const assignedCaller = activeCallers[callerIndex % activeCallers.length];
        callerIndex++;

        return {
          ...lead,
          assignedTo: assignedCaller._id,
          assignedToName: assignedCaller.name,
        };
      });
    });

    return { success: true, count: leadIdsToDistribute ? leadIdsToDistribute.length : 'unassigned' };
  };

  // Import CSV parsed leads
  const importLeads = async (newLeadsList, options = {}) => {
    const opts = typeof options === 'boolean' ? { autoDistribute: options } : options;
    try {
      const res = await leadAPI.uploadCsv(newLeadsList, opts);
      if (res.success) {
        await fetchLeads();
        return {
          success: true,
          count: res.count,
          assignedTo: res.assignedTo,
          tasksCount: res.tasks?.length || 0,
        };
      }
    } catch (err) {
      console.warn('Backend importLeads fallback to local:', err.message);
    }

    // Fallback local addition
    const activeCallers = users.filter((u) => u.role === ROLES.CALLER && u.status === 'Active');
    let callerIndex = 0;
    const targetCaller =
      opts.assignedTo && opts.assignedTo !== 'UNASSIGNED' && opts.assignedTo !== 'AUTO_DISTRIBUTE'
        ? users.find((u) => String(u._id) === String(opts.assignedTo))
        : null;

    const formattedLeads = newLeadsList.map((item, index) => {
      let assignedId = null;
      let assignedName = 'Unassigned';

      if (targetCaller) {
        assignedId = targetCaller._id;
        assignedName = targetCaller.name;
      } else if (opts.autoDistribute && activeCallers.length > 0) {
        const caller = activeCallers[callerIndex % activeCallers.length];
        assignedId = caller._id;
        assignedName = caller.name;
        callerIndex++;
      }

      const comp = item.company || item.organization || '';
      return {
        _id: `lead_${Date.now()}_${index}`,
        name: item.name || comp || 'Client Lead',
        company: comp,
        phone: item.phone ? String(item.phone).replace(/\s+/g, '') : '',
        email: item.email || '',
        city: item.city || '',
        service: item.service || item.services || item.category || 'Custom IT Solutions',
        notes: item.notes || 'Imported via CSV batch upload',
        status: LEAD_STATUS.NEW,
        assignedTo: assignedId,
        assignedToName: assignedName,
        callbackDate: null,
        lastContactedAt: null,
        createdAt: new Date().toISOString(),
        history: [],
      };
    });

    setLeads((prev) => [...formattedLeads, ...prev]);
    return {
      success: true,
      count: formattedLeads.length,
      assignedTo: targetCaller ? targetCaller.name : null,
    };
  };

  // Add single lead manually
  const addLead = async (leadData) => {
    try {
      const res = await leadAPI.createLead(leadData);
      if (res.success && res.lead) {
        setLeads((prev) => [res.lead, ...prev]);
        return res.lead;
      }
    } catch (err) {
      console.warn('Backend addLead fallback:', err.message);
    }

    const newLead = {
      _id: `lead_${Date.now()}`,
      name: leadData.name,
      company: leadData.company || '',
      phone: leadData.phone ? String(leadData.phone).replace(/\s+/g, '') : '',
      email: leadData.email || '',
      city: leadData.city || '',
      service: leadData.service || 'Custom Web Development',
      notes: leadData.notes || '',
      status: LEAD_STATUS.NEW,
      assignedTo: leadData.assignedTo || null,
      assignedToName: leadData.assignedTo ? users.find((u) => u._id === leadData.assignedTo)?.name : 'Unassigned',
      callbackDate: null,
      lastContactedAt: null,
      createdAt: new Date().toISOString(),
      history: [],
    };

    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  };

  // Delete a lead
  const deleteLead = async (leadId) => {
    setLeads((prev) => prev.filter((l) => l._id !== leadId));
    try {
      await leadAPI.deleteLead(leadId);
    } catch (err) {
      console.warn('Backend deleteLead warning:', err.message);
    }
  };

  return (
    <LeadContext.Provider
      value={{
        leads,
        accessibleLeads,
        callers,
        loading,
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
