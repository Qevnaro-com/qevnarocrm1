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

    const rajesh = userMap['rajesh@qevnaro.com'];
    const priya = userMap['priya@qevnaro.com'];
    const aman = userMap['aman@qevnaro.com'];
    const neha = userMap['neha@qevnaro.com'];
    const admin = userMap['admin@qevnaro.com'];

    // 2. Seed Leads if none exist
    const leadCount = await Lead.countDocuments();
    if (leadCount === 0) {
      console.log('[Seed] Seeding realistic IT project leads...');
      const leadsToSeed = [
        {
          name: 'Aditya Oberoi',
          company: 'Apex Logistics Global',
          phone: '+919820012345',
          email: 'aditya.oberoi@apexlogistics.in',
          city: 'Mumbai',
          service: 'Custom Web Development (React / Next.js)',
          status: 'New',
          assignedTo: rajesh?._id || null,
          assignedToName: rajesh?.name || 'Rajesh Sharma',
          notes: 'Inquired for customer-facing tracking portal in React & Tailwind. Budget: ₹3.5 Lakhs.',
          history: [
            {
              callerName: 'System',
              toStatus: 'New',
              note: 'Lead created via IT web inquiry form',
              timestamp: new Date(Date.now() - 24 * 3600 * 1000),
            },
            {
              callerName: 'Vikram Malhotra',
              callerId: admin?._id,
              fromStatus: 'New',
              toStatus: 'New',
              note: 'Auto-assigned to Rajesh Sharma via round-robin distribution',
              timestamp: new Date(Date.now() - 22 * 3600 * 1000),
            },
          ],
        },
        {
          name: 'Kavita Sundaram',
          company: 'Sundaram Health Tech',
          phone: '+919845098765',
          email: 'kavita@sundaramhealth.com',
          city: 'Bangalore',
          service: 'UI/UX Design (Figma Prototypes & Wireframes)',
          status: 'Callback Required',
          assignedTo: rajesh?._id || null,
          assignedToName: rajesh?.name || 'Rajesh Sharma',
          notes: 'Wants complete mobile app redesign in Figma before Flutter development. Scheduled demo for tomorrow at 3 PM.',
          callbackDate: new Date(Date.now() + 24 * 3600 * 1000),
          lastContactedAt: new Date(Date.now() - 2 * 3600 * 1000),
          history: [
            {
              callerName: 'Rajesh Sharma',
              callerId: rajesh?._id,
              fromStatus: 'New',
              toStatus: 'Connected',
              note: 'Discussed UI design system and Figma handover timeline.',
              timestamp: new Date(Date.now() - 3 * 3600 * 1000),
            },
            {
              callerName: 'Rajesh Sharma',
              callerId: rajesh?._id,
              fromStatus: 'Connected',
              toStatus: 'Callback Required',
              note: 'Scheduled callback with their Chief Product Officer.',
              timestamp: new Date(Date.now() - 2 * 3600 * 1000),
            },
          ],
        },
        {
          name: 'Rohit Kulkarni',
          company: 'Zenith Real Estate Group',
          phone: '+919890123456',
          email: 'rohit@zenithgroup.org',
          city: 'Pune',
          service: 'Graphic Design & Brand Identity (Logo, Social Posts, Ads)',
          status: 'Interested',
          assignedTo: rajesh?._id || null,
          assignedToName: rajesh?.name || 'Rajesh Sharma',
          notes: 'Needs monthly retainer package for 40 social media graphic creatives, 3D floor plan renders, and branding kit.',
          lastContactedAt: new Date(Date.now() - 5 * 3600 * 1000),
          history: [
            {
              callerName: 'Rajesh Sharma',
              callerId: rajesh?._id,
              fromStatus: 'New',
              toStatus: 'Interested',
              note: 'Shared our Graphic Design portfolio. Client loved recent branding projects.',
              timestamp: new Date(Date.now() - 5 * 3600 * 1000),
            },
          ],
        },
        {
          name: 'Meera Nambiar',
          company: 'FinEdge Advisory Services',
          phone: '+919871165432',
          email: 'meera.n@finedgeadvisory.com',
          city: 'Delhi NCR',
          service: 'Full-Stack SaaS Product Development',
          status: 'Converted',
          assignedTo: rajesh?._id || null,
          assignedToName: rajesh?.name || 'Rajesh Sharma',
          notes: 'Advance 50% received! Frontend assigned to Aman Verma (React) and UI design to Priya Patel. Kickoff call completed.',
          lastContactedAt: new Date(Date.now() - 8 * 3600 * 1000),
          history: [
            {
              callerName: 'Rajesh Sharma',
              callerId: rajesh?._id,
              fromStatus: 'Interested',
              toStatus: 'Converted',
              note: 'Statement of Work signed. Total project value: ₹6.8 Lakhs.',
              timestamp: new Date(Date.now() - 8 * 3600 * 1000),
            },
          ],
        },
        {
          name: 'Deepak Chawla',
          company: 'Urban FinTech Labs',
          phone: '+919712398712',
          email: 'deepak.c@urbanfintech.io',
          city: 'Hyderabad',
          service: 'Mobile App Development (Android & iOS)',
          status: 'Not Interested',
          assignedTo: rajesh?._id || null,
          assignedToName: rajesh?.name || 'Rajesh Sharma',
          notes: 'Already have an in-house mobile team in Bangalore. Looking only for backend devs.',
          lastContactedAt: new Date(Date.now() - 12 * 3600 * 1000),
          history: [],
        },
        {
          name: 'Ananya Deshmukh',
          company: 'Deshmukh Infrastructure',
          phone: '+919866677889',
          email: 'ananya@deshmukhinfra.com',
          city: 'Nagpur',
          service: 'Custom Web Development (React / Next.js)',
          status: 'New',
          assignedTo: priya?._id || null,
          assignedToName: priya?.name || 'Priya Patel',
          notes: 'Requires modern responsive corporate website with dynamic CMS for civil projects.',
          history: [],
        },
      ];

      await Lead.insertMany(leadsToSeed);
      console.log(`[Seed] Inserted ${leadsToSeed.length} leads.`);
    }

    // 3. Seed Tasks if none exist
    const taskCount = await Task.countDocuments();
    if (taskCount === 0) {
      console.log('[Seed] Seeding IT tasks...');
      const tasksToSeed = [
        {
          title: 'Code responsive navigation bar & dark mode in React for FinEdge portal',
          assignedTo: aman?._id,
          assignedToName: aman?.name || 'Aman Verma (Frontend Dev)',
          priority: 'Urgent',
          status: 'In Progress',
          dueDate: new Date(Date.now() + 24 * 3600 * 1000),
        },
        {
          title: 'Create Figma design system & 3 hero mockup options for health app',
          assignedTo: priya?._id,
          assignedToName: priya?.name || 'Priya Patel (UI/UX Designer)',
          priority: 'High',
          status: 'In Progress',
          dueDate: new Date(Date.now() + 48 * 3600 * 1000),
        },
        {
          title: 'Design 8 promotional banner creatives for Instagram & LinkedIn ad campaign',
          assignedTo: neha?._id,
          assignedToName: neha?.name || 'Neha Mehta (Graphic Designer)',
          priority: 'Medium',
          status: 'Pending',
          dueDate: new Date(Date.now() + 72 * 3600 * 1000),
        },
        {
          title: 'Cold call 50 US e-commerce brands for React / Shopify migration',
          assignedTo: rajesh?._id,
          assignedToName: rajesh?.name || 'Rajesh Sharma (IT Sales)',
          priority: 'High',
          status: 'Completed',
          dueDate: new Date(),
        },
      ];

      await Task.insertMany(tasksToSeed);
      console.log(`[Seed] Inserted ${tasksToSeed.length} tasks.`);
    }

    // 4. Seed Attendance if none exist
    const attendanceCount = await Attendance.countDocuments();
    if (attendanceCount === 0) {
      console.log('[Seed] Seeding realistic attendance records...');
      const todayStr = new Date().toISOString().slice(0, 10);
      const yesterdayStr = new Date(Date.now() - 24 * 3600 * 1000).toISOString().slice(0, 10);

      const attendanceToSeed = [
        // Today
        {
          userId: rajesh?._id,
          userName: rajesh?.name || 'Rajesh Sharma',
          userRole: 'Caller',
          date: todayStr,
          punchIn: new Date(new Date().setHours(9, 15, 0, 0)),
          punchOut: null,
          status: 'Present',
          durationHours: null,
          workSummary: '',
        },
        {
          userId: aman?._id,
          userName: aman?.name || 'Aman Verma',
          userRole: 'Employee',
          date: todayStr,
          punchIn: new Date(new Date().setHours(9, 10, 0, 0)),
          punchOut: null,
          status: 'Present',
          durationHours: null,
          workSummary: '',
        },
        {
          userId: neha?._id,
          userName: neha?.name || 'Neha Mehta',
          userRole: 'Employee',
          date: todayStr,
          punchIn: new Date(new Date().setHours(9, 45, 0, 0)),
          punchOut: null,
          status: 'Late',
          durationHours: null,
          workSummary: '',
        },
        // Yesterday
        {
          userId: aman?._id,
          userName: aman?.name || 'Aman Verma',
          userRole: 'Employee',
          date: yesterdayStr,
          punchIn: new Date(new Date(Date.now() - 24 * 3600 * 1000).setHours(9, 0, 0, 0)),
          punchOut: new Date(new Date(Date.now() - 24 * 3600 * 1000).setHours(18, 30, 0, 0)),
          status: 'Present',
          durationHours: 9.5,
          workSummary: 'Built responsive client portal header, auth guard, and connected Redux store for FinEdge web project.',
        },
        {
          userId: neha?._id,
          userName: neha?.name || 'Neha Mehta',
          userRole: 'Employee',
          date: yesterdayStr,
          punchIn: new Date(new Date(Date.now() - 24 * 3600 * 1000).setHours(9, 20, 0, 0)),
          punchOut: new Date(new Date(Date.now() - 24 * 3600 * 1000).setHours(18, 15, 0, 0)),
          status: 'Present',
          durationHours: 8.92,
          workSummary: 'Designed 12 social media graphics and brand deck in Illustrator & Photoshop for Zenith Real Estate.',
        },
      ];

      await Attendance.insertMany(attendanceToSeed);
      console.log(`[Seed] Inserted ${attendanceToSeed.length} attendance records.`);
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
