// src/api/index.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // KHÔNG có withCredentials
})

api.interceptors.request.use((config) => {
  // Lấy cả 2 token: admin và user
  const token = localStorage.getItem('admin_token') 
             || localStorage.getItem('user_token')
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

// ── Categories ────────────────────────────────
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

// ── Products ──────────────────────────────────
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

export default api

// ── Brands ────────────────────────────────────
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

// ── Product Variants ──────────────────────────
export const variantApi = {
  // CRUD variant
  getVariants:   (productId: number) =>
    api.get(`/admin/products/${productId}/variants`),
  createVariant: (productId: number, data: {
    variant_name: string   // VARCHAR(255)
    product_id: number     // INT(11)
  }) => api.post(`/admin/products/${productId}/variants`, data),
  updateVariant: (id: number, data: { variant_name: string }) =>
    api.put(`/admin/variants/${id}`, data),
  deleteVariant: (id: number) => api.delete(`/admin/variants/${id}`),
 
  // CRUD variant_options — cột: id, product_variant_id, option_values (INT), created_at
  getOptions:    (variantId: number) =>
    api.get(`/admin/variants/${variantId}/options`),
  createOption:  (variantId: number, data: {
    product_variant_id: number  // INT(11)
    option_values: number        // INT(11) — database lưu số
  }) => api.post(`/admin/variants/${variantId}/options`, data),
  updateOption:  (id: number, data: { option_values: number }) =>
    api.put(`/admin/variant-options/${id}`, data),
  deleteOption:  (id: number) => api.delete(`/admin/variant-options/${id}`),
 
  // CRUD product_skus — cột: sku_code, product_id, price, quantity, status, created_at, updated_at
  getSkus:   (productId: number) =>
    api.get(`/admin/products/${productId}/skus`),
  createSku: (productId: number, data: {
    sku_code: string        // VARCHAR(255)
    product_id: number      // INT(11)
    price: number           // DECIMAL(10,2)
    quantity: number        // INT(11)
    status: string          // VARCHAR(50)
  }) => api.post(`/admin/products/${productId}/skus`, data),
  updateSku: (skuCode: string, data: Partial<{
    price: number
    quantity: number
    status: string
  }>) => api.put(`/admin/skus/${skuCode}`, data),
  deleteSku: (skuCode: string) => api.delete(`/admin/skus/${skuCode}`),
 
  // CRUD product_combination_options — cột: id, options_id, sku_code, created_at
  getCombinationOptions: (skuCode: string) =>
    api.get(`/admin/skus/${skuCode}/combination-options`),
  createCombinationOption: (data: {
    options_id: number  // INT(11) FK → variant_options.id
    sku_code: string    // VARCHAR(255) FK → product_skus.sku_code
  }) => api.post('/admin/combination-options', data),
  deleteCombinationOption: (id: number) =>
    api.delete(`/admin/combination-options/${id}`),
 
  // Trang VariantAssign: lấy danh sách tất cả variant (không lọc theo product)
  getAllVariants: (params = {}) =>
    api.get('/admin/variants', { params }),
 
  // Gán variant vào product (dùng trong trang VariantAssign)
  assignVariantToProduct: (productId: number, variantId: number) =>
    api.post(`/admin/products/${productId}/variants/assign`, { variant_id: variantId }),
}

// ── Orders ────────────────────────────────────
export const orderApi = {
  getAll:    (params = {}) => api.get('/admin/orders', { params }),
  getOne:    (id: number)  => api.get(`/admin/orders/${id}`),
  updateStatus: (id: number, status: string) => api.patch(`/admin/orders/${id}/status`, { status }),
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

// ── AUTH ─────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    fullname: string
    email: string
    phone: string
    password: string
    address?: string
  }) =>
    api.post('/auth/register', data).then(r => r.data),

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
    password_confirmation: string
  ) =>
    api.post('/auth/reset-password', {
      email, otp, password, password_confirmation,
    }).then(r => r.data),
}

// ── Coupons ───────────────────────────────────
export const couponApi = {
  getAll:  (params = {}) => api.get('/admin/coupons', { params }),
  getOne:  (code: string) => api.get(`/admin/coupons/${code}`),
  create:  (data: Record<string, any>) => api.post('/admin/coupons', data),
  update:  (code: string, data: Record<string, any>) => api.put(`/admin/coupons/${code}`, data),
  delete:  (code: string) => api.delete(`/admin/coupons/${code}`),

  // Dùng ở trang checkout (public)
  apply: (code: string, order_total: number) =>
    api.post('/apply-coupon', { code, order_total }),

  // Ghi nhận user đã dùng mã
  markUsed: (code: string, user_id: number) =>
    api.post(`/admin/coupons/${code}/use`, { user_id }),
}