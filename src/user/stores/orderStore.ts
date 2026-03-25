// src/user/stores/orderStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'
import { useAuthStore } from './authStore'

export interface OrderDetail {
  id: number
  product_sku_code: string
  quantity: number
  orders_id: number
  product?: { name: string; image_url: string; price: number }
}

export interface Order {
  id: number
  user_id: number
  email: string
  phone: string
  address: string
  total: number
  payment: string
  status: string
  created_at: string
  order_details?: OrderDetail[]
}

export interface CheckoutPayload {
  email: string
  phone: string
  address: string
  payment: string
  coupon_code?: string
  items: { product_sku_code: string; quantity: number }[]
}

export const useOrderStore = defineStore('order', () => {
  const orders  = ref<Order[]>([])
  const current = ref<Order | null>(null)
  const loading = ref(false)
  const error   = ref<string | null>(null)

  function authHeader() {
    const token = useAuthStore().token
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // ── Danh sách đơn hàng của user ─────────────────────────────
  async function fetchOrders() {
    loading.value = true
    error.value   = null
    try {
      const res   = await api.get('/user/orders', { headers: authHeader() })
      orders.value = res.data.data ?? res.data
    } catch (err: any) {
      error.value  = err.userMessage || 'Không thể tải đơn hàng'
    } finally {
      loading.value = false
    }
  }

  // ── Chi tiết đơn hàng ────────────────────────────────────────
  async function fetchOrder(id: number) {
    loading.value  = true
    error.value    = null
    current.value  = null
    try {
      const res      = await api.get(`/user/orders/${id}`, { headers: authHeader() })
      current.value  = res.data.data ?? res.data
    } catch (err: any) {
      error.value    = err.userMessage || 'Không tìm thấy đơn hàng'
    } finally {
      loading.value  = false
    }
  }

  // ── Đặt hàng (checkout) ──────────────────────────────────────
  async function checkout(payload: CheckoutPayload) {
    const res     = await api.post('/user/orders', payload, { headers: authHeader() })
    const order   = res.data.data ?? res.data
    orders.value.unshift(order)
    return order
  }

  // ── Huỷ đơn ─────────────────────────────────────────────────
  async function cancelOrder(id: number) {
    await api.put(`/user/orders/${id}/cancel`, {}, { headers: authHeader() })
    const found = orders.value.find(o => o.id === id)
    if (found) found.status = 'cancelled'
    if (current.value?.id === id) current.value.status = 'cancelled'
  }

  return {
    orders, current, loading, error,
    fetchOrders, fetchOrder, checkout, cancelOrder,
  }
})
