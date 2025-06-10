import {
  Alert,
  FishData,
  LoginFormData,
  SpeciesCount,
  SystemStatus,
  User,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("aqua_user");
      if (user) {
        return JSON.parse(user).token || null;
      }
    }
    return null;
  }

  // Authentication
  async login(credentials: LoginFormData): Promise<User> {
    return this.request<User>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<void> {
    return this.request<void>("/api/auth/logout", {
      method: "POST",
    });
  }

  // Fish data
  async getFishCount(): Promise<{
    totalCount: number;
    speciesCounts: SpeciesCount[];
  }> {
    return this.request<{ totalCount: number; speciesCounts: SpeciesCount[] }>(
      "/api/fish/count"
    );
  }

  async getFishData(): Promise<FishData[]> {
    return this.request<FishData[]>("/api/fish/data");
  }

  // System status
  async getSystemStatus(): Promise<SystemStatus> {
    return this.request<SystemStatus>("/api/system/status");
  }

  async getAlerts(): Promise<Alert[]> {
    return this.request<Alert[]>("/api/alerts");
  }

  async resolveAlert(alertId: string): Promise<void> {
    return this.request<void>(`/api/alerts/${alertId}/resolve`, {
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient();
