// E-commerce API Client Configuration
const API_BASE_URL = 'https://authservice-84yz.onrender.com/api';
// const API_BASE_URL = 'http://localhost:8081/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  token?: string;
}

export interface AuthResponse {
  message?: string;
  apiStatus?: boolean;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: User;
    token?: string;
    verifyToken?: string;
    userInfo?: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      phone: string | null;
      timeZone: string;
      createdAt: string;
      updatedAt: string;
    };
  };
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

export interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone: string | null;
  timeZone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  apiStatus: boolean;
  message: string;
  data: ProfileData;
  errors: any;
  timeStamp: string;
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
  },

  /**
   * Verify email using token
   */
  async verifyEmail(verifyToken: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ verifyToken })
    });
    return await handleResponse<any>(response);
  },

  /**
   * Fetch User Profile
   */
  async getProfile(token: string): Promise<ProfileResponse> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return await handleResponse<ProfileResponse>(response);
  },

  /**
   * Update User Profile details
   */
  async updateProfile(token: string, payload: {
    firstName: string;
    lastName: string;
    phone: string | null;
    timeZone: string;
  }): Promise<ProfileResponse> {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return await handleResponse<ProfileResponse>(response);
  },

  /**
   * Fetch products list with pagination and sorting
   */
  async getProducts(token: string, page = 0, size = 50, sortBy = 'id', sortDir = 'asc'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/products?page=${page}&size=${size}&sortBy=${sortBy}&sortDIr=${sortDir}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return await handleResponse<any>(response);
  },

  /**
   * Fetch categories list
   */
  async getCategories(token: string, page = 0, size = 50, sortBy = 'id', sortDir = 'asc'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/Categories?page=${page}&size=${size}&sortBy=${sortBy}&sortDIr=${sortDir}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return await handleResponse<any>(response);
  },

  /**
   * Create a new product
   */
  async createProduct(token: string, payload: {
    name: string;
    description: string;
    categoryId: string;
    category: string;
    price: number;
    stock: number;
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return await handleResponse<any>(response);
  },

  /**
   * Validate authentication token status
   */
  async validateToken(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return await handleResponse<any>(response);
  },

  /**
   * Logout user
   */
  async logout(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return await handleResponse<any>(response);
  },

  /**
   * Forgot password
   */
  async forgotPassword(email:string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email})
    });
    console.log("Response:", response);
    return await handleResponse<any>(response);
  },

  /**
   * Reset password using token
   */
  async resetPassword(payload: { resetToken: string; newPassword: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    return await handleResponse<any>(response);
  },

  /**
   * Change user password
   */
  async changePassword(token: string, payload: { oldPassword: string; newPassword: string }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    return await handleResponse<any>(response);
  }
};
