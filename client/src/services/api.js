/**
 * Centralized API Client Service
 */

// Dynamically resolves and normalizes the backend API base URL
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === "string" && envUrl.trim() !== "") {
    let clean = envUrl.trim().replace(/\/+$/, ""); // remove trailing slashes
    if (!clean.endsWith("/api")) {
      clean = `${clean}/api`;
    }
    return clean;
  }

  // In production (e.g., Render unified service or reverse proxy)
  if (import.meta.env.MODE === "production") {
    return "/api";
  }

  // Local development default (Vite proxy forwards /api or direct localhost:5000)
  return "http://localhost:5000/api";
};

const API_BASE_URL = getBaseUrl();

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("devstory_token");

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${cleanEndpoint}`;
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
        "Unable to connect to the backend server. Please check your network connection or verify that the server is online."
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
      query.append("category", params.category.trim());
    }
    if (params.search && typeof params.search === "string" && params.search.trim()) {
      query.append("search", params.search.trim());
    }
    if (params.page) {
      query.append("page", params.page);
    }
    if (params.limit) {
      query.append("limit", params.limit);
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

// User Profile API Helpers
export const userApi = {
  getProfile: () => apiRequest("/users/profile", { method: "GET" }),
  updateProfile: (profileData) =>
    apiRequest("/users/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    }),
};

// Comment API Helpers
export const commentApi = {
  getByArticle: (articleIdOrSlug) =>
    apiRequest(`/articles/${articleIdOrSlug}/comments`, { method: "GET" }),

  create: (articleIdOrSlug, commentData) =>
    apiRequest(`/articles/${articleIdOrSlug}/comments`, {
      method: "POST",
      body: JSON.stringify(commentData),
    }),

  update: (commentId, commentData) =>
    apiRequest(`/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify(commentData),
    }),

  delete: (commentId) =>
    apiRequest(`/comments/${commentId}`, {
      method: "DELETE",
    }),
};

// Like API Helpers
export const likeApi = {
  getLikeStatus: (articleIdOrSlug) =>
    apiRequest(`/articles/${articleIdOrSlug}/likes`, { method: "GET" }),

  like: (articleIdOrSlug) =>
    apiRequest(`/articles/${articleIdOrSlug}/like`, { method: "POST" }),

  unlike: (articleIdOrSlug) =>
    apiRequest(`/articles/${articleIdOrSlug}/like`, { method: "DELETE" }),

  toggle: (articleIdOrSlug) =>
    apiRequest(`/articles/${articleIdOrSlug}/like/toggle`, { method: "POST" }),
};

// Bookmark API Helpers
export const bookmarkApi = {
  getUserBookmarks: () =>
    apiRequest("/bookmarks", { method: "GET" }),

  getBookmarkStatus: (articleIdOrSlug) =>
    apiRequest(`/articles/${articleIdOrSlug}/bookmark-status`, { method: "GET" }),

  bookmark: (articleIdOrSlug) =>
    apiRequest(`/articles/${articleIdOrSlug}/bookmark`, { method: "POST" }),

  unbookmark: (articleIdOrSlug) =>
    apiRequest(`/articles/${articleIdOrSlug}/bookmark`, { method: "DELETE" }),

  toggle: (articleIdOrSlug) =>
    apiRequest(`/articles/${articleIdOrSlug}/bookmark/toggle`, { method: "POST" }),
};

// Newsletter API Helpers
export const newsletterApi = {
  subscribe: (email, source = "website_homepage") =>
    apiRequest("/newsletter/subscribe", {
      method: "POST",
      body: JSON.stringify({ email, source }),
    }),

  unsubscribe: (email) =>
    apiRequest("/newsletter/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
};

// Upload API Helpers
export const uploadApi = {
  uploadImage: async (file) => {
    const token = localStorage.getItem("devstory_token");
    const formData = new FormData();
    formData.append("image", file);

    const headers = {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const cleanEndpoint = "/upload";
    const url = `${API_BASE_URL}${cleanEndpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = new Error(data.message || `Image upload failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("Failed to fetch")) {
        throw new Error(
          "Unable to connect to the backend server for image upload. Please verify the server is running."
        );
      }
      throw error;
    }
  },
};

// Admin API Helpers
export const adminApi = {
  checkAuth: () =>
    apiRequest("/admin/check-auth", { method: "GET" }),
  getDashboard: () =>
    apiRequest("/admin/dashboard", { method: "GET" }),
};

// Contact Form API Helpers
export const contactApi = {
  submit: (contactData) =>
    apiRequest("/contact", {
      method: "POST",
      body: JSON.stringify(contactData),
    }),
  getMessages: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/contact${query ? `?${query}` : ""}`, { method: "GET" });
  },
  getById: (id) =>
    apiRequest(`/contact/${id}`, { method: "GET" }),
  updateStatus: (id, status) =>
    apiRequest(`/contact/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteMessage: (id) =>
    apiRequest(`/contact/${id}`, { method: "DELETE" }),
};




