// src/api/index.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
             || localStorage.getItem('user_token')
             || localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.message || 'Có lỗi xảy ra'
    return Promise.reject({ ...err, userMessage: msg })
  }
)

export default api

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll:  (params = {}) => api.get('/admin/categories', { params }),
  getOne:  (id: number)  => api.get(`/admin/categories/${id}`),
  create:  (data: FormData) => api.post('/admin/categories', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:  (id: number, data: FormData) => {
    data.append('_method', 'PUT')
    return api.post(`/admin/categories/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete:  (id: number) => api.delete(`/admin/categories/${id}`),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productApi = {
  getAll:  (params = {}) => api.get('/admin/products', { params }),
  getOne:  (id: number)  => api.get(`/admin/products/${id}`),
  create:  (data: FormData) => api.post('/admin/products', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:  (id: number, data: FormData) => {
    data.append('_method', 'PUT')
    return api.post(`/admin/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete:  (id: number) => api.delete(`/admin/products/${id}`),
}

// ── Brands ────────────────────────────────────────────────────────────────────
export const brandApi = {
  getAll:  (params = {}) => api.get('/admin/brands', { params }),
  getOne:  (id: number)  => api.get(`/admin/brands/${id}`),
  create:  (data: FormData) => api.post('/admin/brands', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:  (id: number, data: FormData) => {
    data.append('_method', 'PUT')
    return api.post(`/admin/brands/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete:  (id: number) => api.delete(`/admin/brands/${id}`),
}

// ── Product Variants ──────────────────────────────────────────────────────────
export const variantApi = {
  getVariants:   (productId: number) =>
    api.get(`/admin/products/${productId}/variants`),
  createVariant: (productId: number, data: {
    variant_name: string
    product_id: number
  }) => api.post(`/admin/products/${productId}/variants`, data),
  updateVariant: (id: number, data: { variant_name: string }) =>
    api.put(`/admin/variants/${id}`, data),
  deleteVariant: (id: number) => api.delete(`/admin/variants/${id}`),

  getOptions:   (variantId: number) =>
    api.get(`/admin/variants/${variantId}/options`),
  createOption: (variantId: number, data: {
    product_variant_id: number
    option_values: number
  }) => api.post(`/admin/variants/${variantId}/options`, data),
  updateOption: (id: number, data: { option_values: number }) =>
    api.put(`/admin/variant-options/${id}`, data),
  deleteOption: (id: number) => api.delete(`/admin/variant-options/${id}`),

  getSkus:   (productId: number) =>
    api.get(`/admin/products/${productId}/skus`),
  createSku: (productId: number, data: {
    sku_code: string
    product_id: number
    price: number
    quantity: number
    status: string
  }) => api.post(`/admin/products/${productId}/skus`, data),
  updateSku: (skuCode: string, data: Partial<{
    price: number
    quantity: number
    status: string
  }>) => api.put(`/admin/skus/${skuCode}`, data),
  deleteSku: (skuCode: string) => api.delete(`/admin/skus/${skuCode}`),

  getCombinationOptions: (skuCode: string) =>
    api.get(`/admin/skus/${skuCode}/combination-options`),
  createCombinationOption: (data: {
    options_id: number
    sku_code: string
  }) => api.post('/admin/combination-options', data),
  deleteCombinationOption: (id: number) =>
    api.delete(`/admin/combination-options/${id}`),

  getAllVariants: (params = {}) =>
    api.get('/admin/variants', { params }),
  assignVariantToProduct: (productId: number, variantId: number) =>
    api.post(`/admin/products/${productId}/variants/assign`, { variant_id: variantId }),
}

// ── Orders (Admin) ────────────────────────────────────────────────────────────
export const orderApi = {
  getAll:       (params = {}) => api.get('/admin/orders', { params }),
  getOne:       (id: number)  => api.get(`/admin/orders/${id}`),
  updateStatus: (id: number, status: string) =>
    api.patch(`/admin/orders/${id}/status`, { status }),
}

// ── Orders (User) ─────────────────────────────────────────────────────────────
export const userOrderApi = {
  // GET /api/orders — danh sách đơn hàng của user đang đăng nhập
  getAll: () => api.get('/orders'),

  // GET /api/orders/{id} — chi tiết 1 đơn hàng
  getOne: (id: number) => api.get(`/orders/${id}`),

  // PATCH /api/orders/{id}/cancel — huỷ đơn (chỉ khi status = pending)
  cancel: (id: number) => api.patch(`/orders/${id}/cancel`),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const userApi = {
  getAll:  (params = {}) => api.get('/admin/users', { params }),
  getOne:  (id: number)  => api.get(`/admin/users/${id}`),
  create:  (data: FormData) => api.post('/admin/users', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update:  (id: number, data: FormData) => {
    data.append('_method', 'PUT')
    return api.post(`/admin/users/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete:       (id: number) => api.delete(`/admin/users/${id}`),
  toggleStatus: (id: number) => api.patch(`/admin/users/${id}/toggle-status`),
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartApi = {
  getAll:         ()                                       => api.get('/user/cart'),
  add:            (product_sku_code: string, quantity = 1) => api.post('/user/cart', { product_sku_code, quantity }),
  updateQuantity: (id: number, quantity: number)           => api.put(`/user/cart/${id}`, { quantity }),
  remove:         (id: number)                             => api.delete(`/user/cart/${id}`),
  clear:          ()                                       => api.delete('/user/cart'),
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    fullname: string
    email: string
    phone: string
    password: string
    address?: string
  }) => api.post('/auth/register', data).then(r => r.data),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),

  logout: () =>
    api.post('/auth/logout').then(r => r.data),

  sendOtp: (email: string) =>
    api.post('/auth/send-otp', { email }).then(r => r.data),

  verifyOtp: (email: string, otp: string) =>
    api.post('/auth/verify-otp', { email, otp }).then(r => r.data),

  resetPassword: (
    email: string,
    otp: string,
    password: string,
    password_confirmation: string,
  ) => api.post('/auth/reset-password', {
    email, otp, password, password_confirmation,
  }).then(r => r.data),
}