import React, { useState } from 'react';
import LeadTable from '../components/leads/LeadTable';
import LeadDetailModal from '../components/leads/LeadDetailModal';

export const LeadsPage = ({ onOpenCsvModal, onOpenAddLeadModal }) => {
  const [selectedLeadForDetails, setSelectedLeadForDetails] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Leads Management Directory</h1>
        <p className="text-xs text-slate-500 mt-1">
          Search, filter, assign, and review communications history across all customer leads
        </p>
      </div>

      <LeadTable
        onOpenCsvModal={onOpenCsvModal}
        onOpenAddLeadModal={onOpenAddLeadModal}
        onViewLeadDetails={(lead) => setSelectedLeadForDetails(lead)}
      />

      {/* Lead Details Modal */}
      {selectedLeadForDetails && (
        <LeadDetailModal
          lead={selectedLeadForDetails}
          isOpen={!!selectedLeadForDetails}
          onClose={() => setSelectedLeadForDetails(null)}
        />
      )}
    </div>
  );
};

export default LeadsPage;
