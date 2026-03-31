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
      <div class="success-icon">🎉</div>
      <h2>Đặt hàng thành công!</h2>
      <p>Mã đơn hàng: <strong>#{{ successOrderId }}</strong></p>
      <p class="success-sub">Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ xác nhận sớm nhất!</p>
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
              <input v-model="form.fullname" type="text" placeholder="Nguyễn Văn A"
                :class="{ 'input-error': errors.fullname }" @input="errors.fullname = ''" />
              <span v-if="errors.fullname" class="field-error">{{ errors.fullname }}</span>
            </div>
            <div class="form-group">
              <label>Email <span class="req">*</span></label>
              <input v-model="form.email" type="email" placeholder="example@gmail.com"
                :class="{ 'input-error': errors.email }" @input="errors.email = ''" />
              <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
            </div>
            <div class="form-group">
              <label>Số điện thoại <span class="req">*</span></label>
              <input v-model="form.phone" type="tel" placeholder="0901234567"
                :class="{ 'input-error': errors.phone }" @input="errors.phone = ''" />
              <span v-if="errors.phone" class="field-error">{{ errors.phone }}</span>
            </div>
            <div class="form-group full">
              <label>Địa chỉ nhận hàng <span class="req">*</span></label>
              <input v-model="form.address" type="text" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                :class="{ 'input-error': errors.address }" @input="errors.address = ''" />
              <span v-if="errors.address" class="field-error">{{ errors.address }}</span>
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

          <!-- Thông tin chuyển khoản (hiển thị khi chọn banking) -->
          <div v-if="form.payment === 'banking'" class="banking-info">
            <div class="banking-row"><span>Ngân hàng:</span><strong>Vietcombank</strong></div>
            <div class="banking-row"><span>Số tài khoản:</span><strong>1234567890</strong></div>
            <div class="banking-row"><span>Chủ tài khoản:</span><strong>CONG TY GREEN ELECTRIC</strong></div>
            <div class="banking-row"><span>Nội dung:</span><strong>DH{{ Date.now().toString().slice(-6) }}</strong></div>
            <p class="banking-note">⚠ Vui lòng ghi đúng nội dung chuyển khoản để đơn hàng được xử lý nhanh.</p>
          </div>
        </div>

      </div>

      <!-- Cột phải: Tóm tắt đơn hàng -->
      <div class="order-summary">
        <h3 class="section-title">Đơn hàng của bạn</h3>

        <!-- Loading giỏ hàng -->
        <div v-if="cartStore.loading" class="summary-loading">
          <div class="mini-spinner"></div>
          <span>Đang tải...</span>
        </div>

        <div v-else>
          <div class="order-items">
            <div v-for="item in checkoutItems" :key="item.id" class="order-item">
              <img :src="item.product?.image_url || 'https://placehold.co/60x60/e8f5e9/2e7d32?text=SP'"
                class="item-img"
                @error="(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/60x60/e8f5e9/2e7d32?text=SP')" />
              <div class="item-info">
                <p class="item-name">{{ item.product?.name || item.product_sku_code }}</p>
                <p class="item-sku">SKU: {{ item.product_sku_code }}</p>
              </div>
              <div class="item-right">
                <span class="item-qty">x{{ item.quantity }}</span>
                <span class="item-price">{{ fmt((item.product?.price ?? 0) * item.quantity) }}đ</span>
              </div>
            </div>

            <!-- Giỏ trống -->
            <div v-if="checkoutItems.length === 0" class="empty-items">
              <p>Không có sản phẩm nào.</p>
              <router-link to="/">Tiếp tục mua sắm</router-link>
            </div>
          </div>

          <!-- Coupon -->
          <div class="coupon-row">
            <input v-model="couponCode" type="text" placeholder="Mã giảm giá..." class="coupon-input"
              :disabled="couponOk" />
            <button class="btn-coupon" @click="applyCoupon" :disabled="couponOk">
              {{ couponOk ? 'Đã áp dụng' : 'Áp dụng' }}
            </button>
          </div>
          <p v-if="couponMsg" :class="['coupon-msg', couponOk ? 'ok' : 'err']">{{ couponMsg }}</p>

          <!-- Tổng tiền -->
          <div class="summary-lines">
            <div class="summary-line">
              <span>Tạm tính ({{ checkoutItems.length }} sản phẩm):</span>
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

          <!-- Lỗi -->
          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <!-- Nút đặt hàng -->
          <button class="btn-place-order" :disabled="loading || checkoutItems.length === 0" @click="placeOrder">
            <span v-if="loading" class="spinner"></span>
            <span v-else>🛍 Đặt hàng ngay</span>
          </button>
          <router-link to="/cart" class="btn-back-cart">← Quay lại giỏ hàng</router-link>
        </div>
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

