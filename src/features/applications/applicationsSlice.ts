import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../services/apiClient';
import { ENDPOINTS } from '../../services/endpoints';

export interface ApplicationData {
  id: string;
  jobId: string;
  candidateId: string;
  resumeId?: string;
  status: 'applied' | 'screening' | 'shortlisted' | 'interview_scheduled' | 'rejected' | 'hired';
  appliedAt: string;
  recruiterNotes?: string;
  jobTitle?: string;
  workMode?: 'remote' | 'hybrid' | 'onsite';
  location?: string;
  jobType?: string;
  companyName?: string;
  candidateName?: string;
  candidateEmail?: string;
  candidatePhone?: string;
  candidateHeadline?: string;
  totalExperienceYears?: number;
}

export interface JobSummary {
  id: string;
  title: string;
  workMode: string;
  location: string;
  status: string;
  postedAt: string;
  applicationCount: number;
  hiredCount: number;
}

export interface PipelineFilters {
  jobId?: string;
  status?: ApplicationData['status'] | '';
  workMode?: 'remote' | 'hybrid' | 'onsite' | '';
  search?: string;
  page?: number;
  limit?: number;
}

interface ApplicationsState {
  myApplications: ApplicationData[];
  recruiterPipeline: ApplicationData[];
  jobSummaries: JobSummary[];
  pipelineTotal: number;
  pipelinePage: number;
  pipelineLimit: number;
  pipelineTotalPages: number;
  pipelineStats: {
    byStatus: { status: string; count: number | string }[];
    byWorkMode: { work_mode: string; count: number | string }[];
  };
  loading: boolean;
  pipelineLoading: boolean;
  applyLoading: boolean;
  applyError: string | null;
  applySuccess: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  myApplications: [],
  recruiterPipeline: [],
  jobSummaries: [],
  pipelineTotal: 0,
  pipelinePage: 1,
  pipelineLimit: 24,
  pipelineTotalPages: 0,
  pipelineStats: { byStatus: [], byWorkMode: [] },
  loading: false,
  pipelineLoading: false,
  applyLoading: false,
  applyError: null,
  applySuccess: false,
  error: null,
};

export const fetchMyApplicationsThunk = createAsyncThunk(
  'applications/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.APPLICATIONS.ME);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch applications'
      );
    }
  }
);

export const fetchRecruiterPipelineThunk = createAsyncThunk(
  'applications/fetchRecruiterPipeline',
  async (filters: PipelineFilters = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(ENDPOINTS.APPLICATIONS.RECRUITER_PIPELINE, {
        params: {
          jobId: filters.jobId || undefined,
          status: filters.status || undefined,
          workMode: filters.workMode || undefined,
          search: filters.search || undefined,
          page: filters.page ?? 1,
          limit: filters.limit ?? 24,
        },
      });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to fetch recruiter pipeline'
      );
    }
  }
);

export const applyToJobThunk = createAsyncThunk(
  'applications/apply',
  async (payload: { jobId: string; resumeId?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(ENDPOINTS.APPLICATIONS.BASE, payload);
      return response.data.data;
    } catch (err: any) {
      const apiMessage = err.response?.data?.message;
      const firstError = err.response?.data?.errors?.[0]?.reason;
      return rejectWithValue(apiMessage || firstError || err.message || 'Failed to submit application');
    }
  }
);

export const updateApplicationStatusThunk = createAsyncThunk(
  'applications/updateStatus',
  async ({ id, status }: { id: string; status: ApplicationData['status'] }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(ENDPOINTS.APPLICATIONS.STATUS(id), { status });
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Failed to update status'
      );
    }
  }
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearApplyFeedback: (state) => {
      state.applyError = null;
      state.applySuccess = false;
    },
    clearApplicationsState: (state) => {
      state.myApplications = [];
      state.recruiterPipeline = [];
      state.jobSummaries = [];
      state.loading = false;
      state.pipelineLoading = false;
      state.applyLoading = false;
      state.applyError = null;
      state.applySuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyApplicationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyApplicationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myApplications = action.payload || [];
      })
      .addCase(fetchMyApplicationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRecruiterPipelineThunk.pending, (state) => {
        state.pipelineLoading = true;
        state.error = null;
      })
      .addCase(fetchRecruiterPipelineThunk.fulfilled, (state, action) => {
        state.pipelineLoading = false;
        state.recruiterPipeline = action.payload?.items || [];
        state.jobSummaries = action.payload?.jobSummaries || [];
        state.pipelineTotal = action.payload?.total ?? 0;
        state.pipelinePage = action.payload?.page ?? 1;
        state.pipelineLimit = action.payload?.limit ?? 24;
        state.pipelineTotalPages = action.payload?.totalPages ?? 0;
        state.pipelineStats = action.payload?.stats || { byStatus: [], byWorkMode: [] };
      })
      .addCase(fetchRecruiterPipelineThunk.rejected, (state, action) => {
        state.pipelineLoading = false;
        state.error = action.payload as string;
      })
      .addCase(applyToJobThunk.pending, (state) => {
        state.applyLoading = true;
        state.applyError = null;
        state.applySuccess = false;
      })
      .addCase(applyToJobThunk.fulfilled, (state, action) => {
        state.applyLoading = false;
        state.applySuccess = true;
        if (action.payload?.id) {
          const exists = state.myApplications.some((a) => a.id === action.payload.id);
          if (!exists) {
            state.myApplications.unshift({
              id: action.payload.id,
              jobId: action.payload.jobId,
              candidateId: action.payload.candidateId || '',
              status: action.payload.status || 'applied',
              appliedAt: new Date().toISOString(),
            });
          }
        }
      })
      .addCase(applyToJobThunk.rejected, (state, action) => {
        state.applyLoading = false;
        state.applyError = action.payload as string;
      })
      .addCase(updateApplicationStatusThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) return;
        state.recruiterPipeline = state.recruiterPipeline.map((app) =>
          app.id === updated.id ? { ...app, ...updated } : app
        );
        state.myApplications = state.myApplications.map((app) =>
          app.id === updated.id ? { ...app, ...updated } : app
        );
      });
  },
});

export const { clearApplyFeedback, clearApplicationsState } = applicationsSlice.actions;
export default applicationsSlice.reducer;
