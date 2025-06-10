// src/types/index.ts
export interface User {
  userId: string;
  email?: string;
  name?: string;
  role?: "admin" | "user";
  loginTime?: string;
}

export interface LoginFormData {
  userId: string;
  password: string;
}

export interface FishData {
  id: string;
  species: string;
  count: number;
  confidence: number;
  timestamp: string;
}

export interface SystemStatus {
  oxygenLevel: number;
  temperature: number;
  pH: number;
  totalFishCount: number;
  activeAlerts: Alert[];
}

export interface Alert {
  id: string;
  type: "low_oxygen" | "low_fish_count" | "system_error";
  message: string;
  severity: "low" | "medium" | "high";
  timestamp: string;
  resolved: boolean;
}

export interface SpeciesCount {
  species: string;
  count: number;
  threshold: number;
  status: "normal" | "warning" | "critical";
}

// src/lib/api.ts

// src/app/globals.css
