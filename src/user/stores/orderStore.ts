// src/user/stores/orderStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

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

function getOrders(): Order[] {
  try { return JSON.parse(localStorage.getItem('mock_orders') || '[]') }
  catch { return [] }
}
function saveOrders(o: Order[]) {
  localStorage.setItem('mock_orders', JSON.stringify(o))
}

export const useOrderStore = defineStore('order', () => {
  const orders  = ref<Order[]>(getOrders())
  const current = ref<Order | null>(null)
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function fetchOrders() {
    orders.value = getOrders()
  }

  async function fetchOrder(id: number) {
    current.value = getOrders().find(o => o.id === id) ?? null
  }

  async function checkout(payload: CheckoutPayload) {
    await new Promise(r => setTimeout(r, 800))
    const newOrder: Order = {
      id:         Date.now(),
      user_id:    0,
      email:      payload.email,
      phone:      payload.phone,
      address:    payload.address,
      total:      0,
      payment:    payload.payment,
      status:     'pending',
      created_at: new Date().toISOString(),
    }
    const all = [newOrder, ...getOrders()]
    saveOrders(all)
    orders.value = all
    return newOrder
  }

  async function cancelOrder(id: number) {
    const all = getOrders().map(o => o.id === id ? { ...o, status: 'cancelled' } : o)
    saveOrders(all)
    orders.value = all
    if (current.value?.id === id) current.value.status = 'cancelled'
  }

  return { orders, current, loading, error, fetchOrders, fetchOrder, checkout, cancelOrder }
})