const loading        = ref(false)
const errorMsg       = ref('')
const orderSuccess   = ref(false)
const successOrderId = ref(0)
const couponCode     = ref('')
const couponMsg      = ref('')
const couponOk       = ref(false)
const discount       = ref(0)

// Validation errors per field
const errors = ref({
  fullname: '',
  email:    '',
  phone:    '',
  address:  '',
})

/* ── Items được chọn từ cart ─────────────────────────────────── */
const selectedIds = computed(() => {
  const q = route.query.ids
  if (!q) return cartStore.items.map((i: any) => i.id)
  return String(q).split(',').map(Number)
})

const checkoutItems = computed(() =>
  cartStore.items.filter((i: any) => selectedIds.value.includes(i.id))
)

/* ── Tính tiền ───────────────────────────────────────────────── */
const subtotal    = computed(() =>
  checkoutItems.value.reduce((s: number, i: any) => s + (i.product?.price ?? 0) * i.quantity, 0)
)
const shippingFee = computed(() => subtotal.value >= 5_000_000 ? 0 : 30_000)
const total       = computed(() => subtotal.value - discount.value + shippingFee.value)

/* ── Form ────────────────────────────────────────────────────── */
const form = ref({
  fullname: authStore.user?.fullname || '',
  email:    authStore.user?.email    || '',
  phone:    authStore.user?.phone    || '',
  address:  authStore.user?.address  || '',
  note:     '',
  payment:  'cod',
})

const paymentOptions = [
  { value: 'cod',     icon: '💵', name: 'Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt khi nhận được hàng' },
  { value: 'banking', icon: '🏦', name: 'Chuyển khoản ngân hàng',          desc: 'Chuyển khoản trước khi giao hàng' },
  { value: 'momo',    icon: '💜', name: 'Ví MoMo',                          desc: 'Thanh toán qua ví MoMo' },
  { value: 'vnpay',   icon: '💳', name: 'VNPay / Thẻ ATM',                  desc: 'Thanh toán qua VNPay, thẻ nội địa' },
]

const fmt = (v: number) => v.toLocaleString('vi-VN')

/* ── Coupon ──────────────────────────────────────────────────── */
function applyCoupon() {
  const code = couponCode.value.trim().toUpperCase()
  if (!code) return
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

/* ── Validate ────────────────────────────────────────────────── */
function validate(): boolean {
  let ok = true
  const f = form.value

  if (!f.fullname.trim()) {
    errors.value.fullname = 'Vui lòng nhập họ và tên'
    ok = false
  }
  if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) {
    errors.value.email = 'Vui lòng nhập email hợp lệ'
    ok = false
  }
  if (!f.phone.trim() || !/^[0-9]{9,11}$/.test(f.phone.replace(/\s/g, ''))) {
    errors.value.phone = 'Vui lòng nhập số điện thoại hợp lệ (9–11 chữ số)'
    ok = false
  }
  if (!f.address.trim()) {
    errors.value.address = 'Vui lòng nhập địa chỉ giao hàng'
    ok = false
  }

  return ok
}

