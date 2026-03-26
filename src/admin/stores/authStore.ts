// src/user/stores/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/index'

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

  // ── Khởi tạo: load lại user từ localStorage ─────────────────────────────
  function init() {
    if (!token.value) return
    try {
      const saved = localStorage.getItem('user_info')
      if (saved) user.value = JSON.parse(saved)
      else logout()
    } catch {
      logout()
    }
  }

  // ── Lưu session vào localStorage ────────────────────────────────────────
  function saveSession(tk: string, u: User) {
    token.value = tk
    user.value  = u
    localStorage.setItem('user_token', tk)
    localStorage.setItem('user_info', JSON.stringify(u))
  }

  // ── ĐĂNG NHẬP ────────────────────────────────────────────────────────────
  async function login(email: string, password: string) {
    const res = await authApi.login(email, password)
    saveSession(res.token, res.user)
    return res
  }

  // ── ĐĂNG KÝ ──────────────────────────────────────────────────────────────
  async function register(payload: {
    fullname: string
    email: string
    phone: string
    password: string
    address?: string
  }) {
    const res = await authApi.register(payload)
    saveSession(res.token, res.user)
    return res
  }

  // ── ĐĂNG XUẤT ────────────────────────────────────────────────────────────
  async function logout() {
    try {
      // Gọi API logout để xóa token phía server (Sanctum)
      if (token.value) await authApi.logout()
    } catch {
      // Bỏ qua lỗi nếu token đã hết hạn
    } finally {
      user.value  = null
      token.value = null
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_info')
    }
  }

  // ── CẬP NHẬT PROFILE ─────────────────────────────────────────────────────
  async function updateProfile(formData: FormData) {
    // Gọi API update profile (nếu có endpoint)
    // const res = await api.post('/user/profile', formData)
    // Tạm thời cập nhật local
    const updated: User = {
      ...user.value!,
      fullname: formData.get('fullname') as string || user.value!.fullname,
      phone:    formData.get('phone')    as string || user.value!.phone,
      address:  formData.get('address')  as string || user.value!.address,
    }
    user.value = updated
    localStorage.setItem('user_info', JSON.stringify(updated))
    return updated
  }

  return {
    user, token, isLoggedIn,
    init, login, register, logout, updateProfile,
  }
})