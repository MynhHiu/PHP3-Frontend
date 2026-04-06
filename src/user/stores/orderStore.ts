// src/user/stores/orderStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/index'

export interface OrderItem {
  id: number
  product_sku_code: string
  quantity: number
  price: number | null
  product_name: string | null
  product_image: string | null
}

export interface Order {
  id: number
  user_id?: number
  email: string
  phone: string | number
  address: string
  total: number
  payment: string
  status: string
  created_at: string
  items: OrderItem[]
  // backward compat
  order_details?: any[]
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

  // ── Lấy danh sách đơn hàng ──────────────────────────────────────────────
  async function fetchOrders() {
    loading.value = true
    error.value   = null
    try {
      const res    = await api.get('/user/orders')
      orders.value = res.data.data ?? res.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không thể tải đơn hàng.'
    } finally {
      loading.value = false
    }
  }

  // ── Lấy chi tiết 1 đơn hàng ─────────────────────────────────────────────
  async function fetchOrder(id: number): Promise<Order | null> {
    try {
      const res = await api.get(`/user/orders/${id}`)
      current.value = res.data
      return res.data
    } catch {
      return null
    }
  }

  // ── Huỷ đơn hàng ────────────────────────────────────────────────────────
  async function cancelOrder(id: number) {
    try {
      await api.patch(`/user/orders/${id}/cancel`)
      const order = orders.value.find(o => o.id === id)
      if (order) order.status = 'cancelled'
    } catch (err: any) {
      throw err
    }
  }

  async function checkout(payload: CheckoutPayload): Promise<Order> {
    const res = await api.post('/user/orders', payload)
    return res.data.order
  }

  return {
    orders, current, loading, error,
    fetchOrders, fetchOrder, cancelOrder, checkout,
  }
})