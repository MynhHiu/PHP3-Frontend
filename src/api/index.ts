// src/api/index.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
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


