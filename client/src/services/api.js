const API_BASE = 'http://localhost:5000/api';

const getHeaders = (isMultipart = false) => {
  const headers = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  const token = sessionStorage.getItem('qevnaro_jwt') || localStorage.getItem('qevnaro_jwt');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const authAPI = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updateUser: async (id, userData) => {
    const res = await fetch(`${API_BASE}/auth/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  updatePassword: async (id, password) => {
    const res = await fetch(`${API_BASE}/auth/users/${id}/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ password }),
    });
    return handleResponse(res);
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_BASE}/auth/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  toggleStatus: async (id) => {
    const res = await fetch(`${API_BASE}/auth/users/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const leadAPI = {
  getLeads: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/leads${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createLead: async (leadData) => {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(leadData),
    });
    return handleResponse(res);
  },

  updateStatus: async (id, status, note = '', callbackDate = null) => {
    const res = await fetch(`${API_BASE}/leads/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, note, callbackDate }),
    });
    return handleResponse(res);
  },

  addNote: async (id, note) => {
    const res = await fetch(`${API_BASE}/leads/${id}/note`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ note }),
    });
    return handleResponse(res);
  },

  assign: async (leadIds, callerId) => {
    const res = await fetch(`${API_BASE}/leads/assign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ leadIds, callerId }),
    });
    return handleResponse(res);
  },

  autoDistribute: async (leadIds = null) => {
    const res = await fetch(`${API_BASE}/leads/auto-distribute`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ leadIds }),
    });
    return handleResponse(res);
  },

  uploadCsv: async (leads, options = {}) => {
    const opts = typeof options === 'boolean' ? { autoDistribute: options } : options;
    const res = await fetch(`${API_BASE}/leads/upload-csv`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        leads,
        autoDistribute: opts.autoDistribute,
        assignedTo: opts.assignedTo,
        createTask: opts.createTask,
        taskTitle: opts.taskTitle,
        taskDueDate: opts.taskDueDate,
        taskPriority: opts.taskPriority,
      }),
    });
    return handleResponse(res);
  },

  deleteLead: async (id) => {
    const res = await fetch(`${API_BASE}/leads/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const attendanceAPI = {
  punchIn: async () => {
    const res = await fetch(`${API_BASE}/attendance/punch-in`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  punchOut: async (workSummary) => {
    const res = await fetch(`${API_BASE}/attendance/punch-out`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ workSummary }),
    });
    return handleResponse(res);
  },

  getToday: async () => {
    const res = await fetch(`${API_BASE}/attendance/today`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getMonthly: async (year, month) => {
    const query = new URLSearchParams({ year, month }).toString();
    const res = await fetch(`${API_BASE}/attendance/monthly?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const taskAPI = {
  getTasks: async () => {
    const res = await fetch(`${API_BASE}/tasks`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createTask: async (taskData) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  updateTask: async (id, taskData) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  deleteTask: async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export const analyticsAPI = {
  getOverview: async () => {
    const res = await fetch(`${API_BASE}/analytics/overview`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};

export default {
  auth: authAPI,
  leads: leadAPI,
  attendance: attendanceAPI,
  tasks: taskAPI,
  analytics: analyticsAPI,
};
