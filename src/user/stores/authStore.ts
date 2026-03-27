// src/user/stores/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/index'

export interface User {
  id: number
  fullname: string
  email: string
  phone: string
  address: string
  image?: string
  role: string
  status: number
}

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  // ── Getters ────────────────────────────────────────────────────────────────
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const currentUser = computed(() => user.value)

  // ── Helpers ────────────────────────────────────────────────────────────────
  function saveSession(userData: User, tokenValue: string) {
    user.value = userData
    token.value = tokenValue
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('user_info', JSON.stringify(userData))
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user_token', tokenValue) // đồng bộ với interceptor
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenValue}`
  }

  function clearSession() {
    user.value = null
    token.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('user_token')
    delete api.defaults.headers.common['Authorization']
  }

  // Set axios header on store init (page refresh)
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  // ── Khởi tạo: load lại user từ localStorage ─────────────────────────────
  function init() {
    if (!token.value) return
    try {
      const saved = localStorage.getItem('user') || localStorage.getItem('user_info')
      if (saved) {
        user.value = JSON.parse(saved)
      } else {
        logout()
      }
    } catch {
      logout()
    }
  }

  // ── ĐĂNG NHẬP ────────────────────────────────────────────────────────────
async function login(email: string, password: string) {
  loading.value = true
  error.value = null
  try {
    const res = await api.post('/auth/login', { email, password })
    saveSession(res.data.data.user, res.data.data.token)
    return { success: true, message: res.data.message }
  } catch (err: any) {
    const msg = err.response?.data?.message || 'Đăng nhập thất bại.'
    error.value = msg
    throw err   // ← THÊM DÒNG NÀY để LoginView catch được
  } finally {
    loading.value = false
  }
}

  async function loginWithGoogle() {
    loading.value = true
    error.value = null
    try {
      const res = await api.get('/auth/google/redirect')
      // Chuyển hướng trình duyệt sang Google
      window.location.href = res.data.url
    } catch (err: any) {
      error.value = 'Không thể kết nối Google. Vui lòng thử lại.'
      loading.value = false
    }
  }

  /**
   * Xử lý sau khi Google redirect về frontend.
   * Gọi hàm này trong component GoogleCallback.vue
   */
  function handleGoogleCallback(tokenValue: string, userData: User) {
    saveSession(userData, tokenValue)
  }

// ── ĐĂNG KÝ ──────────────────────────────────────────────────────────────
async function register(data: {
  fullname: string
  email: string
  phone: string
  password: string
  password_confirmation: string
  address?: string
}) {
  loading.value = true
  error.value = null
  try {
    const res = await api.post('/auth/register', data)
    saveSession(res.data.data.user, res.data.data.token)
    return { success: true, message: res.data.message }
  } catch (err: any) {
    const msg = err.response?.data?.message || 'Đăng ký thất bại.'
    error.value = msg
    throw err   // ← THÊM DÒNG NÀY
  } finally {
    loading.value = false
  }
}

  // ── ĐĂNG XUẤT ────────────────────────────────────────────────────────────
  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch (_) {
      // Bỏ qua lỗi nếu token đã hết hạn
    } finally {
      clearSession()
    }
  }

  async function fetchMe() {
    if (!token.value) return
    try {
      const res = await api.get('/auth/me')
      user.value = res.data.data
      localStorage.setItem('user', JSON.stringify(res.data.data))
    } catch (_) {
      clearSession()
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
      phone: formData.get('phone') as string || user.value!.phone,
      address: formData.get('address') as string || user.value!.address,
    }
    user.value = updated
    localStorage.setItem('user_info', JSON.stringify(updated))
    return updated
  }

  return {
    // state
    user, token, loading, error,
    // getters
    isLoggedIn, isAdmin, currentUser,
    // actions
    register, login, loginWithGoogle, handleGoogleCallback, logout, fetchMe, init,
  }
})