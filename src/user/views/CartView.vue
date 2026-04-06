<template>
  <div class="cart-page">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="sep">›</span>
      <span class="active">Giỏ hàng</span>
    </div>

    <h1 class="page-title">Giỏ hàng của bạn</h1>

    <div v-if="cartStore.loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải giỏ hàng...</p>
    </div>

    <div v-else-if="cartStore.items.length === 0" class="empty-cart">
      <div class="empty-icon"></div>
      <p>Giỏ hàng của bạn đang trống</p>
      <router-link to="/" class="btn-continue">Tiếp tục mua sắm</router-link>
    </div>

    <div v-else class="cart-layout">
      <div class="cart-items">
        <div class="cart-header-row">
          <label class="checkbox-wrap">
            <input type="checkbox" :checked="selectAll" @change="toggleAll" />
            <span>Chọn tất cả ({{ cartStore.items.length }} sản phẩm)</span>
          </label>
          <button class="btn-delete-selected" @click="deleteSelected">Xóa đã chọn</button>
        </div>

        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <label class="checkbox-wrap">
            <input type="checkbox" v-model="selectedIds" :value="item.id" />
          </label>
          <div class="item-image">
            <img :src="item.image_url || item.product?.image_url || 'https://placehold.co/90x90/e8f5e9/2e7d32?text=SP'" :alt="item.product?.name" />
          </div>
          <div class="item-info">
            <p class="item-name">{{ item.product?.name || item.product_sku_code }}</p>
            <p class="item-sku">SKU: {{ item.product_sku_code }}</p>
            <p class="item-price">{{ formatPrice(Number(item.price ?? 0)) }}đ</p>
          </div>
          <div class="item-qty">
            <button class="qty-btn" :disabled="item.quantity <= 1 || cartStore.loading"
              @click="cartStore.updateQuantity(item.id, item.quantity - 1)">−</button>
            <input type="number" :value="item.quantity" min="1" class="qty-input"
              @change="(e) => cartStore.updateQuantity(item.id, +(e.target as HTMLInputElement).value)" />
            <button class="qty-btn" :disabled="cartStore.loading"
              @click="cartStore.updateQuantity(item.id, item.quantity + 1)">+</button>
          </div>
          <div class="item-total">{{ formatPrice(Number(item.price ?? item.product?.price ?? 0) * item.quantity) }}đ</div>
          <button class="btn-remove" @click="cartStore.removeItem(item.id)">✕</button>
        </div>
      </div>

      <div class="cart-summary">
        <h3>Tóm tắt đơn hàng</h3>
        <div class="coupon-row">
          <input v-model="couponCode" type="text" placeholder="Nhập mã giảm giá..." class="coupon-input" />
          <button class="btn-coupon" @click="applyCoupon">Áp dụng</button>
        </div>
        <div class="summary-lines">
          <div class="summary-line">
            <span>Tạm tính:</span>
            <span>{{ formatPrice(selectedSubtotal) }}đ</span>
          </div>
          <div class="summary-line" v-if="discount > 0">
            <span class="discount-label">Giảm giá:</span>
            <span class="discount-value">-{{ formatPrice(discount) }}đ</span>
          </div>
          <div class="summary-line">
            <span>Phí vận chuyển:</span>
            <span :class="shippingFee === 0 ? 'free-ship' : ''">
              {{ shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee) + 'đ' }}
            </span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-line total-line">
            <span>Tổng cộng:</span>
            <span class="total-price">{{ formatPrice(total) }}đ</span>
          </div>
        </div>
        <button class="btn-checkout" :disabled="selectedIds.length === 0" @click="checkout">
          Đặt hàng ngay
        </button>
        <router-link to="/" class="btn-continue-shop">← Tiếp tục mua sắm</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/user/stores/cartStore'

const cartStore   = useCartStore()
const router      = useRouter()
const selectedIds = ref<number[]>([])
const couponCode  = ref('')
const discount    = ref(0)

onMounted(async () => {
  await cartStore.fetchCart()
  selectedIds.value = cartStore.items.map(i => i.id)
})

const selectAll = computed(() =>
  selectedIds.value.length === cartStore.items.length && cartStore.items.length > 0
)
const toggleAll = () => {
  selectedIds.value = selectAll.value ? [] : cartStore.items.map(i => i.id)
}
const selectedSubtotal = computed(() =>
  cartStore.items
    .filter(i => selectedIds.value.includes(i.id))
    .reduce((sum, i) => sum + Number(i.price ?? i.product?.price ?? 0) * i.quantity, 0)
)
const shippingFee = computed(() => selectedSubtotal.value >= 5_000_000 ? 0 : 30_000)
const total       = computed(() => selectedSubtotal.value - discount.value + shippingFee.value)

const formatPrice = (v: number) => v.toLocaleString('vi-VN')

const deleteSelected = async () => {
  for (const id of [...selectedIds.value]) await cartStore.removeItem(id)
  selectedIds.value = []
}

const applyCoupon = () => {
  const code = couponCode.value.trim().toUpperCase()
  if (code === 'GIAM10') {
    discount.value = Math.round(selectedSubtotal.value * 0.1)
    alert(`Áp dụng thành công! Giảm ${formatPrice(discount.value)}đ`)
  } else if (code === 'FREESHIP') {
    discount.value = shippingFee.value
    alert('Áp dụng miễn phí vận chuyển!')
  } else {
    alert('Mã giảm giá không hợp lệ')
  }
}

