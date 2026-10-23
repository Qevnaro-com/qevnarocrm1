import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { useLeads } from '../../context/LeadContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Users,
  Shuffle,
  ChevronRight,
  CheckSquare,
  PhoneCall,
  Calendar,
} from 'lucide-react';

export const CsvUploadModal = ({ isOpen, onClose }) => {
  const { importLeads, callers } = useLeads();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [columnMapping, setColumnMapping] = useState({});
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [assignmentMode, setAssignmentMode] = useState('ROUND_ROBIN'); // 'ROUND_ROBIN' | 'SPECIFIC_CALLER' | 'UNASSIGNED'
  const [selectedCallerId, setSelectedCallerId] = useState('');
  const [createCallingTask, setCreateCallingTask] = useState(true);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('High');
  const [taskDueDate, setTaskDueDate] = useState(() => {
    const d = new Date(Date.now() + 24 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [importSuccess, setImportSuccess] = useState(null);

  if (!isOpen) return null;

  // Standard Target Fields (Only company, phone, city, services)
  const TARGET_FIELDS = [
    { key: 'company', label: 'Company Name', required: true, aliases: ['company', 'company name', 'business', 'org', 'organization', 'client', 'firm'] },
    { key: 'phone', label: 'Phone Number', required: true, aliases: ['phone', 'mobile', 'contact no', 'phone number', 'tel', 'cell', 'contact'] },
    { key: 'city', label: 'City / Location', required: false, aliases: ['city', 'location', 'region', 'state', 'town'] },
    { key: 'service', label: 'Services / Requirement', required: false, aliases: ['services', 'service', 'category', 'product', 'requirement', 'it services'] },
  ];

  // Auto-detect matching columns from CSV headers
  const autoDetectColumns = (headers) => {
    const mapping = {};
    TARGET_FIELDS.forEach((target) => {
      const match = headers.find((h) => {
        const cleaned = h.toLowerCase().trim();
        return target.aliases.includes(cleaned) || cleaned.includes(target.key);
      });
      if (match) {
        mapping[target.key] = match;
      }
    });
    return mapping;
  };

  // Handle CSV file selection and parsing with PapaParse
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setErrorMsg('Please select a valid .csv file');
      return;
    }

    setFile(selectedFile);
    setErrorMsg('');
    setImportSuccess(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setErrorMsg('CSV file is empty or formatted incorrectly.');
          return;
        }

        const headers = results.meta.fields || Object.keys(results.data[0] || {});
        setCsvHeaders(headers);
        setParsedRows(results.data);

        // Auto map columns
        const detected = autoDetectColumns(headers);
        setColumnMapping(detected);
      },
      error: (err) => {
        setErrorMsg(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  // Drag and drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const fakeEvent = { target: { files: [droppedFile] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Perform Final Lead Import
  const handleImportSubmit = async () => {
    if (!parsedRows.length) return;

    // Validate that required fields (Company or Phone) are mapped
    if (!columnMapping.company && !columnMapping.phone) {
      setErrorMsg('Please map at least "Company" or "Phone Number" before importing.');
      return;
    }

    if (assignmentMode === 'SPECIFIC_CALLER' && !selectedCallerId) {
      setErrorMsg('Please select a caller to assign this batch of leads to.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const formattedLeads = parsedRows.map((row) => {
        const companyVal = row[columnMapping.company] || '';
        const phoneVal = row[columnMapping.phone] || '';
        const cityVal = row[columnMapping.city] || '';
        const serviceVal = row[columnMapping.service] || 'Custom IT Solutions';

        return {
          name: companyVal || 'Client Lead',
          company: companyVal,
          phone: phoneVal,
          city: cityVal,
          service: serviceVal,
          email: '',
          notes: 'Imported via CSV batch upload',
        };
      });

      const callerObj = callers.find((c) => String(c._id) === String(selectedCallerId));

      const res = await importLeads(formattedLeads, {
        autoDistribute: assignmentMode === 'ROUND_ROBIN',
        assignedTo: assignmentMode === 'SPECIFIC_CALLER' ? selectedCallerId : null,
        createTask: createCallingTask,
        taskTitle:
          taskTitle.trim() ||
          `Call & WhatsApp: Batch of ${formattedLeads.length} leads (${file?.name || 'CSV'})`,
        taskDueDate,
        taskPriority,
      });

      setIsProcessing(false);
      setImportSuccess({
        count: res.count,
        assignmentMode,
        assignedCallerName: callerObj?.name || res.assignedTo,
        activeCallers: callers.length,
        createdTask: createCallingTask,
        taskTitle:
          taskTitle.trim() ||
          `Call & WhatsApp: Batch of ${formattedLeads.length} leads`,
      });

      // Clear after short delay or let user see
      setTimeout(() => {
        onClose();
        setFile(null);
        setParsedRows([]);
        setImportSuccess(null);
      }, 2500);
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg(`Import failed: ${err.message}`);
    }
  };

  // Download Sample CSV template (Only Company, Phone, City, Services)
  const downloadSampleCsv = () => {
    const csvContent =
      'Company,Phone,City,Services\n' +
      'Apex Logistics Global,+919820011223,Mumbai,Custom Web Development (React / Next.js)\n' +
      'Sharma Media Group,+919811144556,Delhi,Graphic Design & Brand Identity\n' +
      'Narayanan Health Tech,+919845066778,Bangalore,UI/UX Design (Figma)\n' +
      'Khan Cloud Solutions,+919830099887,Dubai,Full-Stack SaaS Product Development';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'qevnaro_leads_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-brand-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-brand-navy text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-accent flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Bulk Upload Leads via CSV</h3>
              <p className="text-xs text-blue-200/80">Auto-column mapping & Round-Robin caller assignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Success state */}
          {importSuccess ? (
            <div className="p-8 text-center space-y-4 bg-emerald-50 rounded-2xl border border-emerald-200 animate-in fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-emerald-900">Leads Uploaded & Assigned!</h4>
                <p className="text-sm text-emerald-700 mt-1">
                  Successfully imported <strong>{importSuccess.count} leads</strong> into QevnaroCRM.
                </p>
              </div>

              <div className="bg-white/80 p-4 rounded-xl border border-emerald-200 text-xs text-left max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Assignment:</span>
                  <span className="font-bold text-slate-800">
                    {importSuccess.assignmentMode === 'ROUND_ROBIN'
                      ? `Round-Robin (${importSuccess.activeCallers} Callers)`
                      : importSuccess.assignmentMode === 'SPECIFIC_CALLER'
                      ? `Direct to ${importSuccess.assignedCallerName}`
                      : 'Unassigned'}
                  </span>
                </div>
                {importSuccess.createdTask && (
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">Auto-Created Task:</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5" />
                      Assigned to Caller Workspace
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* File Upload Dropzone */}
              {!file ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-brand-accent rounded-2xl p-8 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-accent flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Click to select CSV or drag and drop file here
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">Supports standard CSV exports with contacts & phone numbers</p>

                  <div className="mt-4 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadSampleCsv();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-accent bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Sample Template CSV
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-6 h-6 text-brand-accent" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{file.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {parsedRows.length} rows parsed &bull; {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setParsedRows([]);
                    }}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Change File
                  </button>
                </div>
              )}

              {/* Column Mapping Section */}
              {parsedRows.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Step 2: Verify Column Mapping
                    </h4>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Auto-detected from headers
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {TARGET_FIELDS.map((target) => (
                      <div key={target.key} className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                          <span>
                            {target.label} {target.required && <span className="text-rose-500">*</span>}
                          </span>
                        </label>
                        <select
                          value={columnMapping[target.key] || ''}
                          onChange={(e) =>
                            setColumnMapping((prev) => ({
                              ...prev,
                              [target.key]: e.target.value,
                            }))
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
                        >
                          <option value="">-- Do Not Map --</option>
                          {csvHeaders.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {/* Step 3: Assignment & Calling Task Generation */}
                  <div className="space-y-4 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Step 3: Caller Assignment & Calling Task Generation
                    </h4>

                    {/* Assignment Mode Options */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <p className="text-xs font-bold text-slate-800">Who should these leads be assigned to?</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {/* Option 1: Round Robin */}
                        <label
                          className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                            assignmentMode === 'ROUND_ROBIN'
                              ? 'bg-blue-50/70 border-brand-accent shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="assignMode"
                              value="ROUND_ROBIN"
                              checked={assignmentMode === 'ROUND_ROBIN'}
                              onChange={() => setAssignmentMode('ROUND_ROBIN')}
                              className="text-brand-accent focus:ring-brand-accent"
                            />
                            <span className="text-xs font-bold text-slate-800">Round-Robin</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 pl-5">
                            Auto-split equally among all active callers
                          </p>
                        </label>

                        {/* Option 2: Specific Caller */}
                        <label
                          className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                            assignmentMode === 'SPECIFIC_CALLER'
                              ? 'bg-blue-50/70 border-brand-accent shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="assignMode"
                              value="SPECIFIC_CALLER"
                              checked={assignmentMode === 'SPECIFIC_CALLER'}
                              onChange={() => setAssignmentMode('SPECIFIC_CALLER')}
                              className="text-brand-accent focus:ring-brand-accent"
                            />
                            <span className="text-xs font-bold text-slate-800">Assign to Caller</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 pl-5">
                            Assign entire batch to 1 telecaller
                          </p>
                        </label>

                        {/* Option 3: Unassigned */}
                        <label
                          className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                            assignmentMode === 'UNASSIGNED'
                              ? 'bg-blue-50/70 border-brand-accent shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="assignMode"
                              value="UNASSIGNED"
                              checked={assignmentMode === 'UNASSIGNED'}
                              onChange={() => setAssignmentMode('UNASSIGNED')}
                              className="text-brand-accent focus:ring-brand-accent"
                            />
                            <span className="text-xs font-bold text-slate-800">Keep Unassigned</span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 pl-5">
                            Distribute manually later from table
                          </p>
                        </label>
                      </div>

                      {/* Caller Selector Dropdown (When Specific Caller is selected) */}
                      {assignmentMode === 'SPECIFIC_CALLER' && (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-blue-200 animate-in fade-in space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-700">
                            Select Caller to Assign ({callers.length} active telecallers):
                          </label>
                          <select
                            value={selectedCallerId}
                            onChange={(e) => setSelectedCallerId(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                          >
                            <option value="">-- Choose Sales Caller --</option>
                            {callers.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.name} &bull; {c.designation || c.department} ({c.phone})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Automated Task Creation Toggle */}
                      {assignmentMode !== 'UNASSIGNED' && (
                        <div className="mt-4 pt-3 border-t border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckSquare className="w-4 h-4 text-brand-accent" />
                              <span className="text-xs font-bold text-slate-800">
                                Automatically Create Calling & WhatsApp Task for Caller(s)
                              </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={createCallingTask}
                                onChange={(e) => setCreateCallingTask(e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </label>
                          </div>

                          {createCallingTask && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-xl border border-slate-200 text-xs animate-in fade-in">
                              <div className="sm:col-span-2 space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  Task Title for Caller
                                </label>
                                <input
                                  type="text"
                                  value={taskTitle}
                                  onChange={(e) => setTaskTitle(e.target.value)}
                                  placeholder={`Call & WhatsApp batch of ${parsedRows.length} leads`}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                  Task Priority
                                </label>
                                <select
                                  value={taskPriority}
                                  onChange={(e) => setTaskPriority(e.target.value)}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                                >
                                  <option value="Urgent">Urgent</option>
                                  <option value="High">High</option>
                                  <option value="Medium">Medium</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Table Preview */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Preview First 3 Rows:
                    </p>
                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <tr>
                            <th className="p-2">Company</th>
                            <th className="p-2">Phone</th>
                            <th className="p-2">City</th>
                            <th className="p-2">Services</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {parsedRows.slice(0, 3).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2 font-medium">{row[columnMapping.company] || '—'}</td>
                              <td className="p-2 font-mono">{row[columnMapping.phone] || '—'}</td>
                              <td className="p-2">{row[columnMapping.city] || '—'}</td>
                              <td className="p-2 text-slate-600">{row[columnMapping.service] || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Box */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!importSuccess && (
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              disabled={parsedRows.length === 0 || isProcessing}
              onClick={handleImportSubmit}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-brand-accent hover:bg-brand-accent-hover text-white shadow-brand disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {isProcessing ? (
                <span>Importing Leads...</span>
              ) : (
                <>
                  <span>Import {parsedRows.length} Leads</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CsvUploadModal;
