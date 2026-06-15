export const BASE_URL = 'http://localhost:3000/api/v1';

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },
  JOBS: {
    BASE: '/jobs',
    SEARCH: '/jobs/search',
    DETAIL: (id: string) => `/jobs/${id}`,
  },
  CANDIDATES: {
    ME: '/candidates/me',
  },
  APPLICATIONS: {
    BASE: '/applications',
    ME: '/applications/me',
    RECRUITER_PIPELINE: '/applications/recruiter/pipeline',
    STATUS: (id: string) => `/applications/${id}/status`,
  },
  ADMIN: {
    USERS: '/admin/users',
    USER_STATUS: (id: string) => `/admin/users/${id}/status`,
  },
};
