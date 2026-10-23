import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { taskAPI } from '../services/api';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sync tasks dynamically from backend MongoDB API
  const fetchTasks = useCallback(async () => {
    if (!currentUser) {
      setTasks([]);
      return;
    }
    setLoading(true);
    try {
      const res = await taskAPI.getTasks();
      if (res.success && Array.isArray(res.tasks)) {
        setTasks(res.tasks);
      }
    } catch (err) {
      console.warn('Backend tasks fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Create new task dynamically
  const createTask = async (taskData) => {
    try {
      const res = await taskAPI.createTask(taskData);
      if (res.success && res.task) {
        setTasks((prev) => [res.task, ...prev]);
        return { success: true, task: res.task };
      }
      return { success: false, message: res.message || 'Failed to create task' };
    } catch (err) {
      console.warn('Create task error:', err.message);
      return { success: false, message: err.message };
    }
  };

  // Toggle task status dynamically (Pending -> In Progress -> Completed -> In Progress)
  const toggleTaskStatus = async (taskId) => {
    const target = tasks.find((t) => t._id === taskId);
    if (!target) return;

    const nextStatus =
      target.status === 'Completed'
        ? 'In Progress'
        : target.status === 'In Progress'
        ? 'Completed'
        : 'In Progress';

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: nextStatus } : t))
    );

    try {
      const res = await taskAPI.updateTask(taskId, { status: nextStatus });
      if (res.success && res.task) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? res.task : t))
        );
      }
    } catch (err) {
      console.warn('Update task error, reverting:', err.message);
      // Revert if API failed
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? target : t))
      );
    }
  };

  // Update task details dynamically
  const updateTask = async (taskId, updatedData) => {
    try {
      const res = await taskAPI.updateTask(taskId, updatedData);
      if (res.success && res.task) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? res.task : t))
        );
        return { success: true, task: res.task };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Delete task dynamically
  const deleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      return { success: true };
    } catch (err) {
      console.warn('Delete task error:', err.message);
      return { success: false, message: err.message };
    }
  };

  // Accessible tasks for current user
  const accessibleTasks = isAdmin
    ? tasks
    : tasks.filter(
        (t) =>
          String(t.assignedTo) === String(currentUser?._id) ||
          (currentUser?.name &&
            t.assignedToName &&
            t.assignedToName.toLowerCase().includes(currentUser.name.toLowerCase()))
      );

  return (
    <TaskContext.Provider
      value={{
        tasks,
        accessibleTasks,
        loading,
        fetchTasks,
        createTask,
        updateTask,
        toggleTaskStatus,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext;
