<template>
  <div class="checkout-page">
    <div class="breadcrumb">
      <router-link to="/">Trang chủ</router-link>
      <span class="sep">›</span>
      <router-link to="/cart">Giỏ hàng</router-link>
      <span class="sep">›</span>
      <span class="active">Thanh toán</span>
    </div>

    <h1 class="page-title">Thanh toán</h1>

    <!-- Đặt hàng thành công -->
    <div v-if="orderSuccess" class="success-box">
      <div class="success-icon"></div>
      <h2>Đặt hàng thành công!</h2>
      <p>Mã đơn hàng: <strong>#{{ successOrderId }}</strong></p>
      <p class="success-sub">Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ sớm nhất.</p>
      <div class="success-actions">
        <router-link to="/order-history" class="btn-orders">Xem đơn hàng</router-link>
        <router-link to="/" class="btn-home">Về trang chủ</router-link>
      </div>
    </div>

    <div v-else class="checkout-layout">
      <!-- Cột trái: Form thông tin -->
      <div class="checkout-form-wrap">

        <!-- Thông tin giao hàng -->
        <div class="form-section">
          <h3 class="section-title">Thông tin giao hàng</h3>
          <div class="form-grid">
            <div class="form-group full">
              <label>Họ và tên <span class="req">*</span></label>
              <input v-model="form.fullname" type="text" placeholder="Nguyễn Văn A" />
            </div>
            <div class="form-group">
              <label>Email <span class="req">*</span></label>
              <input v-model="form.email" type="email" placeholder="example@gmail.com" />
            </div>
            <div class="form-group">
              <label>Số điện thoại <span class="req">*</span></label>
              <input v-model="form.phone" type="tel" placeholder="0901234567" />
            </div>
            <div class="form-group full">
              <label>Địa chỉ nhận hàng <span class="req">*</span></label>
              <input v-model="form.address" type="text" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" />
            </div>
            <div class="form-group full">
              <label>Ghi chú đơn hàng</label>
              <textarea v-model="form.note" rows="3" placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)..."></textarea>
            </div>
          </div>
        </div>

        <!-- Phương thức thanh toán -->
        <div class="form-section">
          <h3 class="section-title">Phương thức thanh toán</h3>
          <div class="payment-options">
            <label v-for="opt in paymentOptions" :key="opt.value"
              :class="['payment-opt', { active: form.payment === opt.value }]">
              <input type="radio" v-model="form.payment" :value="opt.value" hidden />
              <span class="opt-icon">{{ opt.icon }}</span>
              <div>
                <p class="opt-name">{{ opt.name }}</p>
                <p class="opt-desc">{{ opt.desc }}</p>
              </div>
              <span class="opt-check" v-if="form.payment === opt.value">✓</span>
            </label>
          </div>
        </div>

      </div>

      <!-- Cột phải: Tóm tắt đơn hàng -->
      <div class="order-summary">
        <h3 class="section-title">Đơn hàng của bạn</h3>

        <div class="order-items">
          <div v-for="item in checkoutItems" :key="item.id" class="order-item">
            <img :src="item.product?.image_url || 'https://placehold.co/60x60/e8f5e9/2e7d32?text=SP'"
              class="item-img" />
            <div class="item-info">
              <p class="item-name">{{ item.product?.name || item.product_sku_code }}</p>
              <p class="item-sku">SKU: {{ item.product_sku_code }}</p>
            </div>
            <div class="item-right">
              <span class="item-qty">x{{ item.quantity }}</span>
              <span class="item-price">{{ fmt((item.product?.price ?? 0) * item.quantity) }}đ</span>
            </div>
          </div>
        </div>

        <div class="coupon-row">
          <input v-model="couponCode" type="text" placeholder="Mã giảm giá..." class="coupon-input" />
          <button class="btn-coupon" @click="applyCoupon">Áp dụng</button>
        </div>
        <p v-if="couponMsg" :class="['coupon-msg', couponOk ? 'ok' : 'err']">{{ couponMsg }}</p>

        <div class="summary-lines">
          <div class="summary-line">
            <span>Tạm tính:</span>
            <span>{{ fmt(subtotal) }}đ</span>
          </div>
          <div class="summary-line" v-if="discount > 0">
            <span class="green">Giảm giá:</span>
            <span class="green">-{{ fmt(discount) }}đ</span>
          </div>
          <div class="summary-line">
            <span>Phí vận chuyển:</span>
            <span :class="shippingFee === 0 ? 'green' : ''">
              {{ shippingFee === 0 ? 'Miễn phí' : fmt(shippingFee) + 'đ' }}
            </span>
          </div>
          <div class="divider"></div>
          <div class="summary-line total-line">
            <span>Tổng cộng:</span>
            <span class="total-price">{{ fmt(total) }}đ</span>
          </div>
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button class="btn-place-order" :disabled="loading" @click="placeOrder">
          <span v-if="loading" class="spinner"></span>
          <span v-else>🛍 Đặt hàng ngay</span>
        </button>
        <router-link to="/cart" class="btn-back-cart">← Quay lại giỏ hàng</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/user/stores/cartStore'
