import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/apiClient';
import { ENDPOINTS } from '../../services/endpoints';

export interface JobData {
  id?: string;
  companyId?: string;
  recruiterId?: string;
  title: string;
  description: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  jobType: 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
  workMode: 'remote' | 'hybrid' | 'onsite';
  minSalary?: number;
  maxSalary?: number;
  minExperienceYears?: number;
  maxExperienceYears?: number;
  expiresAt: string;
  status?: 'draft' | 'published' | 'closed' | 'paused';
  createdAt?: string;
}

interface JobsState {
  jobs: JobData[];
  currentJob: JobData | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

const initialState: JobsState = {
  jobs: [],
  currentJob: null,
  loading: false,
  detailLoading: false,
  error: null,
};

export const searchJobsThunk = createAsyncThunk(
  'jobs/search',
  async (params: Record<string, string | number | undefined> | undefined, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.JOBS.SEARCH, { params });
      // Backend response standard is: { success: true, data: [ ...jobs ] } or similar
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to search jobs'
      );
    }
  }
);

export const fetchJobDetailsThunk = createAsyncThunk(
  'jobs/fetchDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.JOBS.DETAIL(id));
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch job details'
      );
    }
  }
);

export const createJobThunk = createAsyncThunk(
  'jobs/create',
  async (jobData: JobData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.JOBS.BASE, jobData);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to create job'
      );
    }
  }
);

export const updateJobThunk = createAsyncThunk(
  'jobs/update',
  async ({ id, jobData }: { id: string; jobData: Partial<JobData> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(ENDPOINTS.JOBS.DETAIL(id), jobData);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to update job'
      );
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Search Jobs
      .addCase(searchJobsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchJobsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload || [];
      })
      .addCase(searchJobsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Job Details
      .addCase(fetchJobDetailsThunk.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchJobDetailsThunk.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentJob = action.payload;
      })
      .addCase(fetchJobDetailsThunk.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload as string;
      })
      // Create Job
      .addCase(createJobThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(createJobThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs.unshift(action.payload);
      })
      .addCase(createJobThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Job
      .addCase(updateJobThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateJobThunk.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        state.jobs = state.jobs.map((job) => (job.id === updated.id ? updated : job));
        if (state.currentJob?.id === updated.id) {
          state.currentJob = updated;
        }
      })
      .addCase(updateJobThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentJob } = jobsSlice.actions;
export default jobsSlice.reducer;
