// src/user/stores/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

interface StoredUser extends User {
  password: string
}

function getUsers(): StoredUser[] {
  try { return JSON.parse(localStorage.getItem('mock_users') || '[]') }
  catch { return [] }
}
function saveUsers(users: StoredUser[]) {
  localStorage.setItem('mock_users', JSON.stringify(users))
}

export const useAuthStore = defineStore('auth', () => {
  const user  = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('user_token'))

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // ── Khởi tạo: load lại user từ localStorage ─────────────────
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

  // ── Đăng nhập giả ───────────────────────────────────────────
  async function login(email: string, password: string) {
    await new Promise(r => setTimeout(r, 600)) // giả lập delay

    const users = getUsers()
    const found = users.find(u => u.email === email && u.password === password)

    if (!found) {
      throw { userMessage: 'Email hoặc mật khẩu không đúng' }
    }

    const { password: _, ...userWithoutPwd } = found
    const fakeToken = 'mock_token_' + Date.now()

    token.value = fakeToken
    user.value  = userWithoutPwd
    localStorage.setItem('user_token', fakeToken)
    localStorage.setItem('user_info', JSON.stringify(userWithoutPwd))

    return { token: fakeToken, user: userWithoutPwd }
  }

  // ── Đăng ký giả ─────────────────────────────────────────────
  async function register(payload: {
    fullname: string
    email: string
    phone: string
    password: string
    address?: string
  }) {
    await new Promise(r => setTimeout(r, 600))

    const users = getUsers()

    if (users.find(u => u.email === payload.email)) {
      throw { userMessage: 'Email này đã được sử dụng' }
    }

    const newUser: StoredUser = {
      id:       Date.now(),
      fullname: payload.fullname,
      email:    payload.email,
      phone:    payload.phone,
      address:  payload.address || '',
      role:     0,
      status:   1,
      password: payload.password,
    }

    saveUsers([...users, newUser])

    const { password: _, ...userWithoutPwd } = newUser
    const fakeToken = 'mock_token_' + Date.now()

    token.value = fakeToken
    user.value  = userWithoutPwd
    localStorage.setItem('user_token', fakeToken)
    localStorage.setItem('user_info', JSON.stringify(userWithoutPwd))

    return { token: fakeToken, user: userWithoutPwd }
  }

  // ── Đăng xuất ───────────────────────────────────────────────
  function logout() {
    user.value  = null
    token.value = null
    localStorage.removeItem('user_token')
    localStorage.removeItem('user_info')
  }

  // ── Cập nhật profile (mock) ──────────────────────────────────
  async function updateProfile(formData: FormData) {
    await new Promise(r => setTimeout(r, 400))

    const updated: User = {
      ...user.value!,
      fullname: formData.get('fullname') as string || user.value!.fullname,
      phone:    formData.get('phone')    as string || user.value!.phone,
      address:  formData.get('address')  as string || user.value!.address,
    }

    user.value = updated
    localStorage.setItem('user_info', JSON.stringify(updated))

    // Cập nhật lại trong danh sách mock_users
    const users = getUsers()
    const idx   = users.findIndex(u => u.id === updated.id)
  if (idx !== -1) {
  users[idx] = { ...users[idx], ...updated, password: users[idx].password }
  saveUsers(users)
}

    return updated
  }

  return {
    user, token, isLoggedIn,
    init, login, register, logout, updateProfile,
  }
})