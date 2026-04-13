// src/admin/stores/bannerStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { bannerApi } from '@/api'

export interface Banner {
  id: number
  title: string
  image_url: string
  link: string | null
  description: string | null
  is_active: boolean
  sort_order: number
  banner_type: 'main' | 'side'
  created_at: string
  updated_at: string
}

export const useBannerStore = defineStore('banner', () => {
  const banners  = ref<Banner[]>([])
  const loading  = ref(false)
  const error    = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      const res    = await bannerApi.getAll()
      banners.value = res.data.data ?? res.data
    } catch (err: any) {
      error.value   = err.userMessage || 'Không thể tải danh sách banner'
      banners.value = []
    } finally {
      loading.value = false
    }
  }

  async function create(data: FormData) {
    const res = await bannerApi.create(data)
    banners.value.push(res.data)
  }

  async function update(id: number, data: FormData) {
    const res = await bannerApi.update(id, data)
    const idx = banners.value.findIndex(b => b.id === id)
    if (idx !== -1) banners.value[idx] = res.data
  }

  async function remove(id: number) {
    await bannerApi.delete(id)
    banners.value = banners.value.filter(b => b.id !== id)
  }

  async function toggle(id: number) {
    const res = await bannerApi.toggle(id)
    const idx = banners.value.findIndex(b => b.id === id)
    if (idx !== -1) banners.value[idx] = res.data.banner
  }

  return { banners, loading, error, fetchAll, create, update, remove, toggle }
})