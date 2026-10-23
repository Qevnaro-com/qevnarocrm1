import React from 'react';
import TaskManagementBoard from '../components/tasks/TaskManagementBoard';

export const TasksPage = () => {
  return (
    <div className="space-y-6">
      <TaskManagementBoard />
    </div>
  );
};

export default TasksPage;
