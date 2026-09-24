import { ref } from 'vue';

export interface ApiLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  status?: number;
  duration?: number;
  requestData?: any;
  responseData?: any;
  error?: any;
}

export const apiLogs = ref<ApiLog[]>([]);

export function useApi() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.apiBase || 'http://localhost:3000/api';

  const callApi = async <T = any>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
      params?: Record<string, any>;
      body?: any;
      headers?: Record<string, string>;
    } = {},
  ): Promise<{ data: T | null; error: any }> => {
    const method = options.method || 'GET';
    const fullUrl = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
    const startTime = Date.now();

    const logEntry: ApiLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      method,
      url: fullUrl,
      requestData: options.body || options.params,
    };

    try {
      // Build query string
      let fetchUrl = fullUrl;
      if (options.params) {
        const queryParams = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, String(value));
          }
        });
        const qs = queryParams.toString();
        if (qs) {
          fetchUrl += `?${qs}`;
        }
      }

      logEntry.url = fetchUrl;

      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      };

      if (options.body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(options.body);
      }

      const res = await fetch(fetchUrl, fetchOptions);
      const duration = Date.now() - startTime;
      logEntry.duration = duration;
      logEntry.status = res.status;

      let result: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        result = await res.text();
      }

      logEntry.responseData = result;

      // Prepend to logs, keep last 20
      apiLogs.value = [logEntry, ...apiLogs.value.slice(0, 19)];

      if (!res.ok) {
        const errorMsg =
          result?.message ||
          (Array.isArray(result?.message)
            ? result.message.join(', ')
            : `HTTP Error ${res.status}`);
        return { data: null, error: errorMsg };
      }

      return { data: result, error: null };
    } catch (err: any) {
      logEntry.duration = Date.now() - startTime;
      logEntry.error = err.message || '連線失敗';
      apiLogs.value = [logEntry, ...apiLogs.value.slice(0, 19)];
      return { data: null, error: err.message || '連線錯誤' };
    }
  };

  return {
    callApi,
    apiLogs,
    clearLogs: () => {
      apiLogs.value = [];
    },
  };
}
