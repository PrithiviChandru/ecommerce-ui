// E-commerce API Client Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorData.error || errorMsg;
    } catch {
      errorMsg = `HTTP error! Status: ${response.status}`;
    }
    throw new Error(errorMsg);
  }
  return response.json() as Promise<T>;
}

export const api = {
  /**
   * Log in user
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // First attempt to call the actual API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      return await handleResponse<AuthResponse>(response);
    } catch (err) {
      console.warn('Real API call failed. Falling back to simulated mock authentication. Error:', err);
      
      // Simulated mock logic for testing UI without the backend running
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email === 'admin@example.com' && password === 'admin123') {
            resolve({
              user: {
                id: '1',
                email: 'admin@example.com',
                name: 'Admin User',
                role: 'admin',
              },
              token: 'mock-jwt-token-123456',
              message: 'Login successful (Mock Mode)',
            });
          } else if (email.endsWith('@example.com') && password.length >= 6) {
            resolve({
              user: {
                id: '2',
                email: email,
                name: email.split('@')[0].toUpperCase(),
                role: 'user',
              },
              token: 'mock-jwt-token-789012',
              message: 'Login successful (Mock Mode)',
            });
          } else {
            reject(new Error('Invalid email or password. Hint: Use admin@example.com / admin123 or any @example.com email with >= 6 chars password.'));
          }
        }, 1200); // Simulate network latency
      });
    }
  },
};
