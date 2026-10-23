import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboardView from '../components/dashboard/AdminDashboardView';
import CallerDashboardView from '../components/dashboard/CallerDashboardView';
import EmployeeDashboardView from '../components/dashboard/EmployeeDashboardView';

export const DashboardPage = ({ onOpenCsvModal, onOpenPunchModal }) => {
  const { isAdmin, isCaller } = useAuth();

  if (isAdmin) {
    return (
      <AdminDashboardView
        onOpenCsvModal={onOpenCsvModal}
        onOpenPunchModal={onOpenPunchModal}
      />
    );
  }

  if (isCaller) {
    return (
      <CallerDashboardView
        onOpenPunchModal={onOpenPunchModal}
      />
    );
  }

  // Default to IT Specialist / General Employee Dashboard
  return (
    <EmployeeDashboardView
      onOpenPunchModal={onOpenPunchModal}
    />
  );
};

export default DashboardPage;
