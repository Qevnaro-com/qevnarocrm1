import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LeadProvider } from './context/LeadContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { TaskProvider } from './context/TaskContext';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import CsvUploadModal from './components/leads/CsvUploadModal';
import PunchModal from './components/attendance/PunchModal';
import AddLeadModal from './components/leads/AddLeadModal';
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  CalendarCheck2,
  CheckSquare,
  Menu
} from 'lucide-react';

// Pages
import DashboardPage from './pages/DashboardPage';
import CallingScreenPage from './pages/CallingScreenPage';
import LeadsPage from './pages/LeadsPage';
import AttendancePage from './pages/AttendancePage';
import AnalyticsPage from './pages/AnalyticsPage';
import TasksPage from './pages/TasksPage';
import TeamManagementPage from './pages/TeamManagementPage';
import LoginPage from './pages/LoginPage';
import { ROLES } from './types/constants';

// Main Layout component containing Sidebar, Navbar & Modals
const MainLayout = () => {
  const { currentUser, isAdmin, isCaller } = useAuth();

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-brand-bg font-sans">
      {/* Sidebar Navigation (Desktop Fixed + Mobile Slide-over Drawer) */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        <Navbar
          onOpenPunchModal={() => setIsPunchModalOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-8 pb-24 lg:pb-8">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  onOpenCsvModal={() => setIsCsvModalOpen(true)}
                  onOpenPunchModal={() => setIsPunchModalOpen(true)}
                />
              }
            />
            <Route
              path="/calling"
              element={(isAdmin || isCaller) ? <CallingScreenPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/leads"
              element={
                (isAdmin || isCaller) ? (
                  <LeadsPage
                    onOpenCsvModal={() => setIsCsvModalOpen(true)}
                    onOpenAddLeadModal={() => setIsAddLeadModalOpen(true)}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/team"
              element={isAdmin ? <TeamManagementPage /> : <Navigate to="/" replace />}
            />
            <Route
              path="/attendance"
              element={<AttendancePage onOpenPunchModal={() => setIsPunchModalOpen(true)} />}
            />
            <Route
              path="/analytics"
              element={isAdmin ? <AnalyticsPage /> : <Navigate to="/" replace />}
            />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Native Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#091744] border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-all ${
              isActive ? 'text-brand-accent' : 'text-slate-400 hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </NavLink>

        {(isAdmin || isCaller) && (
          <NavLink
            to="/calling"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-all ${
                isActive ? 'text-brand-accent' : 'text-slate-400 hover:text-white'
              }`
            }
          >
            <div className="relative">
              <PhoneCall className="w-4 h-4 mb-0.5" />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <span>Dialer</span>
          </NavLink>
        )}

        {(isAdmin || isCaller) ? (
          <NavLink
            to="/leads"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-all ${
                isActive ? 'text-brand-accent' : 'text-slate-400 hover:text-white'
              }`
            }
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>Leads</span>
          </NavLink>
        ) : (
          <NavLink
            to="/tasks"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold transition-all ${
                isActive ? 'text-brand-accent' : 'text-slate-400 hover:text-white'
              }`
            }
          >
            <CheckSquare className="w-4 h-4 mb-0.5" />
            <span>Tasks</span>
          </NavLink>
        )}

        <button
          onClick={() => setIsPunchModalOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-white transition-all"
        >
          <CalendarCheck2 className="w-4 h-4 mb-0.5 text-emerald-400" />
          <span>Shift</span>
        </button>

        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-semibold text-slate-400 hover:text-white transition-all"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>Menu</span>
        </button>
      </nav>

      {/* Modals mounted at app level */}
      <CsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
      />
      <PunchModal
        isOpen={isPunchModalOpen}
        onClose={() => setIsPunchModalOpen(false)}
      />
      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
      />
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <LeadProvider>
        <AttendanceProvider>
          <TaskProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/*" element={<MainLayout />} />
              </Routes>
            </Router>
          </TaskProvider>
        </AttendanceProvider>
      </LeadProvider>
    </AuthProvider>
  );
};

export default App;
