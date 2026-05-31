const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("token");
}

function buildQuery(params = {}) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export async function apiRequest(path, options = {}) {
  const { auth = false, body, method = "GET", params, ...rest } = options;

  const headers = { ...(rest.headers || {}) };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const config = { method, headers, ...rest };
  let url = `${API_BASE}${path}`;

  if (method === "GET" || method === "HEAD") {
    if (params) url += buildQuery(params);
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(body);
  }

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || data.error || "Đã xảy ra lỗi";
    throw new Error(message);
  }

  return data;
}

export const authApi = {
  register: (payload) =>
    apiRequest("/auth/register", { method: "POST", body: payload }),
  login: (payload) =>
    apiRequest("/auth/login", { method: "POST", body: payload }),
};

export const productsApi = {
  list: (filters = {}) =>
    apiRequest("/products", { method: "GET", params: filters }),
  getById: (id) => apiRequest(`/products/${id}`),
  create: (payload) =>
    apiRequest("/products", { method: "POST", auth: true, body: payload }),
  update: (id, payload) =>
    apiRequest(`/products/${id}`, { method: "PATCH", auth: true, body: payload }),
  remove: (id) =>
    apiRequest(`/products/${id}`, { method: "DELETE", auth: true }),
};

export const categoriesApi = {
  list: () => apiRequest("/categories"),
  create: (payload) =>
    apiRequest("/categories/addCategory", {
      method: "POST",
      auth: true,
      body: payload,
    }),
};

export const cartApi = {
  get: () => apiRequest("/cart", { auth: true }),
  add: (variantId, quantity) =>
    apiRequest("/cart/add", {
      method: "POST",
      auth: true,
      body: { variantId, quantity },
    }),
  update: (variantId, quantity) =>
    apiRequest("/cart", {
      method: "PATCH",
      auth: true,
      body: { variantId, quantity },
    }),
  remove: (variantId) =>
    apiRequest(`/cart/remove/${variantId}`, { method: "DELETE", auth: true }),
};

export const ordersApi = {
  create: (shippingAddress, phoneNumber) =>
    apiRequest("/orders/create", {
      method: "POST",
      auth: true,
      body: { shippingAddress, phoneNumber },
    }),
};

export const usersApi = {
  profile: () => apiRequest("/users/profile", { auth: true }),
  updateProfile: (payload) =>
    apiRequest("/users/profile", { method: "PATCH", auth: true, body: payload }),
};
