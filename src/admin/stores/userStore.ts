import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api'

export interface User {
  id: number
  fullname: string
  email: string
  phone: string
  address?: string
  brithday?: string
  image?: string
  role: number   // 0=customer, 1=admin
  status: number // 0=banned, 1=active
  created_at?: string
}

export interface UserMeta {
  current_page: number; last_page: number; per_page: number; total: number
}

export const useUserStore = defineStore('user', () => {
  const users   = ref<User[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)
  const meta    = ref<UserMeta>({ current_page: 1, last_page: 1, per_page: 15, total: 0 })

  async function fetchAll(params: Record<string, any> = {}) {
    loading.value = true; error.value = null
    try {
      const res = await userApi.getAll(params)
      if (res.data.data) {
        users.value = res.data.data
        meta.value = res.data.meta ?? { current_page: res.data.current_page, last_page: res.data.last_page, per_page: res.data.per_page, total: res.data.total }
      } else { users.value = res.data; meta.value.total = res.data.length }
    } catch (e: any) { error.value = e.userMessage || 'Không thể tải người dùng'; users.value = [] }
    finally { loading.value = false }
  }

  async function create(fd: FormData) {
    const res = await userApi.create(fd)
    const u: User = res.data.data ?? res.data
    users.value.unshift(u); meta.value.total++
    return u
  }

  async function update(id: number, fd: FormData) {
    const res = await userApi.update(id, fd)
    const u: User = res.data.data ?? res.data
    const idx = users.value.findIndex(x => x.id === id)
    if (idx !== -1) users.value[idx] = u
    return u
  }

  async function remove(id: number) {
    await userApi.delete(id)
    users.value = users.value.filter(u => u.id !== id)
    meta.value.total = Math.max(0, meta.value.total - 1)
  }

  async function toggleStatus(id: number) {
    await userApi.toggleStatus(id)
    const u = users.value.find(x => x.id === id)
    if (u) u.status = u.status === 1 ? 0 : 1
  }

  function getById(id: number) { return users.value.find(u => u.id === id) }

  return { users, loading, error, meta, fetchAll, create, update, remove, toggleStatus, getById }
})
