async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
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

    throw new Error(message);
  }

  return response.json();
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
