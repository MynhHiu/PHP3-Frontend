<template>
  <div class="promo-page">

    <transition name="toast-fade">
      <div v-if="toast.show" :class="['pd-toast', toast.type]">
        {{ toast.message }}
      </div>
    </transition>

    <!-- Tiêu đề đơn giản -->
    <div class="promo-header">
      <h1>Khuyến mãi hôm nay</h1>
      <p>Lưu mã ngay — dùng khi thanh toán, tiết kiệm thật nhiều!</p>
    </div>

    <div class="promo-body">

      <!-- Chưa đăng nhập -->
      <div v-if="!authStore.isLoggedIn" class="login-notice">
        <router-link to="/login">Đăng nhập</router-link> để lưu mã và dùng khi thanh toán!
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-wrap">
        <div class="spinner"></div>
        <p>Đang tải khuyến mãi...</p>
      </div>

      <!-- Không có mã nào -->
      <div v-else-if="allCoupons.length === 0" class="empty">
        <div class="empty-icon"></div>
        <p>Hiện chưa có khuyến mãi nào.</p>
      </div>

      <!-- Danh sách mã — mỗi mã 1 hàng -->
      <div v-else class="coupon-list">
        <div
          v-for="c in allCoupons"
          :key="c.coupon_code"
          :class="['coupon-card', { 'is-saved': savedCodes.has(c.coupon_code) }]"
        >
          <!-- HSD -->
          <div v-if="c.expires_at" class="expire-badge">
            HSD: {{ formatDate(c.expires_at) }}
          </div>

          <!-- Trái: discount -->
          <div class="card-left">
            <div class="discount-val">{{ c.discount_display }}</div>
            <div class="min-val" v-if="c.minordervalue > 0">
              Đơn từ {{ fmt(c.minordervalue) }}₫
            </div>
            <div class="min-val" v-else>Không giới hạn</div>
          </div>

          <!-- Đường cắt -->
          <div class="card-cut">
            <div class="cut-circle top"></div>
            <div class="cut-line"></div>
            <div class="cut-circle bot"></div>
          </div>

          <!-- Giữa: thông tin mã -->
          <div class="card-mid">
            <div class="coupon-code">{{ c.coupon_code }}</div>
            <div class="coupon-desc">{{ c.description }}</div>
          </div>

          <!-- Phải: nút lưu -->
          <div class="card-right">
            <button
              v-if="authStore.isLoggedIn"
              :class="['btn-save', { saved: savedCodes.has(c.coupon_code) }]"
              :disabled="savedCodes.has(c.coupon_code) || savingCode === c.coupon_code"
              @click="saveCoupon(c.coupon_code)"
            >
              <span v-if="savingCode === c.coupon_code">Đang lưu...</span>
              <span v-else-if="savedCodes.has(c.coupon_code)">Đã lưu</span>
              <span v-else>+ Lưu mã</span>
            </button>
            <router-link v-else to="/login" class="btn-save">
              Đăng nhập để lưu
            </router-link>
          </div>
        </div>
      </div>

      <!-- Nút xem mã đã lưu
      <div v-if="authStore.isLoggedIn && savedCodes.size > 0" class="saved-link-row">
        <router-link to="/profile?tab=coupons" class="btn-goto-saved">
          🎟️ Xem {{ savedCodes.size }} mã đã lưu của tôi →
        </router-link>
      </div> -->

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/user/stores/authStore'
import api from '@/api/index'

interface CouponPublic {
  coupon_code: string
  description: string
  discount: string
  discount_display: string
  minordervalue: number
  expires_at: string | null
}

const authStore  = useAuthStore()
const loading    = ref(false)
const allCoupons = ref<CouponPublic[]>([])
const myCoupons  = ref<any[]>([])
const savingCode = ref('')
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value.show = false
    toastTimer = null
  }, 3000)
}

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer)
})

const savedCodes = computed(() =>
  new Set(myCoupons.value.map((c: any) => c.coupon_code))
)

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n)

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

async function fetchAllCoupons() {
  loading.value = true
  try {
    const res = await api.get('/public/coupons')
    allCoupons.value = res.data
  } catch {
    allCoupons.value = []
  } finally {
    loading.value = false
  }
}

async function fetchMyCoupons() {
  if (!authStore.isLoggedIn) return
  try {
    const res = await api.get('/user/my-coupons')
    myCoupons.value = res.data
  } catch {
    myCoupons.value = []
  }
}

async function saveCoupon(code: string) {
  if (savingCode.value) return
  savingCode.value = code
  try {
    await api.post('/user/save-coupon', { coupon_code: code })
    await fetchMyCoupons()
    showToast(`Đã lưu mã "${code}" vào danh sách của bạn!`, 'success')
  } catch (e: any) {
    showToast(e.userMessage || 'Không thể lưu mã này.', 'error')
  } finally {
    savingCode.value = ''
  }
}

onMounted(async () => {
  await fetchAllCoupons()
  await fetchMyCoupons()
})
</script>

<style scoped>
.promo-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 28px 16px 60px;
  font-family: 'Segoe UI', sans-serif;
  color: #222;
}

