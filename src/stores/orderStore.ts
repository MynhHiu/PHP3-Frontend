import { defineStore } from 'pinia'
import { ref } from 'vue'

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

interface OrderItem {
  product_sku_code: string
  quantity: number
}

interface CheckoutPayload {
  email: string
  phone: string
  address: string
  payment: string
  coupon_code?: string
  items: OrderItem[]
}

interface Order {
  id: number
  email: string
  phone: string
  address: string
  total: number
  payment: string
  status: string
  created_at: string
  items: Array<{
    id: number
    product_sku_code: string
    quantity: number
    price: number | null
    product_name: string | null
    product_image: string | null
  }>
}

function getToken(): string | null {
  return localStorage.getItem('token')
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

export const useOrderStore = defineStore('order', () => {
  const loading = ref(false)
  const orders  = ref<Order[]>([])

  /**
   * Gửi đơn hàng lên server.
   * Trả về object Order vừa tạo.
   */
  async function checkout(payload: CheckoutPayload): Promise<Order> {
    loading.value = true
    try {
      const res = await fetch(`${BASE}/user/orders`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload),
      })
      const data = await handleResponse<{ message: string; order: Order }>(res)
      return data.order
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy lịch sử đơn hàng của user đang đăng nhập.
   */
  async function fetchOrders(): Promise<void> {
    loading.value = true
    try {
      const res  = await fetch(`${BASE}/user/orders`, { headers: authHeaders() })
      const data = await handleResponse<{ data: Order[] }>(res)
      orders.value = data.data
    } finally {
      loading.value = false
    }
  }

  /**
   * Lấy chi tiết 1 đơn hàng theo id.
   */
  async function fetchOrder(id: number): Promise<Order> {
    const res  = await fetch(`${BASE}/user/orders/${id}`, { headers: authHeaders() })
    const data = await handleResponse<Order>(res)
    return data
  }

  return { loading, orders, checkout, fetchOrders, fetchOrder }
})