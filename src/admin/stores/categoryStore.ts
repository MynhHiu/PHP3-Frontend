// src/admin/stores/categoryStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoryApi } from '@/api'

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  parent_id: number | null
  sort_order: number
  is_active: boolean
  products_count?: number
  parent?: Category
}

export const useCategoryStore = defineStore('category', () => {
  const categories  = ref<Category[]>([])
  const loading     = ref(false)
  const error       = ref<string | null>(null)

  const rootCategories  = computed(() => categories.value.filter(c => !c.parent_id))
  const childCategories = computed(() => categories.value.filter(c => !!c.parent_id))

  async function fetchAll(params: Record<string, any> = {}) {
    loading.value = true
    error.value   = null
    try {
      const res = await categoryApi.getAll(params)
      categories.value = res.data.data ?? res.data
    } catch (err: any) {
      error.value      = err.userMessage || 'Không thể tải danh mục'
      categories.value = []
    } finally {
      loading.value = false
    }
  }

  async function create(formData: FormData) {
    const res = await categoryApi.create(formData)
    const created: Category = res.data.data ?? res.data
    categories.value.push(created)
    return created
  }

  async function update(id: number, formData: FormData) {
    const res = await categoryApi.update(id, formData)
    const updated: Category = res.data.data ?? res.data
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) categories.value[idx] = updated
    return updated
  }

  async function remove(id: number) {
    await categoryApi.delete(id)
    categories.value = categories.value.filter(c => c.id !== id)
  }

  function getById(id: number): Category | undefined {
    return categories.value.find(c => c.id === id)
  }

  return {
    categories, loading, error,
    rootCategories, childCategories,
    fetchAll, create, update, remove, getById,
  }
})
