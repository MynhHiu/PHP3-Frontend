// src/admin/stores/brandStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { brandApi } from '@/api'

export interface Brand {
  id: number
  name: string
}

export const useBrandStore = defineStore('brand', () => {
  const brands  = ref<Brand[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      const res = await brandApi.getAll()
      brands.value = res.data.data ?? res.data
    } catch (err: any) {
      error.value  = err.userMessage || 'Không thể tải thương hiệu'
      brands.value = []
    } finally {
      loading.value = false
    }
  }

  return { brands, loading, error, fetchAll }
})