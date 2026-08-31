import axios from "axios";
import { clearAuthCookies, getAuthToken } from "@/lib/authCookies";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://127.0.0.1:5000/api/v1",
  timeout: 130000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const url = String(error.config?.url || "");
    // Wipe session on protected-route 401s. Keep credential login/register intact.
    const isCredentialAuth =
      /\/auth\/(login|register)/.test(url) || /\/evaluator\/auth\/(login|register)/.test(url);
    const isMe = /\/auth\/me/.test(url);

    if (status === 401 && typeof window !== "undefined" && !isCredentialAuth) {
      clearAuthCookies();
      // /auth/me failures are handled by Redux hydrate — don't hard-redirect from landing
      if (!isMe && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const userAuthApi = {
  register: (company_name: string, username: string, password: string) =>
    api.post("/auth/register", { company_name, username, password }),
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }),
  me: () => api.get("/auth/me"),
};

export const evaluatorAuthApi = {
  register: (name: string, email: string, password: string) =>
    api.post("/evaluator/auth/register", { name, email, password }),
  login: (email: string, password: string) =>
    api.post("/evaluator/auth/login", { email, password }),
};

export const workflowApi = {
  analyze: (
    workflow_text: string,
    options?: { regulator?: string; user_id?: string; chat_id?: string }
  ) =>
    api.post("/reports/generate", {
      workflow_text,
      regulator: options?.regulator,
      user_id: options?.user_id ?? "usr_123",
      chat_id: options?.chat_id,
    }),
};

export const reportsApi = {
  getAll: (status?: string) =>
    api.get(`/evaluator/reports${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  getById: (id: string) => api.get(`/evaluator/reports/${id}`),
  submitReview: (id: string, payload: any) => api.post(`/evaluator/reports/${id}/review`, payload),
  update: (report_id: string, workflow_text?: string, regulator?: string) =>
    api.post("/reports/update", { report_id, workflow_text, regulator }),
  proof: (report_id: string, org_name: string) =>
    api.post("/reports/proof", { report_id, org_name }),
  anchor: (report_id: string, tx_hash: string, ipfs_cid?: string, pdf_path?: string) =>
    api.post("/reports/anchor", { report_id, tx_hash, ipfs_cid, pdf_path }),
  downloadPdf: async (report_id: string) => {
    const base =
      process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://127.0.0.1:5000/api/v1";
    const token =
      typeof window !== "undefined"
        ? document.cookie
            .split("; ")
            .find((c) => c.startsWith("finace_token="))
            ?.split("=")[1]
        : "";
    const res = await fetch(`${base}/reports/${report_id}/pdf`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Failed to download PDF");
    return res.blob();
  },
};

export const chatHistoryApi = {
  list: () => api.get("/chats"),
  get: (id: string) => api.get(`/chats/${id}`),
  create: (payload: { title?: string; messages?: any[] }) => api.post("/chats", payload),
  save: (id: string, payload: { title?: string; messages?: any[] }) =>
    api.put(`/chats/${id}`, payload),
  remove: (id: string) => api.delete(`/chats/${id}`),
};

export const docsApi = {
  getTree: () => api.get("/docs/tree"),
  generate: (payload: any) => api.post("/docs/generate", payload),
};

export const regulationsApi = {
  search: (query: string) => api.get(`/regulations/search?q=${encodeURIComponent(query)}`),
};

export interface RagQueryResponse {
  answer: string;
  confidence?: number;
  riskLevel: string;
  riskFlags: string[];
  recommendations: string[];
  complianceScore?: number;
  reasoningSteps?: string[];
  sources?: Array<{
    document_id?: string;
    section?: string;
    text?: string;
    relative_path?: string;
    source_file?: string;
  }>;
  citations?: Array<{
    source: string;
    title: string;
    text: string;
  }>;
  xai?: any;
  analysis?: any;
}

export const queryCompliance = async (payload: {
  prompt: string;
  topK?: number;
}): Promise<RagQueryResponse> => {
  return api.post("/rag/query", payload);
};

export default api;
