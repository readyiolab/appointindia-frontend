import { useState, useCallback } from 'react';

export const useApi = <T = any, Args extends any[] = any[]>(
  apiFunc: (...args: Args) => Promise<any>
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunc(...args);
        // Normalize response structure: check if it's nested under data.data
        const result = response?.data?.data !== undefined ? response.data.data : response?.data !== undefined ? response.data : response;
        setData(result);
        return result;
      } catch (err: any) {
        const errMsg = err.response?.data?.message || err.message || 'An error occurred';
        setError(errMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  return {
    data,
    loading,
    error,
    execute,
    setData,
  };
};
export default useApi;
