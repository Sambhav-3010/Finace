import { create } from "zustand";
import { reportsApi } from "@/services/api";

interface User {
  id: string;
  name: string;
  role: "admin" | "evaluator" | "user";
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  
  // Active workflow state
  activeReportId: string | null;
  setActiveReportId: (id: string | null) => void;

  // Cached API Data
  reports: any[];
  auditLogs: any[];
  isLoading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) => {
    if (typeof window !== "undefined") localStorage.setItem("token", "mock_jwt_token");
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false });
  },
  
  activeReportId: null,
  setActiveReportId: (id) => set({ activeReportId: id }),

  reports: [],
  auditLogs: [],
  isLoading: false,
  error: null,
  
  fetchReports: async () => {
    set({ isLoading: true, error: null });
    try {
      const data: any = await reportsApi.getAll();
      set({ 
        reports: data.reports || [], 
        auditLogs: (data.reports || []).filter((r: any) => r.ipfs_cid || r.tx_hash),
        isLoading: false 
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch reports", isLoading: false });
    }
  }
}));
