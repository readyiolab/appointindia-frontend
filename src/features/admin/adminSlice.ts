import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/apiClient';
import { ENDPOINTS } from '../../services/endpoints';

export interface UserAdminData {
  id: string;
  email: string;
  phone?: string | null;
  role: 'candidate' | 'recruiter' | 'company_admin' | 'admin';
  status: 'pending' | 'active' | 'suspended' | 'locked';
  emailVerified: boolean;
  createdAt: string | null;
}

interface AdminState {
  users: UserAdminData[];
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  loading: false,
  error: null,
};

export const fetchUsersThunk = createAsyncThunk(
  'admin/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.ADMIN.USERS);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch users list'
      );
    }
  }
);

export const updateUserStatusThunk = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ id, status }: { id: string; status: UserAdminData['status'] }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(ENDPOINTS.ADMIN.USER_STATUS(id), { status });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to update user status'
      );
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminState: (state) => {
      state.users = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload || [];
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update User Status
      .addCase(updateUserStatusThunk.fulfilled, (state, action) => {
        // action.payload could be the updated user or a success message
        // Usually it's the updated user. If it's a message, we can manually toggle status.
        // Let's assume it returns the updated user object or we map it:
        const updated = action.payload;
        if (updated && updated.id) {
          state.users = state.users.map((user) => (user.id === updated.id ? { ...user, status: updated.status } : user));
        }
      });
  },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
