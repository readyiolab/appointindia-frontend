import { useAppSelector } from '../app/hooks';

export const useRole = () => {
  const { user } = useAppSelector((state) => state.auth);

  return {
    role: user?.role || null,
    isAdmin: user?.role === 'admin',
    isCandidate: user?.role === 'candidate',
    isRecruiter: user?.role === 'recruiter',
    isCompanyAdmin: user?.role === 'company_admin',
    isAgent: user?.role === 'recruiter' || user?.role === 'company_admin',
  };
};
