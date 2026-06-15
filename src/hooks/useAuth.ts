import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loginThunk, registerThunk, logoutThunk, fetchCandidateProfileThunk, updateCandidateProfileThunk } from '../features/auth/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { accessToken, user, candidateProfile, loading, profileLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const login = (credentials: Record<string, string>) => {
    return dispatch(loginThunk(credentials));
  };

  const register = (userData: Record<string, any>) => {
    return dispatch(registerThunk(userData));
  };

  const logout = () => {
    return dispatch(logoutThunk());
  };

  const fetchProfile = useCallback(() => {
    return dispatch(fetchCandidateProfileThunk());
  }, [dispatch]);

  const updateProfile = useCallback(
    (profileData: Record<string, unknown>) => {
      return dispatch(updateCandidateProfileThunk(profileData));
    },
    [dispatch]
  );

  return {
    accessToken,
    user,
    candidateProfile,
    loading,
    profileLoading,
    error,
    isLoggedIn: !!accessToken,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
  };
};
