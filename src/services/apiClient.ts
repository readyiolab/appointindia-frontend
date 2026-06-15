import axios from 'axios';
import { BASE_URL, ENDPOINTS } from './endpoints';

// We will dynamically import the store to avoid circular dependency issues
let storeModule: any = null;
const getStore = () => {
  if (!storeModule) {
    try {
      // Try to require or import. In Vite/ESM, we can import store.
      // But we can also access it globally or set it dynamically.
      // To be safe and clean, we will access store via a setter,
      // or we can import store. Since Vite handles imports fine,
      // let's import store dynamically or simply import it statically.
      // Static import works fine unless there is an actual circular import.
      // Let's import statically first as it is TypeScript standard.
    } catch (e) {
      console.error(e);
    }
  }
  return storeModule;
};

// Set up the static client
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A flag and queue to handle multiple concurrent 401s
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Inject JWT token
apiClient.interceptors.request.use(
  (config) => {
    const authStateStr = localStorage.getItem('persist_auth');
    if (authStateStr) {
      try {
        const auth = JSON.parse(authStateStr);
        if (auth?.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${auth.accessToken}`;
        }
      } catch (err) {
        console.error('Error parsing persist_auth in request interceptor', err);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error status is 401 and request has not already been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const authStateStr = localStorage.getItem('persist_auth');
        let refreshToken = '';
        if (authStateStr) {
          const auth = JSON.parse(authStateStr);
          refreshToken = auth?.refreshToken || '';
        }

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Perform token refresh call
        // Note: Using direct axios call to avoid the interceptor here
        const response = await axios.post(`${BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
          refreshToken,
        });

        // Backend response standard is: { success: true, data: { accessToken, refreshToken } }
        const { data } = response.data;
        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken;

        // Persist new tokens
        const authState = authStateStr ? JSON.parse(authStateStr) : {};
        localStorage.setItem(
          'persist_auth',
          JSON.stringify({
            ...authState,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          })
        );

        // Dispatch a custom event to update Redux store
        window.dispatchEvent(
          new CustomEvent('auth:token_refreshed', {
            detail: { accessToken: newAccessToken, refreshToken: newRefreshToken },
          })
        );

        processQueue(null, newAccessToken);
        isRefreshing = false;

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;

        // Persist session logout
        localStorage.removeItem('persist_auth');
        window.dispatchEvent(new CustomEvent('auth:logout_expired'));
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
