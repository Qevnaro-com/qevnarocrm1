import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, IT_DEPARTMENTS, IT_DESIGNATIONS } from '../../types/constants';
import {
  X,
  UserPlus,
  Mail,
  Phone,
  Shield,
  Building,
  Key,
  CheckCircle2,
  AlertCircle,
  Code2,
  Palette,
  Laptop
} from 'lucide-react';

export const AddEmployeeModal = ({ isOpen, onClose, onEmployeeAdded }) => {
  const { addEmployee } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: ROLES.EMPLOYEE,
    designation: 'Frontend Developer (React / Next.js / Tailwind)',
    department: 'Frontend Development',
    status: 'Active',
    password: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMsg('Full Name and Corporate Email are required.');
      return;
    }

    const res = await addEmployee(formData);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg('IT Professional added to team successfully!');
    if (onEmployeeAdded) onEmployeeAdded(res.employee);

    setTimeout(() => {
      setSuccessMsg('');
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: ROLES.EMPLOYEE,
        designation: 'Frontend Developer (React / Next.js / Tailwind)',
        department: 'Frontend Development',
        status: 'Active',
        password: '',
      });
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-brand-lg border border-slate-200">
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 bg-brand-navy text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-accent flex items-center justify-center shadow-accent-glow shrink-0">
              <Laptop className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Add IT Specialist</h3>
              <p className="text-[10px] sm:text-xs text-blue-200/80">Configure Developer, Designer, or Caller</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Name & Corporate Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rohan Verma"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Corporate Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rohan@qevnaro.com"
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
                />
              </div>
            </div>
          </div>

          {/* IT Designation (Frontend, Graphic Designer, etc.) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-brand-accent" />
              IT Designation & Specialization <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.designation}
              onChange={(e) => {
                const val = e.target.value;
                let autoDept = formData.department;
                let autoRole = formData.role;

                if (val.includes('Frontend')) autoDept = 'Frontend Development';
                else if (val.includes('Graphic') || val.includes('UI/UX')) autoDept = 'Graphic Design & UI/UX';
                else if (val.includes('Telecaller') || val.includes('Sales')) {
                  autoDept = 'IT Sales & B2B Telecalling';
                  autoRole = ROLES.CALLER;
                } else if (val.includes('Backend')) autoDept = 'Backend & Cloud Architecture';

                setFormData({
                  ...formData,
                  designation: val,
                  department: autoDept,
                  role: autoRole,
                });
              }}
              className="w-full px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
            >
              {IT_DESIGNATIONS.map((desig) => (
                <option key={desig} value={desig}>
                  {desig}
                </option>
              ))}
            </select>
          </div>

          {/* Department & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
              >
                {IT_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                CRM Access Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
              >
                <option value={ROLES.EMPLOYEE}>Employee (Tech Staff / Designer)</option>
                <option value={ROLES.CALLER}>Caller / IT Sales Agent</option>
                <option value={ROLES.SUPER_ADMIN}>Super Admin (Tech Lead / Director)</option>
              </select>
            </div>
          </div>

          {/* Phone & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Phone / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98111 22334"
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
              >
                <option value="Active">Active (Permit Portal Access)</option>
                <option value="Inactive">Inactive (Suspended)</option>
              </select>
            </div>
          </div>

          {/* Initial Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Initial Login Password
            </label>
            <div className="relative">
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Default: qevnaro123"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white shadow-brand flex items-center gap-1.5 transition-all transform active:scale-98"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add IT Specialist</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
