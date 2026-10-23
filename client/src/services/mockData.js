import { ROLES, LEAD_STATUS, ATTENDANCE_STATUS } from '../types/constants';

export const INITIAL_USERS = [
  {
    _id: 'usr_admin_1',
    name: 'Vikram Malhotra',
    email: 'admin@qevnaro.com',
    password: 'adminpassword123',
    role: ROLES.SUPER_ADMIN,
    designation: 'IT Director & Technical Architect',
    department: 'Management & Architecture',
    phone: '+91 98201 11223',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
  },
  {
    _id: 'usr_caller_1',
    name: 'Rajesh Sharma',
    email: 'rajesh@qevnaro.com',
    password: 'callerpassword123',
    role: ROLES.CALLER,
    designation: 'IT Telecaller & B2B Client Closer',
    department: 'IT Sales & B2B Telecalling',
    phone: '+91 98111 22334',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
  },
  {
    _id: 'usr_caller_2',
    name: 'Priya Patel',
    email: 'priya@qevnaro.com',
    password: 'priyapassword123',
    role: ROLES.CALLER,
    designation: 'UI/UX & Senior Graphic Designer',
    department: 'Graphic Design & UI/UX',
    phone: '+91 98333 44556',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
  },
  {
    _id: 'usr_emp_1',
    name: 'Aman Verma',
    email: 'aman@qevnaro.com',
    password: 'amanpassword123',
    role: ROLES.EMPLOYEE,
    designation: 'Senior Frontend Developer (React / Next.js)',
    department: 'Frontend Development',
    phone: '+91 98444 55667',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
  },
  {
    _id: 'usr_emp_2',
    name: 'Neha Mehta',
    email: 'neha@qevnaro.com',
    password: 'nehapassword123',
    role: ROLES.EMPLOYEE,
    designation: 'Graphic Designer & Visual Artist',
    department: 'Graphic Design & UI/UX',
    phone: '+91 98777 88990',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'Active',
  },
];

export const INITIAL_LEADS = [];

export const INITIAL_ATTENDANCE = [];

export const INITIAL_TASKS = [];

