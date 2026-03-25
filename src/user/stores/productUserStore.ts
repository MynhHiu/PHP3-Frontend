// src/user/stores/productUserStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

export interface ProductSku {
  sku_code: string
  price: number
  quantity: number
  status: string
}

export interface ProductDetail {
  id: number
  name: string
  description: string
  image_url: string
  categories_id: number
  brand_id: number
  category?: { id: number; name: string }
  brand?:    { id: number; name: string }
  skus?:     ProductSku[]
  images?:   { id: number; url: string; mota: string }[]
}

export interface ProductListItem {
  id: number
  name: string
  image_url: string
  categories_id: number
  brand_id: number
  price?: number          // từ sku đầu tiên
  old_price?: number
}

export interface ProductMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const useProductUserStore = defineStore('productUser', () => {
  const products  = ref<ProductListItem[]>([])
  const flashSale = ref<ProductListItem[]>([])
  const featured  = ref<ProductListItem[]>([])
  const detail    = ref<ProductDetail | null>(null)
  const loading   = ref(false)
  const error     = ref<string | null>(null)
  const meta      = ref<ProductMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  })

  // ── Danh sách sản phẩm (có filter & phân trang) ──────────────
  async function fetchProducts(params: Record<string, any> = {}) {
    loading.value = true
    error.value   = null
    try {
      const res = await api.get('/products', { params })
      if (res.data.data) {
        products.value = res.data.data
        meta.value = {
          current_page: res.data.current_page ?? 1,
          last_page:    res.data.last_page    ?? 1,
          per_page:     res.data.per_page     ?? 20,
          total:        res.data.total        ?? res.data.data.length,
        }
      } else {
        products.value = res.data
        meta.value.total = res.data.length
      }
    } catch (err: any) {
      error.value    = err.userMessage || 'Không thể tải sản phẩm'
      products.value = []
    } finally {
      loading.value = false
    }
  }

  // ── Flash sale ───────────────────────────────────────────────
  async function fetchFlashSale() {
    try {
      const res     = await api.get('/products/flash-sale')
      flashSale.value = res.data.data ?? res.data
    } catch {
      flashSale.value = []
    }
  }

  // ── Hàng nổi bật (homepage sections) ────────────────────────
  async function fetchFeatured(categoryId?: number) {
    try {
      const res       = await api.get('/products/featured', {
        params: categoryId ? { category_id: categoryId } : {},
      })
      featured.value  = res.data.data ?? res.data
    } catch {
      featured.value  = []
    }
  }

  // ── Chi tiết sản phẩm ────────────────────────────────────────
  async function fetchDetail(id: number) {
    loading.value = true
    error.value   = null
    detail.value  = null
    try {
      const res    = await api.get(`/products/${id}`)
      detail.value = res.data.data ?? res.data
    } catch (err: any) {
      error.value  = err.userMessage || 'Không tìm thấy sản phẩm'
    } finally {
      loading.value = false
    }
  }

  // ── Sản phẩm theo danh mục ───────────────────────────────────
  async function fetchByCategory(categoryId: number, params: Record<string, any> = {}) {
    return fetchProducts({ ...params, category_id: categoryId })
  }

  return {
    products, flashSale, featured, detail, loading, error, meta,
    fetchProducts, fetchFlashSale, fetchFeatured, fetchDetail, fetchByCategory,
  }
})
