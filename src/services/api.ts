// E-commerce API Client Configuration
// const API_BASE_URL = 'https://authservice-1-p945.onrender.com/api';
const API_BASE_URL = 'localhost:8080/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  token?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

/**
 * Helper to handle fetch responses and handle JSON parsing and errors.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  let data: any;
  try {
    data = await response.json();
  } catch (e) {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    throw new Error('Failed to parse response JSON');
  }

  // Handle case where API reports status failure directly in the JSON response
  if (data && data.apiStatus === false) {
    throw new Error(data.message || data.errors || 'An error occurred');
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP error! Status: ${response.status}`);
  }

  return data as T;
}

export const api = {
  /**
   * Log in user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return await handleResponse<AuthResponse>(response);
  },

  /**
   * Register a new user
   */
  async register(payload: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    phone?: string;
    timeZone: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return await handleResponse<AuthResponse>(response);
  }
};
