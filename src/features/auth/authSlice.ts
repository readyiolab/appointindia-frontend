import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../services/apiClient';
import { ENDPOINTS } from '../../services/endpoints';

export interface UserInfo {
  id: string;
  email: string;
  role: 'admin' | 'candidate' | 'recruiter' | 'company_admin';
  status: string;
}

export interface CandidateProfileData {
  id?: string;
  firstName?: string;
  lastName?: string;
  headline?: string;
  currentLocation?: string;
  preferredLocation?: string;
  totalExperienceYears?: number;
  currentSalary?: number;
  expectedSalary?: number;
  summary?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
  candidateProfile: CandidateProfileData | null;
  loading: boolean;
  profileLoading: boolean;
  error: string | null;
}

const getInitialState = (): AuthState => {
  const persisted = localStorage.getItem('persist_auth');
  if (persisted) {
    try {
      const parsed = JSON.parse(persisted);
      return {
        accessToken: parsed.accessToken || null,
        refreshToken: parsed.refreshToken || null,
        user: parsed.user || null,
        candidateProfile: parsed.candidateProfile || null,
        loading: false,
        profileLoading: false,
        error: null,
      };
    } catch (e) {
      console.error('Failed to parse persisted auth', e);
    }
  }
  return {
    accessToken: null,
    refreshToken: null,
    user: null,
    candidateProfile: null,
    loading: false,
    profileLoading: false,
    error: null,
  };
};

const saveToLocalStorage = (state: AuthState) => {
  localStorage.setItem(
    'persist_auth',
    JSON.stringify({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      user: state.user,
      candidateProfile: state.candidateProfile,
    })
  );
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: Record<string, string>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, credentials);
      // Expected response structure: { success: true, data: { accessToken, refreshToken, user: { id, email, role, status } } }
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Login failed'
      );
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData: Record<string, any>, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Registration failed'
      );
    }
  }
);

export const fetchCandidateProfileThunk = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.CANDIDATES.ME);
      // Expected response structure: { success: true, data: { ...profileDetails } }
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch candidate profile'
      );
    }
  }
);

export const updateCandidateProfileThunk = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: CandidateProfileData, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(ENDPOINTS.CANDIDATES.ME, profileData);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to update candidate profile'
      );
    }
  }
);

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      // Call backend logout (silent, ignore errors if token already expired)
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch (e) {
      // Token may be invalid/expired, proceed anyway
    }
    localStorage.removeItem('persist_auth');
    dispatch(clearAuth());
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    clearAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.candidateProfile = null;
      state.loading = false;
      state.profileLoading = false;
      state.error = null;
    },
    tokenRefreshed: (state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      saveToLocalStorage(state);
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.error = null;
        saveToLocalStorage(state);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
        state.error = null;
        saveToLocalStorage(state);
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Candidate Profile (separate flag — must not toggle global auth loading)
      .addCase(fetchCandidateProfileThunk.pending, (state) => {
        state.profileLoading = true;
        state.error = null;
      })
      .addCase(fetchCandidateProfileThunk.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.candidateProfile = action.payload;
        saveToLocalStorage(state);
      })
      .addCase(fetchCandidateProfileThunk.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload as string;
      })
      // Update Candidate Profile
      .addCase(updateCandidateProfileThunk.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(updateCandidateProfileThunk.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.candidateProfile = action.payload;
        saveToLocalStorage(state);
      })
      .addCase(updateCandidateProfileThunk.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAuth, tokenRefreshed } = authSlice.actions;
export default authSlice.reducer;