import { useAuthStore } from '@/user/stores/authStore'
import { useOrderStore } from '@/user/stores/orderStore'

const route      = useRoute()
const cartStore  = useCartStore()
const authStore  = useAuthStore()
const orderStore = useOrderStore()

const loading      = ref(false)
const errorMsg     = ref('')
const orderSuccess = ref(false)
const successOrderId = ref(0)
const couponCode   = ref('')
const couponMsg    = ref('')
const couponOk     = ref(false)
const discount     = ref(0)

// Lấy items được chọn từ query, hoặc tất cả nếu không có
const selectedIds = computed(() => {
  const q = route.query.ids
  if (!q) return cartStore.items.map(i => i.id)
  return String(q).split(',').map(Number)
})
const checkoutItems = computed(() =>
  cartStore.items.filter(i => selectedIds.value.includes(i.id))
)

const subtotal    = computed(() =>
  checkoutItems.value.reduce((s, i) => s + (i.product?.price ?? 0) * i.quantity, 0)
)
const shippingFee = computed(() => subtotal.value >= 5_000_000 ? 0 : 30_000)
const total       = computed(() => subtotal.value - discount.value + shippingFee.value)

const form = ref({
  fullname: authStore.user?.fullname || '',
  email:    authStore.user?.email    || '',
  phone:    authStore.user?.phone    || '',
  address:  authStore.user?.address  || '',
  note:     '',
  payment:  'cod',
})

const paymentOptions = [
  { value: 'cod',      icon: '', name: 'Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt khi nhận được hàng' },
  { value: 'banking',  icon: '', name: 'Chuyển khoản ngân hàng',          desc: 'Chuyển khoản trước khi giao hàng' },
  { value: 'momo',     icon: '', name: 'Ví MoMo',                          desc: 'Thanh toán qua ví MoMo' },
  { value: 'vnpay',    icon: '', name: 'VNPay / Thẻ ATM',                  desc: 'Thanh toán qua VNPay, thẻ nội địa' },
]

const fmt = (v: number) => v.toLocaleString('vi-VN')

function applyCoupon() {
  const code = couponCode.value.trim().toUpperCase()
  if (code === 'GIAM10') {
    discount.value = Math.round(subtotal.value * 0.1)
    couponMsg.value = `Áp dụng thành công! Giảm ${fmt(discount.value)}đ`
    couponOk.value = true
  } else if (code === 'FREESHIP') {
    discount.value = shippingFee.value
    couponMsg.value = 'Miễn phí vận chuyển!'
    couponOk.value = true
  } else {
    discount.value = 0
    couponMsg.value = 'Mã giảm giá không hợp lệ'
    couponOk.value = false
  }
}

async function placeOrder() {
  errorMsg.value = ''
  const { fullname, email, phone, address, payment } = form.value
  if (!fullname || !email || !phone || !address) {
    errorMsg.value = 'Vui lòng điền đầy đủ thông tin giao hàng!'
    return
  }
  if (checkoutItems.value.length === 0) {
    errorMsg.value = 'Không có sản phẩm nào để đặt hàng!'
    return
  }

  loading.value = true
  try {
    const order = await orderStore.checkout({
      email, phone, address, payment,
      coupon_code: couponCode.value || undefined,
      items: checkoutItems.value.map(i => ({
        product_sku_code: i.product_sku_code,
        quantity: i.quantity,
      })),
    })
    // Xoá các items đã đặt khỏi giỏ
    for (const id of selectedIds.value) await cartStore.removeItem(id)
    successOrderId.value = order.id
    orderSuccess.value   = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: any) {
    errorMsg.value = e.userMessage || 'Đặt hàng thất bại, vui lòng thử lại!'
  } finally {
    loading.value = false
  }
}

onMounted(() => cartStore.fetchCart())
</script>