/* Tiêu đề đơn giản */
.promo-header { margin-bottom: 24px; }
.promo-header h1 {
  font-size: 22px; font-weight: 700; color: #1b5e20; margin: 0 0 4px;
}
.promo-header p { font-size: 14px; color: #888; margin: 0; }

/* Login notice */
.login-notice {
  background: #fff8e1; border: 1px solid #ffe082; border-radius: 8px;
  padding: 12px 16px; font-size: 13px; color: #555; margin-bottom: 20px;
}
.login-notice a { color: #2e7d32; font-weight: 600; }

/* Loading */
.loading-wrap { text-align: center; padding: 48px; color: #888; }
.spinner {
  width: 32px; height: 32px; border: 3px solid #e8f5e9;
  border-top-color: #2e7d32; border-radius: 50%;
  animation: spin .7s linear infinite; margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty */
.empty { text-align: center; padding: 60px; color: #bbb; }
.empty-icon { font-size: 56px; margin-bottom: 12px; }
.empty p { font-size: 14px; }

/* Danh sách — mỗi mã 1 hàng */
.coupon-list { display: flex; flex-direction: column; gap: 12px; }

.coupon-card {
  display: flex; align-items: stretch;
  border-radius: 10px; overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,.07);
  position: relative; background: #fff;
  transition: transform .15s, box-shadow .15s;
  border: 1.5px solid #f0f0f0;
}
.coupon-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,.11); }
.coupon-card.is-saved { border-color: #a5d6a7; box-shadow: 0 2px 10px rgba(46,125,50,.15); }

/* HSD badge */
.expire-badge {
  position: absolute; top: 8px; right: 12px;
  background: #fff3e0; color: #e65100;
  font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px;
}

/* Trái */
.card-left {
  background: linear-gradient(160deg, #2e7d32, #1b5e20); color: #fff;
  padding: 18px 16px; min-width: 140px; max-width: 140px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center;
  flex-shrink: 0;
}
.coupon-card.is-saved .card-left { background: linear-gradient(160deg, #43a047, #2e7d32); }
.discount-val { font-size: 18px; font-weight: 900; line-height: 1.2; margin-bottom: 5px; }
.min-val { font-size: 10px; opacity: .85; line-height: 1.5; }

/* Đường cắt */
.card-cut {
  width: 12px; background: #f7f7f7; flex-shrink: 0;
  display: flex; flex-direction: column; align-items: center; position: relative;
}
.cut-circle {
  width: 12px; height: 12px; border-radius: 50%; background: #eeeeee;
  position: absolute; left: 50%; transform: translateX(-50%);
  box-shadow: inset 0 0 0 1px #e0e0e0;
}
.cut-circle.top { top: -6px; }
.cut-circle.bot { bottom: -6px; }
.cut-line {
  width: 1px; height: 100%;
  background: repeating-linear-gradient(
    to bottom, #ddd 0, #ddd 4px, transparent 4px, transparent 8px
  );
}

/* Giữa */
.card-mid {
  flex: 1; padding: 16px 16px 16px 14px;
  display: flex; flex-direction: column; justify-content: center; min-width: 0;
}
.coupon-code {
  font-size: 16px; font-weight: 800; color: #1b5e20;
  letter-spacing: 2px; font-family: monospace; margin-bottom: 4px;
}
.coupon-desc { font-size: 12px; color: #666; line-height: 1.5; }

/* Phải: nút lưu */
.card-right {
  padding: 16px 16px; display: flex;
  align-items: center; justify-content: center;
  flex-shrink: 0;
}
.btn-save {
  padding: 8px 20px; border-radius: 20px;
  font-size: 13px; font-weight: 700; cursor: pointer;
  border: 2px solid #2e7d32; background: #fff; color: #2e7d32;
  transition: all .2s; text-decoration: none; display: inline-block;
  white-space: nowrap;
}
.btn-save:hover:not(:disabled):not(.saved) { background: #2e7d32; color: #fff; }
.btn-save.saved {
  background: #e8f5e9; color: #2e7d32;
  border-color: #a5d6a7; cursor: default;
}
.btn-save:disabled { opacity: .7; cursor: not-allowed; }

/* Toast */
.pd-toast {
  position: fixed;
  bottom: 28px;
  left: 28px;
  right: auto;
  padding: 14px 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  z-index: 9999;
  box-shadow: 0 8px 28px rgba(0, 0, 0, .18);
  max-width: 340px;
}
.pd-toast.success { background: #1a5c2e; }
.pd-toast.error   { background: #dc2626; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: all .3s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(16px); }

/* Link xem mã đã lưu */
.saved-link-row { margin-top: 24px; text-align: center; }
.btn-goto-saved {
  display: inline-block; padding: 11px 26px;
  background: #1b5e20; color: #fff; border-radius: 24px;
  font-size: 14px; font-weight: 700; text-decoration: none; transition: background .2s;
}
.btn-goto-saved:hover { background: #2e7d32; }

@media (max-width: 500px) {
  .card-left { min-width: 110px; max-width: 110px; }
  .discount-val { font-size: 15px; }
  .coupon-code { font-size: 14px; }
}
</style>