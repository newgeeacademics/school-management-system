
import { GraduationCap, School } from "lucide-react";

export const USER_ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

export const ROLE_OPTIONS = [
  {
    value: USER_ROLES.STUDENT,
    label: 'Student',
    icon: GraduationCap,
  },
  {
    value: USER_ROLES.TEACHER,
    label: 'Teacher',
    icon: School,
  },
];

export const DEPARTMENTS = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Economics',
  'Business Administration',
  'Engineering',
  'Psychology',
  'Sociology',
  'Political Science',
  'Philosophy',
  'Education',
  'Fine Arts',
  'Music',
  'Physical Education',
  'Law',
] as const;


export const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
  value: dept,
  label: dept,
}));

export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB in bytes
export const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];


// Backend API — set VITE_API_URL / VITE_BACKEND_BASE_URL in .env
// Local Spring Boot default: http://localhost:8080
// Production (Render): https://school-management-system-gw9s.onrender.com
export const DEFAULT_PRODUCTION_API_URL = 'https://school-management-system-gw9s.onrender.com';

function resolveApiBaseUrl(): string {
  const fromEnv =
    import.meta.env.VITE_API_URL?.trim() || import.meta.env.VITE_BACKEND_BASE_URL?.trim();
  if (fromEnv) return fromEnv;
  if (import.meta.env.PROD) return DEFAULT_PRODUCTION_API_URL;
  return 'http://localhost:8080';
}

export const isApiUrlFromEnv = Boolean(
  import.meta.env.VITE_API_URL?.trim() || import.meta.env.VITE_BACKEND_BASE_URL?.trim()
);

export const BACKEND_BASE_URL = resolveApiBaseUrl();
export const BASE_URL = BACKEND_BASE_URL;

// Authentication Token Keys (dev only)
export const ACCESS_TOKEN_KEY = import.meta.env.VITE_ACCESS_TOKEN_KEY || 'dev_access_token';
export const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY || 'dev_refresh_token';

export const REFRESH_TOKEN_URL = `${BASE_URL}/refresh-token`;

// Cloudinary Configuration (dev only - optional, can be empty for local dev)
export const CLOUDINARY_UPLOAD_URL = import.meta.env.VITE_CLOUDINARY_UPLOAD_URL || '';
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';