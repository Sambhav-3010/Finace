import axios from "axios";

// Create Axios Instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://127.0.0.1:5000/api/v1",
  timeout: 130000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// --- API Methods ---

export const userAuthApi = {
  register: (company_name: string, username: string, password: string) =>
    api.post("/auth/register", { company_name, username, password }),
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }),
};

export const evaluatorAuthApi = {
  register: (name: string, email: string, password: string) =>
    api.post("/evaluator/auth/register", { name, email, password }),
  login: (email: string, password: string) =>
    api.post("/evaluator/auth/login", { email, password }),
};

export const workflowApi = {
  analyze: (workflow_text: string, regulator?: string, user_id: string = "usr_123") =>
    api.post("/reports/generate", { workflow_text, regulator, user_id }),
};

export const reportsApi = {
  getAll: (status?: string) => api.get(`/evaluator/reports${status ? `?status=${encodeURIComponent(status)}` : ""}`),
  getById: (id: string) => api.get(`/evaluator/reports/${id}`),
  submitReview: (id: string, payload: any) => api.post(`/evaluator/reports/${id}/review`, payload),
  update: (report_id: string, workflow_text?: string, regulator?: string) => 
    api.post("/reports/update", { report_id, workflow_text, regulator }),
  proof: (report_id: string, org_name: string) => 
    api.post("/reports/proof", { report_id, org_name }),
};

export const docsApi = {
  generate: (payload: any) => api.post("/docs/generate", payload), // Note: Mock endpoint until implemented on backend
};

export const regulationsApi = {
  search: (query: string) => api.get(`/regulations/search?q=${encodeURIComponent(query)}`), // Note: Mock endpoint until implemented on backend
};

export interface RagQueryResponse {
  answer: string;
  confidence: number;
  riskLevel: "Low" | "Medium" | "High";
  riskFlags: string[];
  recommendations: string[];
  citations: Array<{
    source: string;
    title: string;
    text: string;
  }>;
}

export const queryCompliance = async (payload: { prompt: string; topK?: number }): Promise<RagQueryResponse> => {
  return api.post("/rag/query", payload);
};

export default api;
