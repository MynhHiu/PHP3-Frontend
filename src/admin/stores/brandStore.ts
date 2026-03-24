// src/admin/stores/brandStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { brandApi } from '@/api'

export interface Brand {
  id: number
  name: string
  slug: string
  description?: string
  logo?: string
  website?: string
  country?: string
  is_active: boolean
  sort_order: number
  products_count?: number
}

export interface BrandMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const useBrandStore = defineStore('brand', () => {
  const brands  = ref<Brand[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)
  const meta    = ref<BrandMeta>({
    current_page: 1, last_page: 1, per_page: 15, total: 0,
  })

  const activeCount = computed(() => brands.value.filter(b => b.is_active).length)

  async function fetchAll(params: Record<string, any> = {}) {
    loading.value = true
    error.value   = null
    try {
      const res = await brandApi.getAll(params)
      if (res.data.data) {
        brands.value = res.data.data
        meta.value = res.data.meta ?? {
          current_page: res.data.current_page,
          last_page:    res.data.last_page,
          per_page:     res.data.per_page,
          total:        res.data.total,
        }
      } else {
        brands.value   = res.data
        meta.value.total = res.data.length
      }
    } catch (err: any) {
      error.value  = err.userMessage || 'Không thể tải thương hiệu'
      brands.value = []
    } finally {
      loading.value = false
    }
  }

  async function create(formData: FormData) {
    const res = await brandApi.create(formData)
    const created: Brand = res.data.data ?? res.data
    brands.value.push(created)
    meta.value.total++
    return created
  }

  async function update(id: number, formData: FormData) {
    const res = await brandApi.update(id, formData)
    const updated: Brand = res.data.data ?? res.data
    const idx = brands.value.findIndex(b => b.id === id)
    if (idx !== -1) brands.value[idx] = updated
    return updated
  }

  async function remove(id: number) {
    await brandApi.delete(id)
    brands.value = brands.value.filter(b => b.id !== id)
    meta.value.total = Math.max(0, meta.value.total - 1)
  }

  function getById(id: number): Brand | undefined {
    return brands.value.find(b => b.id === id)
  }

  return {
    brands, loading, error, meta, activeCount,
    fetchAll, create, update, remove, getById,
  }
})
