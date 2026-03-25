// src/user/stores/cartStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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

function getCart(): CartItem[] {
  try { return JSON.parse(localStorage.getItem('mock_cart') || '[]') }
  catch { return [] }
}
function saveCart(cart: CartItem[]) {
  localStorage.setItem('mock_cart', JSON.stringify(cart))
}

export const useCartStore = defineStore('cart', () => {
  const items   = ref<CartItem[]>(getCart())
  const loading = ref(false)
  const error   = ref<string | null>(null)

  const totalItems = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  )
  const totalPrice = computed(() =>
    items.value.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0)
  )

  // ── Lấy giỏ hàng ────────────────────────────────────────────
  async function fetchCart() {
    items.value = getCart()
  }

  // ── Thêm vào giỏ ────────────────────────────────────────────
  async function addToCart(skuCode: string, quantity = 1, productInfo?: CartItem['product']) {
    const cart    = getCart()
    const existing = cart.find(i => i.product_sku_code === skuCode)

    if (existing) {
      existing.quantity += quantity
    } else {
      cart.push({
        id:               Date.now(),
        product_sku_code: skuCode,
        quantity,
        user_id:          0,
        product:          productInfo,
      })
    }

    saveCart(cart)
    items.value = cart
  }

  // ── Cập nhật số lượng ────────────────────────────────────────
  async function updateQuantity(cartItemId: number, quantity: number) {
    if (quantity <= 0) return removeItem(cartItemId)
    const cart = getCart()
    const item = cart.find(i => i.id === cartItemId)
    if (item) item.quantity = quantity
    saveCart(cart)
    items.value = cart
  }

  // ── Xoá item ─────────────────────────────────────────────────
  async function removeItem(cartItemId: number) {
    const cart = getCart().filter(i => i.id !== cartItemId)
    saveCart(cart)
    items.value = cart
  }

  // ── Xoá hết giỏ ─────────────────────────────────────────────
  function clearCart() {
    saveCart([])
    items.value = []
  }

  return {
    items, loading, error,
    totalItems, totalPrice,
    fetchCart, addToCart, updateQuantity, removeItem, clearCart,
  }
})