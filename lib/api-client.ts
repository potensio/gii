interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor(baseURL = "") {
    this.baseURL = baseURL;
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        return true;
      }

      // If refresh fails, just return false
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  private async handleTokenRefresh(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.refreshToken();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const { skipAuth = false, skipRefresh = false, ...fetchConfig } = config;

    const url = endpoint.startsWith("http")
      ? endpoint
      : `${this.baseURL}${endpoint}`;

    const defaultConfig: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...fetchConfig.headers,
      },
      ...fetchConfig,
    };

    try {
      let response = await fetch(url, defaultConfig);

      // If we get 401 and it's not a refresh request, try to refresh token
      if (
        response.status === 401 &&
        !skipAuth &&
        !skipRefresh &&
        !endpoint.includes("/auth/refresh") &&
        !endpoint.includes("/auth/login")
      ) {
        const refreshSuccess = await this.handleTokenRefresh();

        if (refreshSuccess) {
          // Retry the original request
          response = await fetch(url, defaultConfig);
        } else {
          return {
            error: "Authentication failed",
            message: "Please login again",
          };
        }
      }

      const contentType = response.headers.get("content-type");
      let data: any;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        return {
          error: data.error || `HTTP ${response.status}`,
          message: data.message || response.statusText,
        };
      }

      return { data };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        error: "Network error",
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Convenience methods
  async get<T = any>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
