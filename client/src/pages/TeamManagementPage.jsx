import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLeads } from '../context/LeadContext';
import { ROLES } from '../types/constants';
import AddEmployeeModal from '../components/team/AddEmployeeModal';
import ChangePasswordModal from '../components/team/ChangePasswordModal';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  Shield,
  Trash2,
  CheckCircle2,
  XCircle,
  Building,
  Headphones,
  Award,
  Sparkles,
  Key
} from 'lucide-react';

export const TeamManagementPage = () => {
  const { users, currentUser, isAdmin, deleteEmployee, toggleEmployeeStatus } = useAuth();
  const { leads } = useLeads();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Calculate assigned leads count per user
  const getAssignedLeadsCount = (userId) => {
    return leads.filter((l) => String(l.assignedTo) === String(userId)).length;
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to remove ${userName} from the organization?`)) {
      const res = await deleteEmployee(userId);
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  // Quick Stats
  const totalEmployees = users.length;
  const activeCallersCount = users.filter((u) => u.role === ROLES.CALLER && u.status === 'Active').length;
  const opsStaffCount = users.filter((u) => u.role === ROLES.EMPLOYEE && u.status === 'Active').length;
  const inactiveCount = users.filter((u) => u.status === 'Inactive').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner */}
      <div className="bg-brand-navy rounded-2xl p-4 sm:p-6 text-white shadow-brand flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-accent" />
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">Team & Employee Operations</h1>
          </div>
          <p className="text-[11px] sm:text-xs text-blue-200/80 mt-1">
            Add team members, assign IT roles, and manage access permissions & passwords
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-bold text-xs bg-brand-accent hover:bg-brand-accent-hover text-white shadow-brand flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase">Members</span>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1">{totalEmployees}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">All staff</p>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase">Callers</span>
          <p className="text-xl sm:text-2xl font-black text-brand-navy mt-0.5 sm:mt-1">{activeCallersCount}</p>
          <p className="text-[10px] text-blue-600 font-medium mt-0.5">Dialer active</p>
        </div>

        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase">IT Staff</span>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5 sm:mt-1">{opsStaffCount}</p>
          <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Devs & Designers</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">Suspended / Inactive</span>
          <p className="text-2xl font-black text-slate-600 mt-1">{inactiveCount}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">No login access</p>
        </div>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-brand-navy text-xs font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-accent shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Controls & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member by name, email, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Roles ({users.length})</option>
              <option value={ROLES.CALLER}>IT Callers & Sales</option>
              <option value={ROLES.EMPLOYEE}>Tech Staff / Designers</option>
              <option value={ROLES.SUPER_ADMIN}>Super Admins</option>
            </select>
          </div>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3 min-w-[220px]">IT Professional</th>
                <th className="p-3 min-w-[130px]">System Role</th>
                <th className="p-3 min-w-[170px]">IT Department</th>
                <th className="p-3 min-w-[120px]">Contact</th>
                <th className="p-3 text-center min-w-[120px]">Assigned Inquiries</th>
                <th className="p-3 text-center">Status</th>
                {isAdmin && <th className="p-3 text-right">Actions</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => {
                const assignedCount = getAssignedLeadsCount(user._id);

                return (
                  <tr key={user._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Member Info & IT Designation */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{user.name}</p>
                          <span className="text-[10px] font-semibold text-brand-navy bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 inline-block mt-0.5">
                            {user.designation || 'IT Specialist'}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          user.role === ROLES.SUPER_ADMIN
                            ? 'bg-brand-navy text-white'
                            : user.role === ROLES.CALLER
                            ? 'bg-blue-100 text-brand-navy border border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {user.role === ROLES.CALLER && <Headphones className="w-3 h-3 text-brand-accent" />}
                        {user.role}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="p-3 text-slate-700 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{user.department || 'Frontend Development'}</span>
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="p-3">
                      <span className="font-mono text-slate-700 text-[11px]">
                        {user.phone || '—'}
                      </span>
                    </td>

                    {/* Assigned Leads Count */}
                    <td className="p-3 text-center">
                      {user.role === ROLES.CALLER ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full font-bold text-xs bg-blue-50 text-brand-accent border border-blue-200 font-mono">
                          {assignedCount} Leads
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Status Pill & Toggle */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => toggleEmployeeStatus(user._id)}
                        disabled={!isAdmin || user._id === currentUser?._id}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {user.status}
                      </button>
                    </td>

                    {/* Actions */}
                    {isAdmin && (
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedUserForPassword(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-brand-accent hover:bg-blue-50 transition-colors"
                            title="Manage Password / Credentials"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          {user._id !== currentUser?._id && (
                            <button
                              onClick={() => handleDelete(user._id, user.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove Employee"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        user={selectedUserForPassword}
        isOpen={!!selectedUserForPassword}
        onClose={() => setSelectedUserForPassword(null)}
      />
    </div>
  );
};

export default TeamManagementPage;
