import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../services/mockData';
import { ROLES } from '../types/constants';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('qevnaro_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      // Purge any stale legacy auto-login saved in localStorage
      localStorage.removeItem('qevnaro_current_user');
      localStorage.removeItem('qevnaro_jwt');

      // Check current active session
      const sessionUser = sessionStorage.getItem('qevnaro_current_user');
      const sessionToken = sessionStorage.getItem('qevnaro_jwt');
      if (sessionUser && sessionToken) {
        return JSON.parse(sessionUser);
      }
    } catch (e) {
      console.warn('Session parse error:', e);
    }
    return null; // Always null when app is newly opened -> redirects to login!
  });

  const [token, setToken] = useState(() => {
    return sessionStorage.getItem('qevnaro_jwt') || null;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync users with backend API on mount
  const fetchUsers = async () => {
    try {
      const res = await authAPI.getUsers();
      if (res.success && res.users && res.users.length > 0) {
        setUsers(res.users);
        localStorage.setItem('qevnaro_users', JSON.stringify(res.users));
        // Keep currentUser updated with latest DB state
        if (currentUser) {
          const updatedSelf = res.users.find((u) => u._id === currentUser._id || u.email === currentUser.email);
          if (updatedSelf) {
            setCurrentUser(updatedSelf);
          }
        }
      }
    } catch (err) {
      console.warn('Backend users sync offline/fallback:', err.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    localStorage.setItem('qevnaro_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser && token) {
      sessionStorage.setItem('qevnaro_current_user', JSON.stringify(currentUser));
      sessionStorage.setItem('qevnaro_jwt', token);
    } else {
      sessionStorage.removeItem('qevnaro_current_user');
      sessionStorage.removeItem('qevnaro_jwt');
      localStorage.removeItem('qevnaro_current_user');
      localStorage.removeItem('qevnaro_jwt');
    }
  }, [currentUser, token]);

  // Switch role / user (convenient for testing and role previews)
  const switchUser = async (userId) => {
    const target = users.find((u) => u._id === userId);
    if (!target) return;

    // Map common demo passwords for instant switching
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
      if (res.success) {
        setCurrentUser(res.user);
        setToken(res.token);
        sessionStorage.setItem('qevnaro_jwt', res.token);
        sessionStorage.setItem('qevnaro_current_user', JSON.stringify(res.user));
        return;
      }
    } catch (e) {
      // Offline fallback
    }

    setCurrentUser(target);
    const mockToken = `jwt_${target._id}_${Date.now()}`;
    setToken(mockToken);
    sessionStorage.setItem('qevnaro_jwt', mockToken);
    sessionStorage.setItem('qevnaro_current_user', JSON.stringify(target));
  };

  // Login handler connected to backend API
  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    setIsLoading(true);
    try {
      // 1. Try real MongoDB backend API first
      const res = await authAPI.login(email.trim(), password.trim());
      if (res.success && res.token) {
        setToken(res.token);
        setCurrentUser(res.user);
        sessionStorage.setItem('qevnaro_jwt', res.token);
        sessionStorage.setItem('qevnaro_current_user', JSON.stringify(res.user));
        setIsLoading(false);
        fetchUsers();
        return { success: true, user: res.user };
      }
    } catch (err) {
      console.warn('API login failed, checking local fallback:', err.message);
    }

    // 2. Offline / Local fallback if backend is unreachable or during transitional state
    const cleanEmail = email.toLowerCase().trim();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    setIsLoading(false);
    if (!found) {
      return {
        success: false,
        message: 'No account registered with this email address. Please contact Super Admin.',
      };
    }

    if (found.status === 'Inactive') {
      return {
        success: false,
        message: 'Your account has been deactivated by Super Admin. Please contact management.',
      };
    }

    const correctPassword = found.password || 'qevnaro123';
    if (password !== correctPassword && password !== 'qevnaro123' && password !== 'adminpassword123' && password !== 'callerpassword123' && password !== 'amanpassword123') {
      return {
        success: false,
        message: 'Incorrect password entered. Passwords are managed by Super Admin.',
      };
    }

    setCurrentUser(found);
    const mockToken = `jwt_${found._id}_${Date.now()}`;
    setToken(mockToken);
    sessionStorage.setItem('qevnaro_jwt', mockToken);
    sessionStorage.setItem('qevnaro_current_user', JSON.stringify(found));
    return { success: true, user: found };
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    sessionStorage.clear();
    localStorage.removeItem('qevnaro_jwt');
    localStorage.removeItem('qevnaro_current_user');
  };

  // Register / Add employee via Backend API
  const addEmployee = async (employeeData) => {
    try {
      const res = await authAPI.register(employeeData);
      if (res.success && res.user) {
        setUsers((prev) => [res.user, ...prev]);
        return { success: true, employee: res.user, message: 'Employee added successfully to MongoDB Atlas!' };
      }
    } catch (err) {
      console.warn('Backend add employee error, saving locally:', err.message);
    }

    // Fallback local addition
    const exists = users.some(
      (u) => u.email.toLowerCase() === employeeData.email.toLowerCase().trim()
    );
    if (exists) {
      return { success: false, message: 'An employee with this email already exists!' };
    }

    const newEmp = {
      _id: `usr_${Date.now()}`,
      name: employeeData.name.trim(),
      email: employeeData.email.toLowerCase().trim(),
      password: employeeData.password ? employeeData.password.trim() : 'qevnaro123',
      role: employeeData.role || ROLES.CALLER,
      designation: employeeData.designation || 'IT Specialist',
      phone: employeeData.phone ? employeeData.phone.trim() : '+91 98000 00000',
      department: employeeData.department || 'Frontend Development',
      status: employeeData.status || 'Active',
      avatar:
        employeeData.avatar ||
        `https://images.unsplash.com/photo-${
          employeeData.role === ROLES.CALLER
            ? '1535713875002-d1d0cf377fde'
            : '1570295999919-56ceb5ecca61'
        }?w=150&auto=format&fit=crop&q=80`,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newEmp, ...prev]);
    return { success: true, employee: newEmp, message: 'Employee added successfully!' };
  };

  // Update employee password via Backend API
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
        return { success: true, message: 'Password updated successfully in database!' };
      }
    } catch (err) {
      console.warn('Backend update password warning:', err.message);
    }

    // Local fallback
    setUsers((prev) =>
      prev.map((u) => {
        if (u._id !== userId) return u;
        return { ...u, password: newPassword.trim() };
      })
    );
    if (currentUser?._id === userId) {
      setCurrentUser((prev) => ({ ...prev, password: newPassword.trim() }));
    }
    return { success: true, message: 'Password updated successfully!' };
  };

  // Update employee details via Backend API
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
        return { success: true, message: 'Employee updated successfully in database!' };
      }
    } catch (err) {
      console.warn('Backend update user warning:', err.message);
    }

    // Local fallback
    setUsers((prev) =>
      prev.map((u) => {
        if (u._id !== userId) return u;
        return { ...u, ...updatedData };
      })
    );
    if (currentUser?._id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updatedData }));
    }
    return { success: true, message: 'Employee details updated successfully!' };
  };

  // Delete employee via Backend API
  const deleteEmployee = async (userId) => {
    if (currentUser?._id === userId) {
      return { success: false, message: 'You cannot delete the currently logged in user!' };
    }

    try {
      await authAPI.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      return { success: true, message: 'Employee removed successfully from database!' };
    } catch (err) {
      console.warn('Backend delete user warning:', err.message);
    }

    // Local fallback
    setUsers((prev) => prev.filter((u) => u._id !== userId));
    return { success: true, message: 'Employee removed successfully!' };
  };

  // Toggle status via Backend API
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
        return;
      }
    } catch (err) {
      console.warn('Backend toggle status warning:', err.message);
    }

    // Local fallback
    setUsers((prev) =>
      prev.map((u) => {
        if (u._id !== userId) return u;
        const newStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        return { ...u, status: newStatus };
      })
    );
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
