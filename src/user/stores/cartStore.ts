// src/user/stores/cartStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'
import { useAuthStore } from './authStore'

export interface CartItem {
  id: number
  product_sku_code: string
  quantity: number
  user_id: number
  product?: {
    name: string
    image_url: string
    price: number
  }
}

export const useCartStore = defineStore('cart', () => {
  const items   = ref<CartItem[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)

  const totalItems = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0)
  )

  function authHeader() {
    const token = useAuthStore().token
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // ── Lấy giỏ hàng ────────────────────────────────────────────
  async function fetchCart() {
    loading.value = true
    error.value   = null
    try {
      const res  = await api.get('/user/cart', { headers: authHeader() })
      items.value = res.data.data ?? res.data
    } catch (err: any) {
      error.value = err.userMessage || 'Không thể tải giỏ hàng'
    } finally {
      loading.value = false
    }
  }

  // ── Thêm vào giỏ ────────────────────────────────────────────
  async function addToCart(skuCode: string, quantity = 1) {
    const res = await api.post(
      '/user/cart',
      { product_sku_code: skuCode, quantity },
      { headers: authHeader() }
    )
    await fetchCart()
    return res.data
  }

  // ── Cập nhật số lượng ────────────────────────────────────────
  async function updateQuantity(cartItemId: number, quantity: number) {
    if (quantity <= 0) return removeItem(cartItemId)
    await api.put(
      `/user/cart/${cartItemId}`,
      { quantity },
      { headers: authHeader() }
    )
    const item = items.value.find(i => i.id === cartItemId)
    if (item) item.quantity = quantity
  }

  // ── Xoá item ─────────────────────────────────────────────────
  async function removeItem(cartItemId: number) {
    await api.delete(`/user/cart/${cartItemId}`, { headers: authHeader() })
    items.value = items.value.filter(i => i.id !== cartItemId)
  }

  // ── Xoá hết giỏ ─────────────────────────────────────────────
  function clearCart() {
    items.value = []
  }

  return {
    items, loading, error,
    totalItems, totalPrice,
    fetchCart, addToCart, updateQuantity, removeItem, clearCart,
  }
})
