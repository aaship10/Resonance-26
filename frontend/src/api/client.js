const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

async function fetchClient(endpoint, options = {}) {
  // Setup headers
  const headers = { ...options.headers };
  
  if (!options.isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  } else {
    // Rely on the browser to append Content-Type with FormData boundary
    delete headers['Content-Type'];
  }

  // Attach Authentication token if exists in local storage
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`; // Adjust scheme if not Bearer
  }

  // Set up the fetch configuration
  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // Provide generic error handling
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { detail: 'An error occurred while parsing the error response.' };
      }
      
      const error = new Error(errorData.detail || 'API Error');
      error.status = response.status;
      error.data = errorData;
      // Depending on your structure, you could potentially intercept a 401 Unauthorized here
      // to dispatch a logout action
      if (response.status === 401) {
        // e.g., trigger automatic logout by removing the token
        console.warn('Unauthorized! Deleting token...');
        localStorage.removeItem('access_token');
      }

      throw error;
    }

    return await response.json();
  } catch (error) {
    // Re-throw the error so specific handlers can process it
    throw error;
  }
}

export default {
  get: (endpoint, options = {}) => fetchClient(endpoint, { method: 'GET', ...options }),
  post: (endpoint, body, options = {}) => {
    const isUrlEncoded = body instanceof URLSearchParams;
    const isFormData = body instanceof FormData;
    
    // Copy options and headers
    const finalOptions = { ...options };
    const finalHeaders = { ...options.headers };

    if (isUrlEncoded) {
      finalHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (isFormData) {
      // Browsers automatically set Content-Type with boundary for FormData
      // Delete the default application/json header set in fetchClient if it exists
      // Wait, fetchClient ALWAYS sets application/json. We must pass a flag to tell it not to!
      // But we can just set it to undefined here, and in fetchClient it overrides. Wait, setting to undefined sends string "undefined"! 
    }

    return fetchClient(endpoint, { 
      method: 'POST', 
      body: (isUrlEncoded || isFormData) ? body : JSON.stringify(body),
      ...options,
      isFormData // custom flag to strip header in fetchClient
    });
  },
  put: (endpoint, body, options = {}) => fetchClient(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options }),
  delete: (endpoint, options = {}) => fetchClient(endpoint, { method: 'DELETE', ...options }),
};
