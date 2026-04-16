const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * AUTH INTERCEPTOR:
 * Automatically retrieves the JWT from localStorage and prepares headers.
 */
const getAuthHeaders = (options = {}) => {
  const token = localStorage.getItem('access_token');
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle standard JSON headers if not multipart/form-data
  if (!options.isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  return headers;
};

async function fetchClient(endpoint, options = {}) {
  const headers = getAuthHeaders(options);
  
  // If isFormData is true, browser must set Content-Type + Boundary
  if (options.isFormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { detail: 'API request failed' };
      }
      
      const error = new Error(errorData.detail || 'API Error');
      error.status = response.status;
      error.data = errorData;

      // Global 401 Interceptor: Clean up stale tokens
      if (response.status === 401) {
        console.warn('Session expired or unauthorized. Clearing credentials.');
        localStorage.removeItem('access_token');
        // Optional: Redirect to login if this is a blocking failure
      }

      throw error;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export default {
  get: (endpoint, options = {}) => fetchClient(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options = {}) => {
    const isUrlEncoded = body instanceof URLSearchParams;
    const isFormData = body instanceof FormData;
    
    return fetchClient(endpoint, { 
      method: 'POST', 
      body: (isUrlEncoded || isFormData) ? body : JSON.stringify(body),
      ...options,
      isFormData
    });
  },
  put: (endpoint, body, options = {}) => fetchClient(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(body), 
    ...options 
  }),
  delete: (endpoint, options = {}) => fetchClient(endpoint, { 
    method: 'DELETE', 
    ...options 
  }),
};
