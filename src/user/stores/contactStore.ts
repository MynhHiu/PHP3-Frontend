import { defineStore } from 'pinia'
import { ref } from 'vue'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export interface Contact {
  id: number
  fullname: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: 'pending' | 'replied' | 'closed'
  reply_message: string | null
  replied_at: string | null
  created_at: string
  updated_at: string
}

export interface ContactStats {
  total: number
  pending: number
  replied: number
  closed: number
}

function getToken(): string | null {
  return localStorage.getItem('user_token') // ← sửa từ 'token' thành 'user_token'
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) {
    const err = new Error(data.message ?? 'Lỗi không xác định') as any
    err.userMessage = data.message ?? 'Lỗi không xác định'
    err.errors = data.errors
    throw err
  }
  return data as T
}

export const useContactStore = defineStore('adminContact', () => {
  const contacts       = ref<Contact[]>([])
  const selected       = ref<Contact | null>(null)
  const stats          = ref<ContactStats>({ total: 0, pending: 0, replied: 0, closed: 0 })
  const loading        = ref(false)
  const replyLoading   = ref(false)
  const error          = ref<string | null>(null)

  const currentPage = ref(1)
  const lastPage    = ref(1)
  const total       = ref(0)
  const perPage     = ref(15)

  const filterStatus  = ref<'all' | 'pending' | 'replied' | 'closed'>('all')
  const searchQuery   = ref('')

  async function fetchContacts(page = 1) {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams({ page: String(page), per_page: String(perPage.value) })
      if (filterStatus.value !== 'all') params.set('status', filterStatus.value)
      if (searchQuery.value.trim())     params.set('search', searchQuery.value.trim())

      const res  = await fetch(`${BASE}/admin/contacts?${params}`, { headers: authHeaders() })
      const data = await handleResponse<any>(res)

      contacts.value    = data.data
      currentPage.value = data.current_page
      lastPage.value    = data.last_page
      total.value       = data.total
    } catch (e: any) {
      error.value = e.userMessage ?? 'Không thể tải danh sách liên hệ.'
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    try {
      const res  = await fetch(`${BASE}/admin/contacts/stats`, { headers: authHeaders() })
      const data = await handleResponse<ContactStats>(res)
      stats.value = data
    } catch {}
  }

  async function fetchContact(id: number) {
    loading.value = true
    try {
      const res  = await fetch(`${BASE}/admin/contacts/${id}`, { headers: authHeaders() })
      const data = await handleResponse<Contact>(res)
      selected.value = data
    } catch (e: any) {
      error.value = e.userMessage ?? 'Không thể tải chi tiết.'
    } finally {
      loading.value = false
    }
  }

  async function replyContact(id: number, replyMessage: string): Promise<boolean> {
    replyLoading.value = true
    error.value = null
    try {
      const res  = await fetch(`${BASE}/admin/contacts/${id}/reply`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ reply_message: replyMessage }),
      })
      const data = await handleResponse<{ message: string; data: Contact }>(res)

      const idx = contacts.value.findIndex(c => c.id === id)
      if (idx !== -1) contacts.value[idx] = data.data
      if (selected.value?.id === id) selected.value = data.data

      await fetchStats()
      return true
    } catch (e: any) {
      error.value = e.userMessage ?? 'Gửi phản hồi thất bại.'
      return false
    } finally {
      replyLoading.value = false
    }
  }

  async function deleteContact(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${BASE}/admin/contacts/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      await handleResponse(res)
      contacts.value = contacts.value.filter(c => c.id !== id)
      total.value -= 1
      await fetchStats()
      return true
    } catch (e: any) {
      error.value = e.userMessage ?? 'Xóa thất bại.'
      return false
    }
  }

  function resetFilters() {
    filterStatus.value = 'all'
    searchQuery.value  = ''
    currentPage.value  = 1
  }

  return {
    contacts, selected, stats,
    loading, replyLoading, error,
    currentPage, lastPage, total, perPage,
    filterStatus, searchQuery,
    fetchContacts, fetchStats, fetchContact,
    replyContact, deleteContact, resetFilters,
  }
})