/* ── Đặt hàng ────────────────────────────────────────────────── */
async function placeOrder() {
  errorMsg.value = ''
  errors.value   = { fullname: '', email: '', phone: '', address: '' }

  if (!validate()) return

  if (checkoutItems.value.length === 0) {
    errorMsg.value = 'Không có sản phẩm nào để đặt hàng!'
    return
  }

  loading.value = true
  try {
    const order = await orderStore.checkout({
      email:       form.value.email,
      phone:       form.value.phone,
      address:     form.value.address,
      payment:     form.value.payment,
      coupon_code: couponCode.value || undefined,
      items: checkoutItems.value.map((i: any) => ({
        product_sku_code: i.product_sku_code,
        quantity:         i.quantity,
      })),
    })

    // Xóa các items đã đặt khỏi giỏ hàng
    for (const id of [...selectedIds.value]) {
      await cartStore.removeItem(id)
    }

    successOrderId.value = order.id
    orderSuccess.value   = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: any) {
    if (e.errors) {
      // Laravel validation errors
      const errs = e.errors
      if (errs.email)   errors.value.email   = errs.email[0]
      if (errs.phone)   errors.value.phone   = errs.phone[0]
      if (errs.address) errors.value.address = errs.address[0]
    }
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
.success-sub { color: #888; font-size: 13px; margin-bottom: 24px !important; }
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
.input-error { border-color: #e53935 !important; }
.field-error { font-size: 12px; color: #e53935; margin-top: 2px; }

/* Payment */
.payment-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
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

/* Banking info */
.banking-info {
  background: #fffde7; border: 1px solid #fff176;
  border-radius: 8px; padding: 16px;
  margin-top: 12px;
}
.banking-row { display: flex; gap: 12px; font-size: 13px; margin-bottom: 6px; }
.banking-row span { color: #888; min-width: 130px; }
.banking-row strong { color: #222; }
.banking-note { font-size: 12px; color: #e65100; margin-top: 10px; font-weight: 500; }

/* Summary */
.order-summary { background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 22px; position: sticky; top: 80px; }
.summary-loading { display: flex; align-items: center; gap: 10px; padding: 20px 0; color: #888; font-size: 14px; }
.mini-spinner { width: 20px; height: 20px; border: 2px solid #e0e0e0; border-top-color: #2e7d32; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.order-items { margin-bottom: 16px; max-height: 300px; overflow-y: auto; }
.order-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
.order-item:last-child { border-bottom: none; }
.item-img { width: 56px; height: 56px; object-fit: contain; border-radius: 6px; border: 1px solid #eee; flex-shrink: 0; }
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-sku  { font-size: 11px; color: #aaa; margin-top: 2px; }
.item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
.item-qty   { font-size: 12px; color: #888; }
.item-price { font-size: 13px; font-weight: 700; color: #e53935; }
.empty-items { text-align: center; padding: 24px; color: #888; font-size: 14px; }
.empty-items a { color: #2e7d32; font-weight: 600; }

.coupon-row { display: flex; gap: 8px; margin-bottom: 8px; }
.coupon-input { flex: 1; padding: 9px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; outline: none; transition: border .2s; }
.coupon-input:focus { border-color: #2e7d32; }
.coupon-input:disabled { background: #f5f5f5; }
.btn-coupon { padding: 9px 14px; background: #2e7d32; color: #fff; border: none; border-radius: 4px; font-size: 13px; cursor: pointer; white-space: nowrap; }
.btn-coupon:hover:not(:disabled) { background: #1b5e20; }
.btn-coupon:disabled { background: #a5d6a7; cursor: default; }
.coupon-msg { font-size: 12px; margin-bottom: 12px; }
.coupon-msg.ok  { color: #2e7d32; }
.coupon-msg.err { color: #e53935; }

.summary-lines { margin-bottom: 20px; }
.summary-line { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; color: #444; }
.green { color: #2e7d32; font-weight: 500; }
.divider { border-top: 1px dashed #ddd; margin: 10px 0; }
.total-line { font-weight: 700; font-size: 15px; }
.total-price { color: #e53935; font-size: 18px; font-weight: 800; }

.error-msg { font-size: 13px; color: #e53935; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px; }

.btn-place-order {
  width: 100%; padding: 15px;
  background: linear-gradient(135deg, #1b5e20, #2e7d32);
  color: #fff; border: none; border-radius: 8px;
  font-size: 15px; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all .2s;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(27,94,32,.3);
}
.btn-place-order:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(27,94,32,.4); }
.btn-place-order:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

.btn-back-cart {
  display: block; text-align: center;
  color: #2e7d32; font-size: 13px; font-weight: 500;
  text-decoration: none;
  padding: 8px;
}
.btn-back-cart:hover { text-decoration: underline; }

@media (max-width: 860px) {
  .checkout-layout { grid-template-columns: 1fr; }
  .order-summary { position: static; }
  .form-grid { grid-template-columns: 1fr; }
  .form-group.full { grid-column: 1; }
}
</style>