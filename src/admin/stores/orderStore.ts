import { defineStore } from 'pinia'
import { ref } from 'vue'
import { orderApi } from '@/api'

export interface OrderDetail {
  id: number
  product_sku_code: string
  orders_id: number
  quantity: number
  product_name?: string
}

export interface Order {
  id: number
  user_id: number
  email?: string
  phone?: string
  address?: string
  total: number
  payment: string
  status: string
  cancel_reason?: string
  created_at: string
  details?: OrderDetail[]
  user?: { fullname: string; email: string }
}

export interface OrderMeta {
  current_page: number; last_page: number; per_page: number; total: number
}

export const useOrderStore = defineStore('order', () => {
  const orders  = ref<Order[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)
  const meta    = ref<OrderMeta>({ current_page: 1, last_page: 1, per_page: 15, total: 0 })
  const current = ref<Order | null>(null)

  async function fetchAll(params: Record<string, any> = {}) {
    loading.value = true; error.value = null
    try {
      const res = await orderApi.getAll(params)
      if (res.data.data) {
        orders.value = res.data.data
        meta.value = res.data.meta ?? { current_page: res.data.current_page, last_page: res.data.last_page, per_page: res.data.per_page, total: res.data.total }
      } else { orders.value = res.data; meta.value.total = res.data.length }
    } catch (e: any) { error.value = e.userMessage || 'Không thể tải đơn hàng'; orders.value = [] }
    finally { loading.value = false }
  }

  async function fetchOne(id: number) {
    try {
      const res = await orderApi.getOne(id)
      current.value = res.data.data ?? res.data
    } catch { current.value = null }
  }

  async function updateStatus(id: number, status: string) {
    await orderApi.updateStatus(id, status)
    const o = orders.value.find(x => x.id === id)
    if (o) o.status = status
    if (current.value?.id === id) current.value.status = status
  }

  return { orders, loading, error, meta, current, fetchAll, fetchOne, updateStatus }
})