const checkout = () => {
  if (selectedIds.value.length === 0) return
  router.push({ path: '/checkout', query: { ids: selectedIds.value.join(',') } })
}
</script>

<style scoped>
.cart-page { max-width: 1200px; margin: 0 auto; padding: 20px 16px 60px; font-family: 'Segoe UI', sans-serif; color: #222; }
.breadcrumb { font-size: 13px; color: #888; margin-bottom: 12px; }
.breadcrumb a { color: #2e7d32; text-decoration: none; }
.breadcrumb .sep { margin: 0 6px; }
.breadcrumb .active { color: #2e7d32; font-weight: 500; }
.page-title { font-size: 22px; font-weight: 700; color: #1b5e20; margin-bottom: 20px; }
.loading-state { text-align: center; padding: 80px 20px; color: #888; }
.spinner { width: 40px; height: 40px; border: 4px solid #e8f5e9; border-top-color: #2e7d32; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-cart { text-align: center; padding: 80px 20px; color: #888; }
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.empty-cart p { font-size: 16px; margin-bottom: 20px; }
.btn-continue { display: inline-block; padding: 12px 28px; background: #2e7d32; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600; }
.btn-continue:hover { background: #1b5e20; }
.cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start; }
.cart-items { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
.cart-header-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #f5f5f5; border-bottom: 1px solid #e0e0e0; }
.checkbox-wrap { display: flex; align-items: center; gap: 8px; font-size: 14px; cursor: pointer; }
.checkbox-wrap input[type="checkbox"] { width: 16px; height: 16px; accent-color: #2e7d32; cursor: pointer; }
.btn-delete-selected { background: none; border: 1px solid #e53935; color: #e53935; padding: 5px 12px; border-radius: 4px; font-size: 13px; cursor: pointer; transition: all .2s; }
.btn-delete-selected:hover { background: #e53935; color: #fff; }
.cart-item { display: flex; align-items: center; gap: 14px; padding: 16px 18px; border-bottom: 1px solid #f0f0f0; transition: background .15s; }
.cart-item:hover { background: #fafafa; }
.cart-item:last-child { border-bottom: none; }
.item-image img { width: 88px; height: 88px; object-fit: contain; border-radius: 6px; border: 1px solid #eee; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 14px; font-weight: 500; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-sku { font-size: 11px; color: #aaa; margin-bottom: 4px; }
.item-price { font-size: 14px; font-weight: 700; color: #e53935; }
.item-qty { display: flex; align-items: center; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
.qty-btn { width: 30px; height: 34px; background: #f5f5f5; border: none; font-size: 16px; cursor: pointer; color: #444; transition: background .15s; }
.qty-btn:hover:not(:disabled) { background: #e8f5e9; color: #2e7d32; }
.qty-btn:disabled { color: #ccc; cursor: not-allowed; }
.qty-input { width: 42px; height: 34px; text-align: center; border: none; border-left: 1px solid #ddd; border-right: 1px solid #ddd; font-size: 14px; outline: none; }
.item-total { min-width: 100px; text-align: right; font-size: 15px; font-weight: 700; color: #e53935; }
.btn-remove { background: none; border: none; color: #bbb; font-size: 16px; cursor: pointer; padding: 4px 6px; transition: color .15s; }
.btn-remove:hover { color: #e53935; }
.cart-summary { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; position: sticky; top: 80px; }
.cart-summary h3 { font-size: 16px; font-weight: 700; color: #1b5e20; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e8f5e9; }
.coupon-row { display: flex; gap: 8px; margin-bottom: 18px; }
.coupon-input { flex: 1; padding: 9px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; outline: none; transition: border .2s; }
.coupon-input:focus { border-color: #2e7d32; }
.btn-coupon { padding: 9px 14px; background: #2e7d32; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; white-space: nowrap; }
.btn-coupon:hover { background: #1b5e20; }
.summary-lines { margin-bottom: 20px; }
.summary-line { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; color: #444; }
.discount-label { color: #2e7d32; font-weight: 500; }
.discount-value { color: #2e7d32; font-weight: 500; }
.free-ship { color: #2e7d32; font-weight: 600; }
.summary-divider { border-top: 1px dashed #ddd; margin: 10px 0; }
.total-line { font-size: 15px; font-weight: 600; }
.total-price { font-size: 20px; font-weight: 700; color: #e53935; }
.btn-checkout { width: 100%; padding: 14px; background: #e53935; color: #fff; border: none; border-radius: 6px; font-size: 16px; font-weight: 700; cursor: pointer; margin-bottom: 10px; transition: background .2s; }
.btn-checkout:hover:not(:disabled) { background: #c62828; }
.btn-checkout:disabled { background: #ccc; cursor: not-allowed; }
.btn-continue-shop { display: block; width: 100%; padding: 11px; background: #fff; color: #2e7d32; border: 1.5px solid #2e7d32; border-radius: 6px; font-size: 14px; cursor: pointer; text-align: center; text-decoration: none; transition: all .2s; }
.btn-continue-shop:hover { background: #e8f5e9; }
@media (max-width: 768px) { .cart-layout { grid-template-columns: 1fr; } }
</style>