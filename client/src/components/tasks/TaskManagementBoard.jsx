import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTasks } from '../../context/TaskContext';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
  Filter,
  Check,
  Trash2,
  Link2,
  ExternalLink,
} from 'lucide-react';

export const TaskManagementBoard = () => {
  const { currentUser, users, isAdmin } = useAuth();
  const { accessibleTasks, createTask, toggleTaskStatus } = useTasks();

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'Medium',
    assignedTo: currentUser?._id || '',
    dueDate: new Date().toISOString().slice(0, 10),
    deliverableUrl: '',
  });

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const assignedUser = users.find((u) => u._id === newTask.assignedTo);
    const assignedName = assignedUser ? assignedUser.name : currentUser?.name;

    const res = await createTask({
      title: newTask.title.trim(),
      priority: newTask.priority,
      assignedTo: newTask.assignedTo || currentUser?._id,
      assignedToName: assignedName,
      dueDate: newTask.dueDate,
      deliverableUrl: newTask.deliverableUrl,
    });

    if (res.success) {
      setNewTask({
        title: '',
        priority: 'Medium',
        assignedTo: currentUser?._id || '',
        dueDate: new Date().toISOString().slice(0, 10),
        deliverableUrl: '',
      });
      setShowAddModal(false);
    }
  };

  const filteredTasks = (accessibleTasks || []).filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Daily Operations & Task Board</h2>
          <p className="text-xs text-slate-500">Track and assign deliverables, telecalling quotas, and client follow-ups</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="ALL">All Tasks ({accessibleTasks.length})</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: Pending */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
              To-Do / Pending
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px]">
              {accessibleTasks.filter((t) => t.status === 'Pending').length}
            </span>
          </div>

          <div className="space-y-3">
            {filteredTasks
              .filter((t) => t.status === 'Pending')
              .map((task) => (
                <div
                  key={task._id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-brand-accent transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">{task.title}</h4>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {task.deliverableUrl && (
                    <a
                      href={task.deliverableUrl.startsWith('http') ? task.deliverableUrl : `https://${task.deliverableUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-accent hover:underline bg-blue-50/80 hover:bg-blue-100/80 px-2 py-1 rounded-lg w-fit transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link2 className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[190px]">{task.deliverableUrl}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                    </a>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {task.assignedToName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Today'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleTaskStatus(task._id)}
                    className="w-full mt-2 py-1.5 text-[11px] font-semibold text-brand-accent bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Start Task</span>
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              In Progress
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px]">
              {accessibleTasks.filter((t) => t.status === 'In Progress').length}
            </span>
          </div>

          <div className="space-y-3">
            {filteredTasks
              .filter((t) => t.status === 'In Progress')
              .map((task) => (
                <div
                  key={task._id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2 hover:border-brand-accent transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-800 leading-snug">{task.title}</h4>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  {task.deliverableUrl && (
                    <a
                      href={task.deliverableUrl.startsWith('http') ? task.deliverableUrl : `https://${task.deliverableUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-brand-accent hover:underline bg-blue-50/80 hover:bg-blue-100/80 px-2 py-1 rounded-lg w-fit transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link2 className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[190px]">{task.deliverableUrl}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                    </a>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {task.assignedToName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Today'}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleTaskStatus(task._id)}
                    className="w-full mt-2 py-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark Completed</span>
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Done / Completed
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              {accessibleTasks.filter((t) => t.status === 'Completed').length}
            </span>
          </div>

          <div className="space-y-3">
            {filteredTasks
              .filter((t) => t.status === 'Completed')
              .map((task) => (
                <div
                  key={task._id}
                  className="bg-white/80 p-4 rounded-xl border border-slate-200 opacity-90 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-600 line-through leading-snug">
                      {task.title}
                    </h4>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0">
                      Done
                    </span>
                  </div>

                  {task.deliverableUrl && (
                    <a
                      href={task.deliverableUrl.startsWith('http') ? task.deliverableUrl : `https://${task.deliverableUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-brand-accent hover:underline bg-slate-100 px-2 py-1 rounded-lg w-fit"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link2 className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[190px]">{task.deliverableUrl}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                    </a>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{task.assignedToName}</span>
                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Today'}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-brand-lg border border-slate-200 space-y-4">
            <h3 className="font-bold text-base text-slate-800">Create New Team Task</h3>
            <form onSubmit={handleAddTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Follow up on Mumbai leads batch or Build Hero Component"
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deliverable Link <span className="text-slate-400 font-normal">(Optional - GitHub PR / Figma / Drive)</span>
                </label>
                <div className="relative">
                  <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    value={newTask.deliverableUrl || ''}
                    onChange={(e) => setNewTask({ ...newTask, deliverableUrl: e.target.value })}
                    placeholder="https://github.com/... or https://figma.com/..."
                    className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignee</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white rounded-xl"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagementBoard;
