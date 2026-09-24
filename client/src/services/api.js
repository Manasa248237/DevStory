/**
 * Centralized API Client Service
 */

// Adapts dynamically: uses VITE_API_BASE_URL if configured, otherwise falls back to /api in production and localhost:5000 in dev
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production" ? "/api" : "http://localhost:5000/api");

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("devstory_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
      throw new Error(
        "Unable to connect to the backend server. Please ensure the Express server is running on port 5000."
      );
    }
    throw error;
  }
}

// Authentication API Helpers
export const authApi = {
  signup: (userData) =>
    apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  signin: (credentials) =>
    apiRequest("/auth/signin", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getMe: () =>
    apiRequest("/auth/me", {
      method: "GET",
    }),
};

// Article API Helpers
export const articleApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== "All") {
      query.append("category", params.category);
    }
    const queryString = query.toString() ? `?${query.toString()}` : "";
    return apiRequest(`/articles${queryString}`, { method: "GET" });
  },

  getByIdOrSlug: (idOrSlug) =>
    apiRequest(`/articles/${idOrSlug}`, { method: "GET" }),

  getMyArticles: () =>
    apiRequest("/articles/my-articles", { method: "GET" }),

  create: (articleData) =>
    apiRequest("/articles", {
      method: "POST",
      body: JSON.stringify(articleData),
    }),

  update: (idOrSlug, articleData) =>
    apiRequest(`/articles/${idOrSlug}`, {
      method: "PUT",
      body: JSON.stringify(articleData),
    }),

  delete: (idOrSlug) =>
    apiRequest(`/articles/${idOrSlug}`, {
      method: "DELETE",
    }),
};
