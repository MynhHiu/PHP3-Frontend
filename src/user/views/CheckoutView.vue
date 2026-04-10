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
      <p class="success-sub">Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ xác nhận sớm nhất!</p>
      <p class="email-notice">Email xác nhận đã được gửi tới <strong>{{ form.email }}</strong></p>
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

            <!-- ════ ĐỊA CHỈ NHẬN HÀNG dạng option ════ -->
            <div class="form-group full">
              <label>Địa chỉ nhận hàng <span class="req">*</span></label>

              <!-- Đang tải địa chỉ -->
              <div v-if="addrLoading" class="addr-loading">
                <div class="mini-spinner"></div> Đang tải địa chỉ...
              </div>

              <!-- Có địa chỉ đã lưu → hiện dạng select dropdown -->
              <div v-else-if="authStore.isLoggedIn && savedAddresses.length > 0" class="addr-select-wrap">
                <div class="addr-select-box">
                  <select
                    class="addr-select"
                    :class="{ 'input-error': errors.address }"
                    :value="selectedAddressId === null ? '__manual__' : selectedAddressId"
                    @change="onSelectChange(($event.target as HTMLSelectElement).value)"
                  >
                    <option
                      v-for="addr in savedAddresses"
                      :key="addr.id"
                      :value="addr.id"
                    >
                      {{ addr.receiver_name }} | {{ addr.phone }}{{ addr.is_default ? ' Mặc định' : '' }} — {{ addr.detail_address }}, {{ addr.ward }}, {{ addr.district }}, {{ addr.province }}
                    </option>
                    <option value="__manual__">Nhập địa chỉ khác...</option>
                  </select>
                  <span class="select-arrow">▾</span>
                </div>

                <!-- Preview địa chỉ đã chọn -->
                <div v-if="selectedAddressId !== null && selectedAddress" class="addr-preview">
                  <span class="addr-preview-icon"></span>
                  <div class="addr-preview-text">
                    <strong>{{ selectedAddress.receiver_name }}</strong>
                    <span class="addr-preview-sep">|</span>
                    <span>{{ selectedAddress.phone }}</span>
                    <span v-if="selectedAddress.is_default" class="default-badge">Mặc định</span>
                    <p>{{ selectedAddress.detail_address }}, {{ selectedAddress.ward }}, {{ selectedAddress.district }}, {{ selectedAddress.province }}</p>
                  </div>
                </div>

                <!-- Input nhập tay khi chọn "địa chỉ khác" -->
                <div v-if="selectedAddressId === null" class="manual-addr-wrap">
                  <input v-model="form.address" type="text"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                    :class="{ 'input-error': errors.address }" @input="errors.address = ''" />
                </div>

                <!-- Link thêm địa chỉ -->
                <router-link to="/profile?tab=address" class="link-add-addr-inline" target="_blank">
                  + Quản lý địa chỉ giao hàng
                </router-link>
              </div>

              <!-- Chưa có địa chỉ lưu / chưa đăng nhập → nhập tay -->
              <div v-else>
                <input v-model="form.address" type="text"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  :class="{ 'input-error': errors.address }" @input="errors.address = ''" />
                <router-link v-if="authStore.isLoggedIn" to="/profile?tab=address"
                  class="link-add-addr-inline" target="_blank" style="margin-top:8px">
                  + Thêm địa chỉ giao hàng đã lưu
                </router-link>
              </div>

              <span v-if="errors.address" class="field-error">{{ errors.address }}</span>
            </div>
            <!-- ════════════════════════════════════════ -->

            <div class="form-group full">
              <label>Ghi chú đơn hàng</label>
              <textarea v-model="form.note" rows="3"
                placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)..."></textarea>
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
              <span class="opt-check" v-if="form.payment === opt.value"></span>
            </label>
          </div>

          <div v-if="form.payment === 'banking'" class="banking-info">
            <div class="banking-row"><span>Ngân hàng:</span><strong>Vietcombank</strong></div>
            <div class="banking-row"><span>Số tài khoản:</span><strong>1234567890</strong></div>
            <div class="banking-row"><span>Chủ tài khoản:</span><strong>CONG TY GREEN ELECTRIC</strong></div>
            <div class="banking-row"><span>Nội dung:</span><strong>DH{{ Date.now().toString().slice(-6) }}</strong></div>
            <p class="banking-note">Vui lòng ghi đúng nội dung chuyển khoản để đơn hàng được xử lý nhanh.</p>
          </div>
        </div>

      </div>

      <!-- Cột phải: Tóm tắt đơn hàng -->
      <div class="order-summary">
        <h3 class="section-title">Đơn hàng của bạn</h3>

        <div v-if="cartStore.loading" class="summary-loading">
          <div class="mini-spinner"></div>
          <span>Đang tải...</span>
        </div>

        <div v-else>
          <div class="order-items">
            <div v-for="item in checkoutItems" :key="item.id" class="order-item">
              <img :src="item.image_url || 'https://placehold.co/60x60/e8f5e9/2e7d32?text=SP'" class="item-img"
                @error="(e) => ((e.target as HTMLImageElement).src = 'https://placehold.co/60x60/e8f5e9/2e7d32?text=SP')" />
              <div class="item-info">
                <p class="item-name">{{ item.product?.name || item.product_sku_code }}</p>
                <p class="item-sku">SKU: {{ item.product_sku_code }}</p>
              </div>
              <div class="item-right">
                <span class="item-qty">x{{ item.quantity }}</span>
                <span class="item-price">{{ fmt((item.price ?? 0) * item.quantity) }}đ</span>
              </div>
            </div>

            <div v-if="checkoutItems.length === 0" class="empty-items">
              <p>Không có sản phẩm nào.</p>
              <router-link to="/">Tiếp tục mua sắm</router-link>
            </div>
          </div>

          <!-- Coupon -->
          <div class="coupon-section">
            <div class="coupon-row">
              <input v-model="couponCode" type="text" placeholder="Nhập mã giảm giá..." class="coupon-input"
                :disabled="couponOk" @input="couponCode = couponCode.toUpperCase()" />
              <button class="btn-coupon" @click="applyCoupon" :disabled="couponOk || couponApplying">
                {{ couponOk ? 'Đã áp dụng' : couponApplying ? 'Đang kiểm tra...' : 'Áp dụng' }}
              </button>
            </div>
            <p v-if="couponMsg" :class="['coupon-msg', couponOk ? 'ok' : 'err']">{{ couponMsg }}</p>

            <div v-if="savedCoupons.length > 0" class="saved-coupons">
              <button class="saved-toggle" @click="showSavedList = !showSavedList">
                Mã đã lưu của bạn ({{ savedCoupons.filter((c: any) => c.status === 'active').length }} dùng được)
                <span class="toggle-arrow" :class="{ open: showSavedList }">▾</span>
              </button>
              <div v-if="showSavedList" class="saved-list">
                <div v-for="c in savedCoupons" :key="(c as any).coupon_code"
                  :class="['saved-item', (c as any).status, { selected: couponCode === (c as any).coupon_code && couponOk }]">
                  <div class="saved-left">
                    <span class="saved-code">{{ (c as any).coupon_code }}</span>
                    <span v-if="(c as any).minordervalue > 0" class="saved-min">
                      Đơn tối thiểu {{ Number((c as any).minordervalue).toLocaleString('vi-VN') }}₫
                    </span>
                  </div>
                  <div class="saved-right">
                    <span class="saved-discount">{{ (c as any).discount_display }}</span>
                    <button v-if="(c as any).status === 'active'" class="btn-select-coupon"
                      :class="{ 'is-selected': couponCode === (c as any).coupon_code && couponOk }"
                      :disabled="couponOk && couponCode !== (c as any).coupon_code"
                      @click="selectSavedCoupon(c)">
                      {{ couponCode === (c as any).coupon_code && couponOk ? 'Đang dùng' : 'Chọn' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

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

          <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <button class="btn-place-order" :disabled="loading || checkoutItems.length === 0" @click="placeOrder">
            <span v-if="loading" class="spinner"></span>
            <span v-else-if="form.payment === 'vnpay'">Thanh toán qua VNPay</span>
            <span v-else>Đặt hàng ngay</span>
          </button>
          <router-link to="/cart" class="btn-back-cart">← Quay lại giỏ hàng</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/user/stores/cartStore'
import { useAuthStore } from '@/user/stores/authStore'
import { useOrderStore } from '@/user/stores/orderStore'
import api, { couponApi } from '@/api'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ShippingAddress {
  id: number
  user_id: number
  receiver_name: string
  phone: string
  province: string
  district: string
  ward: string
  detail_address: string
  is_default: boolean
}

// ─── Stores ───────────────────────────────────────────────────────────────────
const route = useRoute()
const cartStore = useCartStore()
const authStore = useAuthStore()
const orderStore = useOrderStore()

// ─── State ────────────────────────────────────────────────────────────────────
const loading = ref(false)
const errorMsg = ref('')
const orderSuccess = ref(false)
const successOrderId = ref(0)
const couponCode = ref('')
const couponMsg = ref('')
const couponOk = ref(false)
const discount = ref(0)

const errors = ref({ fullname: '', email: '', phone: '', address: '' })

// ─── Địa chỉ giao hàng đã lưu ────────────────────────────────────────────────
const savedAddresses = ref<ShippingAddress[]>([])
const addrLoading = ref(false)
const selectedAddressId = ref<number | null>(null)

const selectedAddress = computed(() =>
  savedAddresses.value.find(a => a.id === selectedAddressId.value) ?? null
)

async function fetchSavedAddresses() {
  if (!authStore.isLoggedIn) return
  addrLoading.value = true
  try {
    const res = await api.get('/profile/addresses')
    savedAddresses.value = res.data.data ?? []

    // Tự động chọn địa chỉ mặc định; nếu không có → chọn địa chỉ đầu tiên
    const defaultAddr = savedAddresses.value.find(a => a.is_default)
    const firstAddr   = savedAddresses.value[0]
    if (defaultAddr) {
      selectAddress(defaultAddr)
    } else if (firstAddr) {
      selectAddress(firstAddr)
    }
  } catch {
    savedAddresses.value = []
  } finally {
    addrLoading.value = false
  }
}

function selectAddress(addr: ShippingAddress) {
  selectedAddressId.value = addr.id
  // Điền thông tin vào form từ địa chỉ đã chọn
  form.value.fullname = addr.receiver_name
  form.value.phone    = addr.phone
  form.value.address  = [addr.detail_address, addr.ward, addr.district, addr.province]
    .filter(Boolean).join(', ')
  // Xóa lỗi nếu có
  errors.value.fullname = ''
  errors.value.phone    = ''
  errors.value.address  = ''
}

function selectManual() {
  selectedAddressId.value = null
  form.value.address = ''
  errors.value.address = ''
}

function onSelectChange(value: string) {
  if (value === '__manual__') {
    selectManual()
  } else {
    const addr = savedAddresses.value.find(a => a.id === Number(value))
    if (addr) selectAddress(addr)
  }
}

// ─── Items được chọn từ cart ──────────────────────────────────────────────────
const selectedIds = computed(() => {
  const q = route.query.ids
  if (!q) return cartStore.items.map((i: any) => i.id)
  return String(q).split(',').map(Number)
})

const checkoutItems = computed(() =>
  cartStore.items.filter((i: any) => selectedIds.value.includes(i.id))
)

// ─── Tính tiền ────────────────────────────────────────────────────────────────
const subtotal = computed(() =>
  checkoutItems.value.reduce((s: number, i: any) => s + (i['price'] ?? 0) * i.quantity, 0)
)
const shippingFee = computed(() => subtotal.value >= 5_000_000 ? 0 : 30_000)
const total = computed(() => subtotal.value - discount.value + shippingFee.value)

// ─── Form ─────────────────────────────────────────────────────────────────────
const form = ref({
  fullname: authStore.user?.fullname || '',
  email:    authStore.user?.email    || '',
  phone:    authStore.user?.phone    || '',
  address:  authStore.user?.address  || '',
  note:     '',
  payment:  'cod',
})

// Tự động điền khi user data load xong (ví dụ sau refresh trang)
watch(() => authStore.user, (u) => {
  if (!u) return
  if (!form.value.fullname) form.value.fullname = u.fullname || ''
  if (!form.value.email)    form.value.email    = u.email    || ''
  if (!form.value.phone)    form.value.phone    = u.phone    || ''
  if (!form.value.address)  form.value.address  = u.address  || ''
}, { immediate: true })

const paymentOptions = [
  { value: 'cod',     icon: '', name: 'Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt khi nhận được hàng' },
  { value: 'banking', icon: '', name: 'Chuyển khoản ngân hàng',          desc: 'Chuyển khoản trước khi giao hàng' },
  { value: 'momo',    icon: '', name: 'Ví MoMo',                          desc: 'Thanh toán qua ví MoMo' },
  { value: 'vnpay',   icon: '', name: 'VNPay / Thẻ ATM',                  desc: 'Thanh toán qua VNPay, thẻ nội địa' },
]

const fmt = (v: number) => v.toLocaleString('vi-VN')

// ─── Coupon ───────────────────────────────────────────────────────────────────
const couponApplying = ref(false)

async function applyCoupon() {
  const code = couponCode.value.trim().toUpperCase()
  if (!code || couponApplying.value) return
  couponApplying.value = true
  couponMsg.value = ''
  try {
    const res = await couponApi.apply(code, subtotal.value)
    discount.value = res.data.discount
    couponMsg.value = `Áp dụng thành công! Giảm ${fmt(res.data.discount)}đ`
    couponOk.value = true
  } catch (e: any) {
    discount.value = 0
    couponMsg.value = e.userMessage || 'Mã giảm giá không hợp lệ'
    couponOk.value = false
  } finally {
    couponApplying.value = false
  }
}

const savedCoupons = ref<any[]>([])
const showSavedList = ref(false)

async function fetchSavedCoupons() {
  try {
    const res = await api.get('/user/my-coupons')
    savedCoupons.value = res.data
  } catch {
    savedCoupons.value = []
  }
}

function selectSavedCoupon(c: any) {
  couponCode.value = c.coupon_code
  couponMsg.value = ''
  couponOk.value = false
  showSavedList.value = false
}

// ─── Validate ─────────────────────────────────────────────────────────────────
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

// ─── Đặt hàng ─────────────────────────────────────────────────────────────────
async function placeOrder() {
  errorMsg.value = ''
  errors.value = { fullname: '', email: '', phone: '', address: '' }

  if (!validate()) return

  if (checkoutItems.value.length === 0) {
    errorMsg.value = 'Không có sản phẩm nào để đặt hàng!'
    return
  }

  loading.value = true
  try {
    const payload = {
      email:       form.value.email,
      phone:       form.value.phone,
      address:     form.value.address,
      payment:     form.value.payment,
      coupon_code: couponCode.value || undefined,
      items: checkoutItems.value.map((i: any) => ({
        product_sku_code: i.product_sku_code,
        quantity: i.quantity,
      })),
    }

    // VNPay: tạo đơn rồi redirect sang cổng thanh toán
    if (form.value.payment === 'vnpay') {
      sessionStorage.setItem('vnpay_checkout_ids', JSON.stringify(selectedIds.value))
      import('@/api').then(async ({ default: api }) => {
        const res = await api.post('/vnpay/create-payment', payload)
        window.location.href = res.data.payment_url
      }).catch((e: any) => {
        errorMsg.value = e.userMessage || 'Không thể tạo liên kết VNPay, vui lòng thử lại!'
        loading.value = false
      })
      return
    }

    // COD / banking / momo: đặt hàng thông thường
    const order = await orderStore.checkout(payload)

    for (const id of [...selectedIds.value]) {
      await cartStore.removeItem(id)
    }

    successOrderId.value = order.id
    orderSuccess.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e: any) {
    if (e.errors) {
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

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  await cartStore.fetchCart()

  if (authStore.isLoggedIn) {
    await authStore.fetchMe()
    await Promise.all([fetchSavedCoupons(), fetchSavedAddresses()])
  }

  const couponFromUrl = route.query.coupon as string
  if (couponFromUrl) {
    couponCode.value = couponFromUrl.toUpperCase()
    applyCoupon()
  }

  const vnpayStatus = route.query.vnpay as string

  if (vnpayStatus === 'success') {
    const orderId = Number(route.query.order_id)
    successOrderId.value = orderId
    orderSuccess.value = true
    const savedIds = JSON.parse(sessionStorage.getItem('vnpay_checkout_ids') || '[]')
    for (const id of savedIds) { await cartStore.removeItem(id).catch(() => { }) }
    sessionStorage.removeItem('vnpay_checkout_ids')
    return
  }

  if (vnpayStatus === 'fail') {
    const reason = route.query.reason as string
    const msgMap: Record<string, string> = {
      payment_failed: 'Thanh toán VNPay không thành công. Vui lòng thử lại.',
      invalid_hash:   'Xác minh VNPay thất bại. Vui lòng liên hệ hỗ trợ.',
      not_found:      'Không tìm thấy đơn hàng. Vui lòng liên hệ hỗ trợ.',
    }
    errorMsg.value = msgMap[reason] || 'Thanh toán VNPay thất bại.'
  }
})
</script>

<style scoped>
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px 60px;
  font-family: 'Segoe UI', sans-serif;
  color: #222;
}

.breadcrumb { font-size: 13px; color: #888; margin-bottom: 12px; }
.breadcrumb a { color: #2e7d32; text-decoration: none; }
.breadcrumb .sep { margin: 0 6px; }
.breadcrumb .active { color: #2e7d32; font-weight: 500; }

.page-title { font-size: 22px; font-weight: 700; color: #1b5e20; margin-bottom: 24px; }

/* ── Success ── */
.success-box {
  text-align: center; padding: 60px 20px; background: #fff;
  border-radius: 12px; border: 1px solid #c8e6c9;
  max-width: 480px; margin: 40px auto;
}
.success-icon { font-size: 72px; margin-bottom: 16px; }
.success-box h2 { font-size: 24px; font-weight: 700; color: #1b5e20; margin-bottom: 8px; }
.success-box p { font-size: 15px; color: #444; margin-bottom: 4px; }
.success-sub { color: #888; font-size: 13px; margin-bottom: 8px !important; }
.email-notice {
  color: #2e7d32; font-size: 13px; background: #e8f5e9;
  border-radius: 6px; padding: 8px 14px; margin-bottom: 20px !important;
}
.success-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
.btn-orders {
  padding: 12px 24px; background: #2e7d32; color: #fff;
  border-radius: 6px; text-decoration: none; font-weight: 600;
}
.btn-home {
  padding: 12px 24px; background: #fff; color: #2e7d32;
  border: 1.5px solid #2e7d32; border-radius: 6px; text-decoration: none; font-weight: 600;
}

/* ── Layout ── */
.checkout-layout { display: grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: start; }
.checkout-form-wrap { display: flex; flex-direction: column; gap: 20px; }
.form-section {
  background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 22px 24px;
}

.section-title {
  font-size: 15px; font-weight: 700; color: #1b5e20;
  margin-bottom: 18px; padding-bottom: 10px; border-bottom: 2px solid #e8f5e9;
}

/* Header kết hợp title + badge */
.form-section-head {
  display: flex; align-items: center; gap: 10px; margin-bottom: 18px;
  padding-bottom: 10px; border-bottom: 2px solid #e8f5e9;
}
.section-title-inline {
  font-size: 15px; font-weight: 700; color: #1b5e20; flex: 1;
}
.addr-autofill-badge {
  font-size: 11px; font-weight: 600; color: #2e7d32;
  background: #e8f5e9; border-radius: 12px; padding: 3px 10px; white-space: nowrap;
}

/* ── Địa chỉ đã lưu ── */
.addr-loading {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 0; font-size: 13px; color: #888;
}
.addr-empty { text-align: center; padding: 16px 0; color: #888; font-size: 14px; }
.addr-empty span { font-size: 28px; display: block; margin-bottom: 8px; }
.addr-empty p { margin: 0 0 10px; }

.link-add-addr {
  display: inline-block; font-size: 13px; font-weight: 600;
  color: #2e7d32; text-decoration: none; padding: 6px 14px;
  border: 1.5px solid #2e7d32; border-radius: 6px; transition: all .2s;
}
.link-add-addr:hover { background: #2e7d32; color: #fff; }

.link-add-addr-inline {
  display: block; font-size: 12px; font-weight: 600; color: #2e7d32;
  text-decoration: none; text-align: center; padding: 10px;
  border: 1.5px dashed #a5d6a7; border-radius: 8px; margin-top: 8px; transition: all .2s;
}
.link-add-addr-inline:hover { background: #f1f8f1; }

/* ── Địa chỉ select dropdown ── */
.default-badge {
  font-size: 11px; font-weight: 600; color: #2e7d32;
  background: #c8e6c9; border-radius: 10px; padding: 2px 8px;
}

.addr-loading {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 0; font-size: 13px; color: #888;
}

.addr-select-wrap {
  display: flex; flex-direction: column; gap: 8px; margin-top: 6px;
}

.addr-select-box {
  position: relative;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}

.addr-select {
  width: 100%;
  padding: 13px 40px 13px 14px;
  border: 1.5px solid #dce8dc;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  font-weight: 500;
  color: #1a1a1a;
  background: linear-gradient(180deg, #ffffff 0%, #f9fdf9 100%);
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  outline: none;
  transition: border-color .2s, box-shadow .2s, background .2s;
}
.addr-select:hover {
  border-color: #66bb6a;
  background: #f5fbf5;
}
.addr-select:focus {
  border-color: #2e7d32;
  background: #f5fbf5;
  box-shadow: 0 0 0 3px rgba(46,125,50,.12);
}

/* Mũi tên chọn */
.select-arrow {
  position: absolute;
  right: 13px; top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  color: #2e7d32;
  pointer-events: none;
  transition: transform .25s;
  line-height: 1;
}
.addr-select:focus ~ .select-arrow {
  transform: translateY(-50%) rotate(180deg);
}

/* Preview card địa chỉ đang chọn */
.addr-preview {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 14px;
  background: #f1f8f1;
  border: 1.5px solid #a5d6a7;
  border-radius: 8px;
  font-size: 13px;
}
.addr-preview-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.addr-preview-text { flex: 1; line-height: 1.6; }
.addr-preview-text strong { font-weight: 700; color: #1b5e20; }
.addr-preview-sep { color: #ccc; margin: 0 5px; }
.addr-preview-text p { margin: 2px 0 0; color: #555; font-size: 12px; }

.manual-addr-wrap {
  margin-top: 2px; padding: 10px 12px;
  border: 1.5px solid #e0e0e0; border-radius: 6px; background: #fafafa;
}
.manual-addr-wrap input {
  width: 100%; padding: 8px 0; border: none; background: transparent;
  font-size: 14px; outline: none; font-family: inherit;
}
.manual-addr-wrap input:focus { outline: none; }

/* ── Form ── */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { font-size: 13px; font-weight: 600; color: #444; }
.req { color: #e53935; }
.form-group input,
.form-group textarea {
  padding: 10px 12px; border: 1.5px solid #e0e0e0; border-radius: 6px;
  font-size: 14px; outline: none; transition: border .2s;
  font-family: inherit; resize: vertical;
}
.form-group input:focus,
.form-group textarea:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46,125,50,.08);
}
.input-error { border-color: #e53935 !important; }
.field-error { font-size: 12px; color: #e53935; margin-top: 2px; }

/* ── Payment ── */
.payment-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.payment-opt {
  display: flex; align-items: center; gap: 14px; padding: 14px 16px;
  border: 1.5px solid #e0e0e0; border-radius: 8px; cursor: pointer;
  transition: all .2s; position: relative;
}
.payment-opt.active { border-color: #2e7d32; background: #f1f8e9; }
.opt-icon { font-size: 22px; }
.opt-name { font-size: 14px; font-weight: 600; margin-bottom: 2px; }
.opt-desc { font-size: 12px; color: #888; }
.opt-check { margin-left: auto; color: #2e7d32; font-weight: 700; font-size: 16px; }

.banking-info {
  background: #fffde7; border: 1px solid #fff176; border-radius: 8px;
  padding: 16px; margin-top: 12px;
}
.banking-row { display: flex; gap: 12px; font-size: 13px; margin-bottom: 6px; }
.banking-row span { color: #888; min-width: 130px; }
.banking-row strong { color: #222; }
.banking-note { font-size: 12px; color: #e65100; margin-top: 10px; font-weight: 500; }

/* ── Summary ── */
.order-summary {
  background: #fff; border: 1px solid #e0e0e0; border-radius: 10px;
  padding: 22px; position: sticky; top: 80px;
}
.summary-loading {
  display: flex; align-items: center; gap: 10px;
  padding: 20px 0; color: #888; font-size: 14px;
}
.mini-spinner {
  width: 20px; height: 20px;
  border: 2px solid #e0e0e0; border-top-color: #2e7d32;
  border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.order-items { margin-bottom: 16px; max-height: 300px; overflow-y: auto; }
.order-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid #f0f0f0;
}
.order-item:last-child { border-bottom: none; }
.item-img {
  width: 56px; height: 56px; object-fit: contain;
  border-radius: 6px; border: 1px solid #eee; flex-shrink: 0;
}
.item-info { flex: 1; min-width: 0; }
.item-name { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.item-sku { font-size: 11px; color: #aaa; margin-top: 2px; }
.item-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
.item-qty { font-size: 12px; color: #888; }
.item-price { font-size: 13px; font-weight: 700; color: #e53935; }
.empty-items { text-align: center; padding: 24px; color: #888; font-size: 14px; }
.empty-items a { color: #2e7d32; font-weight: 600; }

/* ── Coupon ── */
.coupon-section { margin-bottom: 16px; }
.coupon-row { display: flex; gap: 8px; margin-bottom: 8px; }
.coupon-input {
  flex: 1; padding: 9px 12px; border: 1px solid #ddd;
  border-radius: 4px; font-size: 13px; outline: none; transition: border .2s;
}
.coupon-input:focus { border-color: #2e7d32; }
.coupon-input:disabled { background: #f5f5f5; }
.btn-coupon {
  padding: 9px 14px; background: #2e7d32; color: #fff; border: none;
  border-radius: 4px; font-size: 13px; cursor: pointer; white-space: nowrap;
}
.btn-coupon:hover:not(:disabled) { background: #1b5e20; }
.btn-coupon:disabled { background: #a5d6a7; cursor: default; }
.coupon-msg { font-size: 12px; margin-bottom: 12px; }
.coupon-msg.ok { color: #2e7d32; }
.coupon-msg.err { color: #e53935; }

.saved-coupons { margin-top: 10px; }
.saved-list { display: flex; flex-direction: column; gap: 8px; }
.saved-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 10px; border: 1.5px solid #e8f5e9; border-radius: 8px;
  background: #fff; gap: 10px;
}
.saved-item.used, .saved-item.expired { opacity: .5; }
.saved-item.selected { border-color: #2e7d32; background: #f1f8e9; }
.saved-left { flex: 1; min-width: 0; }
.saved-code { font-size: 13px; font-weight: 800; font-family: monospace; color: #1b5e20; display: block; }
.saved-item.used .saved-code,
.saved-item.expired .saved-code { color: #9e9e9e; }
.saved-min { font-size: 10px; color: #e65100; display: block; margin-top: 2px; }
.saved-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
.saved-discount { font-size: 13px; font-weight: 700; color: #2e7d32; }
.btn-select-coupon {
  margin-top: 4px; padding: 5px 14px; border: 1.5px solid #2e7d32;
  border-radius: 14px; background: #fff; color: #2e7d32;
  font-size: 12px; font-weight: 700; cursor: pointer; transition: all .2s;
}
.btn-select-coupon:hover:not(:disabled):not(.is-selected) { background: #2e7d32; color: #fff; }
.btn-select-coupon.is-selected { background: #2e7d32; color: #fff; cursor: default; }
.btn-select-coupon:disabled { opacity: .4; cursor: not-allowed; }
.saved-toggle {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  padding: 9px 12px; background: #f1f8e9; border: 1.5px solid #c8e6c9;
  border-radius: 8px; font-size: 12px; font-weight: 700; color: #2e7d32;
  cursor: pointer; transition: background .2s; margin-top: 8px;
}
.saved-toggle:hover { background: #e8f5e9; }
.toggle-arrow { font-size: 14px; transition: transform .2s; }
.toggle-arrow.open { transform: rotate(180deg); }

/* ── Summary lines ── */
.summary-lines { margin-bottom: 20px; }
.summary-line { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; color: #444; }
.green { color: #2e7d32; font-weight: 500; }
.divider { border-top: 1px dashed #ddd; margin: 10px 0; }
.total-line { font-weight: 700; font-size: 15px; }
.total-price { color: #e53935; font-size: 18px; font-weight: 800; }

.error-msg {
  font-size: 13px; color: #e53935; background: #fef2f2;
  border: 1px solid #fecaca; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px;
}

.btn-place-order {
  width: 100%; padding: 15px;
  background: linear-gradient(135deg, #1b5e20, #2e7d32);
  color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all .2s; margin-bottom: 12px; box-shadow: 0 4px 16px rgba(27,94,32,.3);
}
.btn-place-order:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(27,94,32,.4); }
.btn-place-order:disabled { opacity: .6; cursor: not-allowed; transform: none; }
.spinner {
  width: 18px; height: 18px;
  border: 2px solid rgba(255,255,255,.4); border-top-color: #fff;
  border-radius: 50%; animation: spin .7s linear infinite;
}
.btn-back-cart {
  display: block; text-align: center; color: #2e7d32;
  font-size: 13px; font-weight: 500; text-decoration: none; padding: 8px;
}
.btn-back-cart:hover { text-decoration: underline; }

@media (max-width: 860px) {
  .checkout-layout { grid-template-columns: 1fr; }
  .order-summary { position: static; }
  .form-grid { grid-template-columns: 1fr; }
  .form-group.full { grid-column: 1; }
}
</style>