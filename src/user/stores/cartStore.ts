// src/user/stores/cartStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApi } from '@/api/index'

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

  // ── Lấy giỏ hàng từ API ─────────────────────────────────────
  async function fetchCart() {
    loading.value = true
    error.value   = null
    try {
      const res    = await cartApi.getAll()
      items.value  = res.data.data ?? res.data
    } catch (err: any) {
      error.value  = err.userMessage || 'Không thể tải giỏ hàng.'
      items.value  = []
    } finally {
      loading.value = false
    }
  }

  // ── Thêm vào giỏ ────────────────────────────────────────────
  async function addToCart(
    skuCode: string,
    quantity = 1,
    _productInfo?: CartItem['product'], // giữ tham số để không breaking change
  ) {
    loading.value = true
    error.value   = null
    try {
      await cartApi.add(skuCode, quantity)
      await fetchCart() // reload lại từ API để đồng bộ
    } catch (err: any) {
      error.value = err.userMessage || 'Không thể thêm vào giỏ hàng.'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ── Cập nhật số lượng ────────────────────────────────────────
  async function updateQuantity(cartItemId: number, quantity: number) {
    if (quantity <= 0) return removeItem(cartItemId)
    try {
      await cartApi.updateQuantity(cartItemId, quantity)
      const item = items.value.find(i => i.id === cartItemId)
      if (item) item.quantity = quantity
    } catch (err: any) {
      error.value = err.userMessage || 'Không thể cập nhật số lượng.'
      throw err
    }
  }

  // ── Xoá item ─────────────────────────────────────────────────
  async function removeItem(cartItemId: number) {
    try {
      await cartApi.remove(cartItemId)
      items.value = items.value.filter(i => i.id !== cartItemId)
    } catch (err: any) {
      error.value = err.userMessage || 'Không thể xoá sản phẩm.'
      throw err
    }
  }

  // ── Xoá hết giỏ ─────────────────────────────────────────────
  async function clearCart() {
    try {
      await cartApi.clear()
      items.value = []
    } catch (err: any) {
      error.value = err.userMessage || 'Không thể xoá giỏ hàng.'
      throw err
    }
  }

  return {
    items, loading, error,
    totalItems, totalPrice,
    fetchCart, addToCart, updateQuantity, removeItem, clearCart,
  }
})