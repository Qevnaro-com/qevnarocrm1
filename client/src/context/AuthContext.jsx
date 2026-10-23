import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../types/constants';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Purge any legacy localStorage CRM keys on initialization
  try {
    localStorage.removeItem('qevnaro_leads');
    localStorage.removeItem('qevnaro_attendance');
    localStorage.removeItem('qevnaro_users');
    localStorage.removeItem('qevnaro_tasks');
    localStorage.removeItem('qevnaro_current_user');
  } catch (e) {}

  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => {
    return localStorage.getItem('qevnaro_jwt') || sessionStorage.getItem('qevnaro_jwt') || null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync users dynamically from MongoDB Atlas
  const fetchUsers = async () => {
    try {
      const res = await authAPI.getUsers();
      if (res.success && Array.isArray(res.users)) {
        setUsers(res.users);
        if (currentUser) {
          const updatedSelf = res.users.find(
            (u) => u._id === currentUser._id || u.email === currentUser.email
          );
          if (updatedSelf) {
            setCurrentUser(updatedSelf);
          }
        }
      }
    } catch (err) {
      console.warn('Dynamic users sync error:', err.message);
    }
  };

  // Verify active JWT session with backend on initial load / refresh
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('qevnaro_jwt') || sessionStorage.getItem('qevnaro_jwt');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setCurrentUser(res.user);
            setToken(savedToken);
            // Fetch active team users
            const usersRes = await authAPI.getUsers();
            if (usersRes.success && Array.isArray(usersRes.users)) {
              setUsers(usersRes.users);
            }
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, []);

  // Quick switch user / role for testing and demo previews
  const switchUser = async (userId) => {
    const target = users.find((u) => u._id === userId);
    if (!target) return;

    const rolePasswords = {
      'admin@qevnaro.com': 'adminpassword123',
      'rajesh@qevnaro.com': 'callerpassword123',
      'priya@qevnaro.com': 'priyapassword123',
      'aman@qevnaro.com': 'amanpassword123',
      'neha@qevnaro.com': 'nehapassword123',
    };
    const defaultPass = rolePasswords[target.email] || target.password || 'qevnaro123';

    try {
      const res = await authAPI.login(target.email, defaultPass);
      if (res.success && res.token) {
        setToken(res.token);
        setCurrentUser(res.user);
        localStorage.setItem('qevnaro_jwt', res.token);
        sessionStorage.setItem('qevnaro_jwt', res.token);
        fetchUsers();
        return;
      }
    } catch (e) {
      console.warn('Switch user login error:', e.message);
    }

    // Direct state switch if API login had mismatch
    setCurrentUser(target);
  };

  // Login handler connected 100% to backend MongoDB Atlas API
  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    setIsLoading(true);
    try {
      const res = await authAPI.login(email.trim(), password.trim());
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setCurrentUser(res.user);
        localStorage.setItem('qevnaro_jwt', res.token);
        sessionStorage.setItem('qevnaro_jwt', res.token);
        setIsLoading(false);

        // Fetch team members dynamically
        try {
          const uRes = await authAPI.getUsers();
          if (uRes.success && Array.isArray(uRes.users)) {
            setUsers(uRes.users);
          }
        } catch (e) {}

        return { success: true, user: res.user };
      }
      setIsLoading(false);
      return { success: false, message: res.message || 'Invalid credentials' };
    } catch (err) {
      setIsLoading(false);
      return {
        success: false,
        message: err.message || 'Could not connect to authentication server. Please verify backend is running.',
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    setUsers([]);
    try {
      localStorage.removeItem('qevnaro_jwt');
      sessionStorage.removeItem('qevnaro_jwt');
      sessionStorage.clear();
      localStorage.removeItem('qevnaro_leads');
      localStorage.removeItem('qevnaro_attendance');
      localStorage.removeItem('qevnaro_users');
      localStorage.removeItem('qevnaro_tasks');
      localStorage.removeItem('qevnaro_current_user');
    } catch (e) {}
  };

  // Register / Add employee dynamically via MongoDB Atlas API
  const addEmployee = async (employeeData) => {
    try {
      const res = await authAPI.register(employeeData);
      if (res.success && res.user) {
        setUsers((prev) => [res.user, ...prev]);
        return { success: true, employee: res.user, message: 'Employee registered successfully in MongoDB Atlas!' };
      }
      return { success: false, message: res.message || 'Failed to add employee' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Update employee password dynamically via Backend API
  const updateUserPassword = async (userId, newPassword) => {
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    try {
      const res = await authAPI.updatePassword(userId, newPassword);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => {
            if (u._id !== userId) return u;
            return { ...u, password: newPassword.trim() };
          })
        );
        if (currentUser?._id === userId) {
          setCurrentUser((prev) => ({ ...prev, password: newPassword.trim() }));
        }
        return { success: true, message: 'Password updated successfully in MongoDB Atlas!' };
      }
      return { success: false, message: res.message || 'Failed to update password' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Update employee details dynamically via Backend API
  const updateEmployee = async (userId, updatedData) => {
    try {
      const res = await authAPI.updateUser(userId, updatedData);
      if (res.success && res.user) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, ...res.user } : u))
        );
        if (currentUser?._id === userId) {
          setCurrentUser((prev) => ({ ...prev, ...res.user }));
        }
        return { success: true, message: 'Employee updated successfully in MongoDB Atlas!' };
      }
      return { success: false, message: res.message || 'Failed to update employee' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Delete employee dynamically via Backend API
  const deleteEmployee = async (userId) => {
    if (currentUser?._id === userId) {
      return { success: false, message: 'You cannot delete the currently logged in user!' };
    }

    try {
      const res = await authAPI.deleteUser(userId);
      if (res.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        return { success: true, message: 'Employee removed successfully from database!' };
      }
      return { success: false, message: res.message || 'Failed to delete employee' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Toggle status dynamically via Backend API
  const toggleEmployeeStatus = async (userId) => {
    try {
      const res = await authAPI.toggleStatus(userId);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => {
            if (u._id !== userId) return u;
            return { ...u, status: res.status };
          })
        );
      }
    } catch (err) {
      console.warn('Dynamic toggle status error:', err.message);
    }
  };

  const isAdmin = currentUser?.role === ROLES.SUPER_ADMIN;
  const isCaller = currentUser?.role === ROLES.CALLER;
  const isEmployee = currentUser?.role === ROLES.EMPLOYEE;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        token,
        isAdmin,
        isCaller,
        isEmployee,
        isLoading,
        switchUser,
        login,
        logout,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        toggleEmployeeStatus,
        updateUserPassword,
        fetchUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
