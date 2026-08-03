const AUTH_TOKEN_KEY = "sribio_auth_token";

export function getStoredAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  return window.sessionStorage.getItem(AUTH_TOKEN_KEY) || "";
}

export function setStoredAuthToken(token) {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearStoredAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getStoredAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    headers,
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    let message = "Request failed.";

    try {
      const payload = await response.json();
      message = payload.error || payload.detail || message;
    } catch {
      message = response.statusText || message;
    }

    if (response.status === 401) {
      clearStoredAuthToken();
    }

    throw new Error(message);
  }

  return response.json();
}

export function verifyReferral(referralId) {
  return request("/api/auth/referral/verify", {
    method: "POST",
    body: JSON.stringify({
      referral_id: referralId,
    }),
  });
}

export function registerUser(payload) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(identifier, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      password,
    }),
  });
}

export function fetchCurrentUser() {
  return request("/api/auth/me");
}

export function fetchProducts() {
  return request("/api/products");
}

export function fetchDeletedProducts() {
  return request("/api/products/deleted");
}

export function fetchProduct(productId) {
  return request(`/api/products/${productId}`);
}

export function fetchDeletedProduct(productId) {
  return request(`/api/products/deleted/${productId}`);
}

export function storeQr(productId) {
  return request("/api/qr/generate", {
    method: "POST",
    body: JSON.stringify({
      product_id: productId,
      request_source: "frontend-dashboard",
    }),
  });
}

export function createProduct(payload) {
  return request("/api/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(productId, payload) {
  return request(`/api/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(productId) {
  return request(`/api/products/${productId}`, {
    method: "DELETE",
  });
}

export function restoreProduct(productId) {
  return request(`/api/products/${productId}/restore`, {
    method: "POST",
  });
}

export function permanentlyDeleteProduct(productId) {
  return request(`/api/products/${productId}/permanent`, {
    method: "DELETE",
  });
}
