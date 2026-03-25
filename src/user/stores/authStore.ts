// src/user/stores/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export interface User {
  id: number
  fullname: string
  email: string
  phone: string
  address: string
  image?: string
  role: number
  status: number
}

export const useAuthStore = defineStore('auth', () => {
  const user  = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('user_token'))

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // ── Khởi tạo: load user từ token đã lưu ────────────────────
  async function init() {
    if (!token.value) return
    try {
      const res  = await api.get('/user/profile', {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      user.value = res.data.data ?? res.data
    } catch {
      logout()
    }
  }

  // ── Đăng nhập ───────────────────────────────────────────────
  async function login(email: string, password: string) {
    const res    = await api.post('/user/login', { email, password })
    const data   = res.data.data ?? res.data
    token.value  = data.token
    user.value   = data.user ?? data
    localStorage.setItem('user_token', token.value as string)
    return data
  }

  // ── Đăng ký ─────────────────────────────────────────────────
  async function register(payload: {
    fullname: string
    email: string
    phone: string
    password: string
    address?: string
  }) {
    const res   = await api.post('/user/register', payload)
    const data  = res.data.data ?? res.data
    token.value = data.token
    user.value  = data.user ?? data
    localStorage.setItem('user_token', token.value as string)
    return data
  }

  // ── Đăng xuất ───────────────────────────────────────────────
  function logout() {
    user.value  = null
    token.value = null
    localStorage.removeItem('user_token')
  }

  // ── Cập nhật profile ─────────────────────────────────────────
  async function updateProfile(formData: FormData) {
    formData.append('_method', 'PUT')
    const res  = await api.post('/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token.value}`,
      },
    })
    user.value = res.data.data ?? res.data
    return user.value
  }

  return {
    user, token, isLoggedIn,
    init, login, register, logout, updateProfile,
  }
})
