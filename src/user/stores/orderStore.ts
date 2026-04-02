// src/user/stores/orderStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/index'

export interface OrderDetail {
  id: number
  product_sku_code: string
  orders_id: number
  quantity: number
  product_sku?: {
    product?: {
      name: string
      image_url?: string
      price?: number
    }
  }
}

export interface Order {
  id: number
  user_id: number
  email: string
  phone: number
  address: string
  total: number
  payment: string
  status: string
  created_at: string
  order_details: OrderDetail[]
}

export const useOrderStore = defineStore('order', () => {
  const orders  = ref<Order[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)

  // ── Lấy danh sách đơn hàng ──────────────────────────────────────────────
  async function fetchOrders() {
    loading.value = true
    error.value   = null
    try {
      const res   = await api.get('/orders')
      orders.value = res.data.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Không thể tải đơn hàng.'
    } finally {
      loading.value = false
    }
  }

  // ── Lấy chi tiết 1 đơn hàng ─────────────────────────────────────────────
  async function fetchOrder(id: number): Promise<Order | null> {
    try {
      const res = await api.get(`/orders/${id}`)
      return res.data.data
    } catch {
      return null
    }
  }

  // ── Huỷ đơn hàng ────────────────────────────────────────────────────────
  async function cancelOrder(id: number) {
    try {
      await api.patch(`/orders/${id}/cancel`)
      // Cập nhật lại status trong danh sách local
      const order = orders.value.find(o => o.id === id)
      if (order) order.status = 'cancelled'
    } catch (err: any) {
      throw err
    }
  }

  return {
    orders, loading, error,
    fetchOrders, fetchOrder, cancelOrder,
  }
})