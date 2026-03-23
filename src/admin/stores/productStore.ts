// src/admin/stores/productStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productApi } from '@/api'

export interface Product {
  id: number
  name: string
  slug: string
  sku?: string
  description?: string
  price: number
  original_price?: number
  stock: number
  brand?: string
  category_id: number
  images?: string[]
  status: 'active' | 'draft' | 'hidden'
  is_featured: boolean
  created_at?: string
  category?: { id: number; name: string }
}

export interface ProductMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const useProductStore = defineStore('product', () => {
  const products  = ref<Product[]>([])
  const loading   = ref(false)
  const error     = ref<string | null>(null)
  const meta      = ref<ProductMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  })

  const stats = computed(() => ({
    total:    meta.value.total,
    active:   products.value.filter(p => p.status === 'active').length,
    outStock: products.value.filter(p => p.stock === 0).length,
    featured: products.value.filter(p => p.is_featured).length,
  }))

  async function fetchAll(params: Record<string, any> = {}) {
    loading.value = true
    error.value   = null
    try {
      const res = await productApi.getAll(params)
      // Hỗ trợ cả 2 kiểu trả về: { data, meta } hoặc paginate của Laravel
      if (res.data.data) {
        products.value = res.data.data
        meta.value = res.data.meta ?? {
          current_page: res.data.current_page,
          last_page:    res.data.last_page,
          per_page:     res.data.per_page,
          total:        res.data.total,
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

  async function create(formData: FormData) {
    const res = await productApi.create(formData)
    const created: Product = res.data.data ?? res.data
    await fetchAll()
    return created
  }

  async function update(id: number, formData: FormData) {
    const res = await productApi.update(id, formData)
    const updated: Product = res.data.data ?? res.data
    const idx = products.value.findIndex(p => p.id === id)
    if (idx !== -1) products.value[idx] = updated
    return updated
  }

  async function remove(id: number) {
    await productApi.delete(id)
    products.value = products.value.filter(p => p.id !== id)
    meta.value.total = Math.max(0, meta.value.total - 1)
  }

  function getById(id: number): Product | undefined {
    return products.value.find(p => p.id === id)
  }

  return {
    products, loading, error, meta, stats,
    fetchAll, create, update, remove, getById,
  }
})
