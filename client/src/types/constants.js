export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  CALLER: 'Caller',
  EMPLOYEE: 'Employee',
};

export const LEAD_STATUS = {
  NEW: 'New',
  CONNECTED: 'Connected',
  INTERESTED: 'Interested',
  NOT_INTERESTED: 'Not Interested',
  CALLBACK_REQUIRED: 'Callback Required',
  INVALID_NUMBER: 'Invalid Number',
  CONVERTED: 'Converted',
};

export const LEAD_STATUS_CONFIG = {
  [LEAD_STATUS.NEW]: {
    label: 'New Lead',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-500',
    description: 'Fresh lead not contacted yet',
  },
  [LEAD_STATUS.CONNECTED]: {
    label: 'Connected',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    badge: 'bg-sky-500',
    description: 'Call answered, spoke with client',
  },
  [LEAD_STATUS.INTERESTED]: {
    label: 'Interested',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-500',
    description: 'Expressed strong interest in IT services',
  },
  [LEAD_STATUS.CALLBACK_REQUIRED]: {
    label: 'Callback Required',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-500',
    description: 'Follow-up requested at specific time',
  },
  [LEAD_STATUS.NOT_INTERESTED]: {
    label: 'Not Interested',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-500',
    description: 'Declined or no requirement',
  },
  [LEAD_STATUS.INVALID_NUMBER]: {
    label: 'Invalid Number',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    badge: 'bg-slate-400',
    description: 'Wrong number, switched off, unreachable',
  },
  [LEAD_STATUS.CONVERTED]: {
    label: 'Converted',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-600',
    description: 'Deal closed / Project onboarded successfully',
  },
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  LATE: 'Late',
  HALF_DAY: 'Half Day',
  LEAVE: 'Leave',
  ABSENT: 'Absent',
};

export const ATTENDANCE_STATUS_CONFIG = {
  [ATTENDANCE_STATUS.PRESENT]: {
    label: 'Present',
    code: 'P',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  [ATTENDANCE_STATUS.LATE]: {
    label: 'Late',
    code: 'L',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  [ATTENDANCE_STATUS.HALF_DAY]: {
    label: 'Half Day',
    code: 'HD',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  [ATTENDANCE_STATUS.LEAVE]: {
    label: 'On Leave',
    code: 'LV',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  [ATTENDANCE_STATUS.ABSENT]: {
    label: 'Absent',
    code: 'A',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
};

// IT Solutions Specific Departments
export const IT_DEPARTMENTS = [
  'Frontend Development',
  'Graphic Design & UI/UX',
  'Backend & Cloud Architecture',
  'Mobile App Engineering',
  'IT Sales & B2B Telecalling',
  'Digital Marketing & SEO',
  'QA & Software Testing',
  'Project Management & Operations',
];

// IT Solutions Roles / Tech Designations
export const IT_DESIGNATIONS = [
  'Frontend Developer (React / Next.js / Tailwind)',
  'Graphic Designer (Photoshop / Illustrator / Canva)',
  'UI/UX Designer (Figma / Adobe XD)',
  'Backend Developer (Node.js / Express / MongoDB)',
  'Full Stack Developer (MERN Stack)',
  'IT Telecaller & B2B Client Closer',
  'Mobile App Developer (Flutter / React Native)',
  'SEO & Social Media Marketing Executive',
  'WordPress & Shopify Developer',
  'QA & Automation Engineer',
  'DevOps & AWS Cloud Engineer',
  'Project Manager / Tech Lead',
];

// IT Solutions Services for Leads
export const IT_SERVICES = [
  'Custom Web Development (React / Next.js)',
  'Graphic Design & Brand Identity (Logo, Social Posts, Ads)',
  'UI/UX Design (Figma Prototypes & Wireframes)',
  'Mobile App Development (Android & iOS)',
  'Full-Stack SaaS Product Development',
  'E-Commerce Development (Shopify / Custom MERN)',
  'SEO & Digital Marketing Growth Campaigns',
  'Cloud Infrastructure & DevOps Setup (AWS / Docker)',
  'API Integration & Business Automation',
  'Website Redesign & Monthly IT AMC Support',
];