<style scoped>
.checkout-page { max-width: 1200px; margin: 0 auto; padding: 20px 16px 60px; font-family: 'Segoe UI', sans-serif; color: #222; }
.breadcrumb { font-size: 13px; color: #888; margin-bottom: 12px; }
.breadcrumb a { color: #2e7d32; text-decoration: none; }
.breadcrumb .sep { margin: 0 6px; }
.breadcrumb .active { color: #2e7d32; font-weight: 500; }
.page-title { font-size: 22px; font-weight: 700; color: #1b5e20; margin-bottom: 24px; }

/* Success */
.success-box { text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; border: 1px solid #c8e6c9; max-width: 480px; margin: 40px auto; }
.success-icon { font-size: 72px; margin-bottom: 16px; }
.success-box h2 { font-size: 24px; font-weight: 700; color: #1b5e20; margin-bottom: 8px; }
.success-box p { font-size: 15px; color: #444; margin-bottom: 4px; }
.success-sub { color: #888; font-size: 13px; margin-bottom: 24px; }
.success-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-orders { padding: 12px 24px; background: #2e7d32; color: #fff; border-radius: 6px; text-decoration: none; font-weight: 600; }
.btn-home   { padding: 12px 24px; background: #fff; color: #2e7d32; border: 1.5px solid #2e7d32; border-radius: 6px; text-decoration: none; font-weight: 600; }

/* Layout */
.checkout-layout { display: grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: start; }

/* Form */
.checkout-form-wrap { display: flex; flex-direction: column; gap: 20px; }
.form-section { background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 22px 24px; }
.section-title { font-size: 15px; font-weight: 700; color: #1b5e20; margin-bottom: 18px; padding-bottom: 10px; border-bottom: 2px solid #e8f5e9; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { font-size: 13px; font-weight: 600; color: #444; }
.req { color: #e53935; }
.form-group input, .form-group textarea {
  padding: 10px 12px; border: 1.5px solid #e0e0e0; border-radius: 6px;
  font-size: 14px; outline: none; transition: border .2s;
  font-family: inherit; resize: vertical;
}
.form-group input:focus, .form-group textarea:focus { border-color: #2e7d32; box-shadow: 0 0 0 3px rgba(46,125,50,.08); }

/* Payment */
.payment-options { display: flex; flex-direction: column; gap: 10px; }
.payment-opt {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; border: 1.5px solid #e0e0e0; border-radius: 8px;
  cursor: pointer; transition: all .2s; position: relative;
}
.payment-opt.active { border-color: #2e7d32; background: #f1f8e9; }
.opt-icon { font-size: 22px; }
.opt-name { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.opt-desc { font-size: 12px; color: #888; }
.opt-check { margin-left: auto; color: #2e7d32; font-weight: 700; font-size: 16px; }

/* Summary */
.order-summary { background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 22px; position: sticky; top: 80px; }
.order-items { margin-bottom: 16px; max-height: 300px; overflow-y: auto; }
.order-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.order-item:last-child { border-bottom: none; }
.item-img { width: 56px; height: 56px; object-fit: contain; border-radius: 6px; border: 1px solid #eee; flex-shrink: 0; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-sku { font-size: 11px; color: #aaa; margin-top: 2px; }
.item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.item-qty { font-size: 12px; color: #888; }
.item-price { font-size: 13px; font-weight: 700; color: #e53935; }

.coupon-row { display: flex; gap: 8px; margin-bottom: 6px; }
.coupon-input { flex: 1; padding: 8px 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; outline: none; }
.coupon-input:focus { border-color: #2e7d32; }
.btn-coupon { padding: 8px 12px; background: #2e7d32; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; white-space: nowrap; }
.coupon-msg { font-size: 12px; margin-bottom: 12px; }
.coupon-msg.ok  { color: #2e7d32; }
.coupon-msg.err { color: #e53935; }

.summary-lines { margin: 16px 0; }
.summary-line { display: flex; justify-content: space-between; font-size: 14px; padding: 5px 0; color: #444; }
.green { color: #2e7d32; font-weight: 500; }
.divider { border-top: 1px dashed #ddd; margin: 10px 0; }
.total-line { font-size: 15px; font-weight: 600; }
.total-price { font-size: 22px; font-weight: 800; color: #e53935; }

.error-msg { color: #e53935; font-size: 13px; margin-bottom: 10px; text-align: center; }
.btn-place-order {
  width: 100%; padding: 14px; background: #e53935; color: #fff;
  border: none; border-radius: 6px; font-size: 16px; font-weight: 700;
  cursor: pointer; margin-bottom: 10px; transition: background .2s;
  display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 50px;
}
.btn-place-order:hover:not(:disabled) { background: #c62828; }
.btn-place-order:disabled { background: #ccc; cursor: not-allowed; }
.btn-back-cart { display: block; text-align: center; font-size: 13px; color: #2e7d32; text-decoration: none; padding: 8px; }
.btn-back-cart:hover { text-decoration: underline; }
.spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) { .checkout-layout { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } }
</style>