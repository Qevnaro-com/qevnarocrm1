import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { useTasks } from '../../context/TaskContext';
import { Link } from 'react-router-dom';
import {
  Laptop,
  Palette,
  Clock,
  CheckCircle2,
  CalendarCheck2,
  CheckSquare,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  FileText,
  FolderGit2,
  Layers,
  Send,
  Timer,
  ExternalLink,
  Link2,
} from 'lucide-react';

export const EmployeeDashboardView = ({ onOpenPunchModal }) => {
  const { currentUser } = useAuth();
  const { todayRecord, hasPunchedIn, hasPunchedOut, isOnLeave, liveDuration } = useAttendance();
  const { accessibleTasks, createTask, toggleTaskStatus } = useTasks();

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState('Medium');
  const [quickDeliverableUrl, setQuickDeliverableUrl] = useState('');
  const [showAddBox, setShowAddBox] = useState(false);

  const myTasks = Array.isArray(accessibleTasks) ? accessibleTasks : [];

  const handleAddQuickTask = async (e) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    const res = await createTask({
      title: quickTaskTitle.trim(),
      priority: quickPriority,
      assignedTo: currentUser?._id,
      assignedToName: currentUser?.name,
      dueDate: new Date().toISOString().slice(0, 10),
      deliverableUrl: quickDeliverableUrl.trim() || undefined,
    });

    if (res.success) {
      setQuickTaskTitle('');
      setQuickDeliverableUrl('');
      setShowAddBox(false);
    }
  };

  const pendingCount = myTasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = myTasks.filter((t) => t.status === 'Completed').length;

  const filteredTasks = myTasks.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  const isDesigner =
    currentUser?.department?.toLowerCase().includes('design') ||
    currentUser?.designation?.toLowerCase().includes('designer');

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* IT Specialist Profile Hero Card */}
      <div className="bg-gradient-to-r from-brand-navy via-brand-navy-light to-brand-navy rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-brand relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-semibold text-blue-200">
              {isDesigner ? (
                <Palette className="w-3.5 h-3.5 text-purple-300" />
              ) : (
                <Laptop className="w-3.5 h-3.5 text-brand-accent" />
              )}
              <span>
                {currentUser?.department || 'IT Solutions Engineering'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
              Hello, {currentUser?.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-xl">
              <span className="font-semibold text-white">{currentUser?.designation || 'IT Specialist'}</span> &bull;{' '}
              Track your daily development deliverables, log working hours, and submit your shift tasks report.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={onOpenPunchModal}
              className={`flex-1 sm:flex-initial justify-center px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-brand ${
                isOnLeave
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : hasPunchedOut
                  ? 'bg-slate-700 text-white'
                  : hasPunchedIn
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-brand-accent hover:bg-brand-accent-hover text-white animate-pulse'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {isOnLeave
                  ? 'On Leave Today'
                  : hasPunchedOut
                  ? 'Shift Completed'
                  : hasPunchedIn
                  ? `Punched In (${liveDuration.slice(0, 5)})`
                  : 'Punch In Shift'}
              </span>
            </button>

            <Link
              to="/tasks"
              className="flex-1 sm:flex-initial justify-center px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl font-bold text-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Tasks</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Active In-Progress Tasks */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-brand-accent flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">{inProgressCount}</p>
            <p className="text-[10px] sm:text-xs text-blue-600 font-semibold mt-0.5">
              Active sprint
            </p>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Backlog</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-700">{pendingCount}</p>
            <p className="text-[10px] sm:text-xs text-amber-600 font-semibold mt-0.5">
              To be picked up
            </p>
          </div>
        </div>

        {/* Completed Deliverables */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-700">{completedCount}</p>
            <p className="text-[10px] sm:text-xs text-emerald-600 font-semibold mt-0.5">
              Delivered
            </p>
          </div>
        </div>

        {/* Live Shift Working Time */}
        <div
          onClick={onOpenPunchModal}
          className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between cursor-pointer hover:border-brand-accent transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Shift</span>
            <div
              className={`w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center ${
                hasPunchedIn ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3">
            <p className="text-xl sm:text-2xl lg:text-3xl font-mono font-black text-brand-navy truncate">
              {liveDuration.slice(0, 8)}
            </p>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-[10px] sm:text-xs font-semibold text-emerald-600">
                {hasPunchedOut ? 'Completed' : hasPunchedIn ? 'Active' : 'Punch In'}
              </span>
              <span className="text-[9px] sm:text-[10px] text-brand-accent font-bold group-hover:underline">Clock &rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Section: Assigned IT Tasks + Daily Work Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Active Assigned Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  My Assigned Sprint Deliverables ({myTasks.length})
                </h3>
                <p className="text-xs text-slate-500">Click a task to cycle status (Pending &rarr; In Progress &rarr; Completed)</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
                  {['ALL', 'In Progress', 'Pending', 'Completed'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilterStatus(tab)}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        filterStatus === tab
                          ? 'bg-white text-brand-navy shadow-xs font-bold'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddBox(!showAddBox)}
                  className="px-2.5 py-1.5 rounded-lg bg-brand-navy text-white text-xs font-bold flex items-center gap-1 hover:bg-brand-navy-light"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Quick Add Form Box */}
            {showAddBox && (
              <form
                onSubmit={handleAddQuickTask}
                className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2.5 animate-in fade-in duration-150"
              >
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter new task or deliverable title..."
                    value={quickTaskTitle}
                    onChange={(e) => setQuickTaskTitle(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent bg-white"
                  />
                  <select
                    value={quickPriority}
                    onChange={(e) => setQuickPriority(e.target.value)}
                    className="px-2.5 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    placeholder="Deliverable URL: GitHub PR / Figma Link / Staging Demo (optional)"
                    value={quickDeliverableUrl}
                    onChange={(e) => setQuickDeliverableUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-brand-accent hover:bg-brand-accent-hover text-white shadow-xs"
                  >
                    Add Deliverable
                  </button>
                </div>
              </form>
            )}

            {/* Tasks List */}
            <div className="space-y-2.5">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => toggleTaskStatus(task._id)}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                      task.status === 'Completed'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : task.status === 'In Progress'
                        ? 'bg-blue-50/40 border-blue-200 hover:border-brand-accent'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          task.status === 'Completed'
                            ? 'bg-emerald-500 text-white'
                            : task.status === 'In Progress'
                            ? 'bg-brand-accent text-white'
                            : 'border-2 border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {task.status === 'Completed' && <CheckCircle2 className="w-4 h-4" />}
                        {task.status === 'In Progress' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                      </div>

                      <div>
                        <p
                          className={`text-xs font-bold ${
                            task.status === 'Completed'
                              ? 'text-slate-500 line-through'
                              : 'text-slate-800'
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                          <span
                            className={`px-1.5 py-0.2 rounded font-semibold ${
                              task.priority === 'Urgent'
                                ? 'bg-rose-100 text-rose-700'
                                : task.priority === 'High'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span>&bull;</span>
                          <span>Due: {task.dueDate}</span>
                          {task.deliverableUrl && (
                            <a
                              href={task.deliverableUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-accent hover:underline bg-white px-2 py-0.5 rounded border border-blue-200"
                            >
                              <Link2 className="w-3 h-3" />
                              <span>Work Link</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : task.status === 'In Progress'
                            ? 'bg-blue-100 text-brand-accent'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  <p>No tasks under this filter.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Daily Work Summary & Guidelines */}
        <div className="space-y-6">
          {/* Shift Work Summary Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-accent" />
                <h3 className="font-bold text-sm text-slate-800">Today's Daily Summary</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">End-of-day Log</span>
            </div>

            {todayRecord?.workSummary ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-emerald-700">Submitted Report</span>
                  <span className="text-[10px] text-emerald-600">
                    Checked out at {todayRecord.punchOutTime}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {todayRecord.workSummary}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {hasPunchedIn
                    ? "Shift is active! When you punch out at the end of the day, you'll be prompted to record your deliverables and completed tasks."
                    : 'Punch in to start logging your shift and record your completed daily tasks.'}
                </p>
                <button
                  onClick={onOpenPunchModal}
                  className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-brand-navy hover:bg-brand-navy-light text-white shadow-xs flex items-center justify-center gap-2"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{hasPunchedIn ? 'Check Out & Submit Work' : 'Punch In Now'}</span>
                </button>
              </div>
            )}
          </div>

          {/* IT Solutions Guidelines & Stack */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <h3 className="font-bold text-sm text-slate-800">Qevnaro IT Resources</h3>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Brand Color Hex</span>
                <span className="font-mono text-[11px] font-bold text-brand-navy bg-white px-2 py-0.5 rounded border">
                  #091744 / #2977FD
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="font-semibold text-slate-700">Tech Stack</span>
                <span className="text-[11px] text-slate-600">React &bull; Tailwind &bull; Node</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardView;
