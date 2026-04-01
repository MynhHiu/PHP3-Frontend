import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: number
  product_id: number
  url: string       // đã bao gồm base URL từ backend
  mota: string | null
}

export interface ProductSku {
  sku_code: string
  product_id: number
  price: number
  quantity: number
  status: 'active' | 'draft' | 'hidden'
}

export interface Product {
  id: number
  name: string
  categories_id: number
  brand_id?: number | null
  description?: string
  image_url?: string

  // Tổng hợp từ tất cả SKU (được backend tính sẵn trong index())
  stock?:     number   // tổng tồn kho
  min_price?: number   // giá thấp nhất
  max_price?: number   // giá cao nhất
  sku_count?: number   // số lượng biến thể

  category?: { id: number; name: string }
  brand?:    { id: number; name: string }
  images?:   ProductImage[]
  skus?:     ProductSku[]
}

interface Meta {
  current_page: number
  last_page: number
  total: number
  per_page: number
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const loading  = ref(false)
  const error    = ref<string | null>(null)
  const meta     = ref<Meta>({ current_page: 1, last_page: 1, total: 0, per_page: 15 })

  const BASE_URL = computed(() => {
    const api = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    return api.replace(/\/api$/, '')
  })

  const API = computed(() => `${BASE_URL.value}/api`)

  function getHeaders(): Record<string, string> {
    const auth = useAuthStore()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`
    return headers
  }

  function parseError(err: unknown): string {
    if (err instanceof Error) return err.message
    return 'Đã xảy ra lỗi không xác định'
  }

  function formatValidation(errors?: Record<string, string[]>): string {
    if (!errors) return ''
    return Object.values(errors).flat().join(' | ')
  }

  // ── GET /api/admin/products ────────────────────────────────────────────────
  async function fetchAll(params: Record<string, unknown> = {}) {
    loading.value = true
    error.value   = null
    try {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) query.append(k, String(v))
      })
      const res = await fetch(`${API.value}/admin/products?${query.toString()}`, {
        headers: getHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

      const data = await res.json()

      if (Array.isArray(data)) {
        products.value = data
        meta.value = { current_page: 1, last_page: 1, total: data.length, per_page: data.length }
      } else {
        products.value = data.data ?? []
        meta.value = {
          current_page: data.current_page ?? 1,
          last_page:    data.last_page    ?? 1,
          total:        data.total        ?? products.value.length,
          per_page:     data.per_page     ?? 15,
        }
      }
    } catch (e) {
      error.value = parseError(e)
      console.error('[productStore.fetchAll]', e)
    } finally {
      loading.value = false
    }
  }

  // ── GET /api/admin/products/:id ───────────────────────────────────────────
  async function fetchOne(id: number): Promise<Product> {
    const res = await fetch(`${API.value}/admin/products/${id}`, { headers: getHeaders() })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg  = body.message || `HTTP ${res.status}`
      const err  = new Error(msg) as Error & { userMessage: string }
      err.userMessage = msg
      throw err
    }
    return res.json()
  }

  // ── POST /api/admin/products ──────────────────────────────────────────────
  async function create(formData: FormData): Promise<Product> {
    const res = await fetch(`${API.value}/admin/products`, {
      method:  'POST',
      headers: getHeaders(),
      body:    formData,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg  = body.message || formatValidation(body.errors) || `HTTP ${res.status}`
      const err  = new Error(msg) as Error & { userMessage: string }
      err.userMessage = msg
      throw err
    }
    const created: Product = await res.json()
    products.value.unshift(created)
    meta.value.total++
    return created
  }

  // ── PUT /api/admin/products/:id ───────────────────────────────────────────
  async function update(id: number, formData: FormData): Promise<Product> {
    formData.append('_method', 'PUT')
    const res = await fetch(`${API.value}/admin/products/${id}`, {
      method:  'POST',
      headers: getHeaders(),
      body:    formData,
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg  = body.message || formatValidation(body.errors) || `HTTP ${res.status}`
      const err  = new Error(msg) as Error & { userMessage: string }
      err.userMessage = msg
      throw err
    }
    const updated: Product = await res.json()
    const idx = products.value.findIndex(p => p.id === id)
    if (idx !== -1) products.value[idx] = updated
    return updated
  }

  // ── DELETE /api/admin/products/:id ────────────────────────────────────────
  async function remove(id: number): Promise<void> {
    const res = await fetch(`${API.value}/admin/products/${id}`, {
      method:  'DELETE',
      headers: getHeaders(),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg  = body.message || `HTTP ${res.status}`
      const err  = new Error(msg) as Error & { userMessage: string }
      err.userMessage = msg
      throw err
    }
    products.value   = products.value.filter(p => p.id !== id)
    meta.value.total = Math.max(0, meta.value.total - 1)
  }

  // ── DELETE /api/admin/products/images/:imageId ────────────────────────────
  async function removeImage(imageId: number): Promise<void> {
    const res = await fetch(`${API.value}/admin/products/images/${imageId}`, {
      method:  'DELETE',
      headers: getHeaders(),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message || `HTTP ${res.status}`)
    }
  }

  function getById(id: number): Product | undefined {
    return products.value.find(p => p.id === id)
  }

  // ── Computed stats: tổng hợp từ tất cả SKU ───────────────────────────────
  const stats = computed(() => ({
    totalProducts: products.value.length,
    totalStock:    products.value.reduce((sum, p) => sum + (p.stock ?? 0), 0),
    outOfStock:    products.value.filter(p => (p.stock ?? 0) === 0).length,
    noSku:         products.value.filter(p => (p.sku_count ?? 0) === 0).length,
  }))

  return {
    products,
    loading,
    error,
    meta,
    stats,
    fetchAll,
    fetchOne,
    create,
    update,
    remove,
    removeImage,
    getById,
  }
})