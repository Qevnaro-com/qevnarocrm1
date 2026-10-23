import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './models/User.js';
import Lead from './models/Lead.js';
import Task from './models/Task.js';
import Attendance from './models/Attendance.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/qevnarocrm';

export const runSeed = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
      console.log('[Seed] Connected to MongoDB Atlas');
    }

    // 1. Upsert IT Specialists / Users
    const usersData = [
      {
        name: 'Vikram Malhotra',
        email: 'admin@qevnaro.com',
        password: 'adminpassword123',
        role: 'Super Admin',
        designation: 'IT Director & Technical Architect',
        department: 'Management & Architecture',
        phone: '+91 98201 11223',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'Active',
      },
      {
        name: 'Rajesh Sharma',
        email: 'rajesh@qevnaro.com',
        password: 'callerpassword123',
        role: 'Caller',
        designation: 'IT Telecaller & B2B Client Closer',
        department: 'IT Sales & B2B Telecalling',
        phone: '+91 98111 22334',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: 'Active',
      },
      {
        name: 'Priya Patel',
        email: 'priya@qevnaro.com',
        password: 'priyapassword123',
        role: 'Caller',
        designation: 'UI/UX & Senior Graphic Designer',
        department: 'Graphic Design & UI/UX',
        phone: '+91 98333 44556',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        status: 'Active',
      },
      {
        name: 'Aman Verma',
        email: 'aman@qevnaro.com',
        password: 'amanpassword123',
        role: 'Employee',
        designation: 'Senior Frontend Developer (React / Next.js)',
        department: 'Frontend Development',
        phone: '+91 98444 55667',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        status: 'Active',
      },
      {
        name: 'Neha Mehta',
        email: 'neha@qevnaro.com',
        password: 'nehapassword123',
        role: 'Employee',
        designation: 'Graphic Designer & Visual Artist',
        department: 'Graphic Design & UI/UX',
        phone: '+91 98777 88990',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        status: 'Active',
      },
    ];

    const userMap = {};
    for (const u of usersData) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        existing = await User.create(u);
        console.log(`[Seed] Created user: ${u.name} (${u.email})`);
      } else {
        existing.role = u.role;
        existing.designation = u.designation;
        existing.department = u.department;
        existing.phone = u.phone;
        existing.avatar = u.avatar;
        existing.status = u.status;
        existing.password = u.password;
        await existing.save();
        console.log(`[Seed] Updated user: ${u.name} (${u.email})`);
      }
      userMap[u.email] = existing;
    }
    console.log('[Seed] Database initialization complete!');
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
  }
};

// If run directly
if (process.argv[1]?.endsWith('seedData.js')) {
  runSeed().then(() => {
    console.log('[Seed] Exiting process.');
    process.exit(0);
  });
}
