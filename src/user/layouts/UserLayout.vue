<template>
  <div class="user-shell">

    <!-- ── HEADER ──────────────────────────────────────────── -->
    <header class="u-header">

      <!-- Header main -->
      <div class="u-header-main">
        <div class="u-container u-header-main-inner">
          <router-link to="/" class="u-logo">
            <!-- Logo -->
            <div class="sidebar-logo">
              <div>
                <div style="font-size:18px;font-weight:900;color:#4ade80">Green Electric</div>
                <div style="font-size:10px;color:#555;letter-spacing:3px;text-transform:uppercase">Điện gia dụng</div>
              </div>
            </div>
          </router-link>

          <div class="u-search" ref="searchWrap">
            <input class="u-search-input" type="text" v-model="searchQuery" placeholder="Tìm sản phẩm..."
              @keyup.enter="goSearch" @input="onSearchInput" @focus="showSuggestions = suggestions.length > 0"
              autocomplete="off" />
            <button class="u-search-btn" @click="goSearch">
              <IconSearch />
            </button>

            <!-- Suggestions dropdown -->
            <div v-if="showSuggestions && suggestions.length" class="u-suggestions">
              <div v-for="s in suggestions" :key="s.id" class="u-suggestion-item"
                @mousedown.prevent="pickSuggestion(s)">
                <img :src="s.image_url || ''" class="u-sug-img"
                  @error="(e) => (e.target as HTMLImageElement).style.display = 'none'" />
                <div class="u-sug-info">
                  <span class="u-sug-name">{{ s.name }}</span>
                  <span class="u-sug-price">{{ fmt(s.price || 0) }}đ</span>
                </div>
              </div>
              <div class="u-sug-footer" @mousedown.prevent="goSearch">
                Xem tất cả kết quả cho "<strong>{{ searchQuery }}</strong>"
              </div>
            </div>
          </div>

          <div class="u-header-actions">
            <div class="u-profile-dropdown">
              <router-link :to="authStore.isLoggedIn ? { name: 'profile' } : { name: 'login' }" class="u-action">
                <span class="u-action-icon">
                  <IconUser />
                </span>
                <span>{{ authStore.isLoggedIn ? authStore.user?.fullname?.split(' ').pop() : 'Tài khoản' }}</span>
              </router-link>

              <div v-if="authStore.isLoggedIn" class="u-dropdown-content">
                <div class="u-dropdown-header">
                  <strong>Chào, {{ authStore.user?.fullname?.split(' ').pop() }}</strong>
                </div>
                <router-link :to="{ name: 'profile' }" class="u-dropdown-item">
                  Thông tin cá nhân
                </router-link>
                <router-link :to="{ name: 'order-history' }" class="u-dropdown-item">
                  Lịch sử đơn hàng
                </router-link>
                <hr class="u-divider" />
                <button class="u-dropdown-item u-logout-text" @click="handleLogout">
                  <span class="u-action-icon-sm">
                    <IconLogout />
                  </span>
                  Đăng xuất
                </button>
              </div>
            </div>

            <router-link to="/cart" class="u-action">
              <div class="u-cart-icon-wrap">
                <span class="u-action-icon">
                  <IconCart />
                </span>
                <span v-if="cartStore.totalItems > 0" class="u-cart-badge">{{ cartStore.totalItems }}</span>
              </div>
              <span>Giỏ hàng</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="u-nav">
        <div class="u-container">
          <ul class="u-nav-list">
            <li v-for="item in navItems" :key="item.to">
              <router-link :to="item.to" active-class="" exact-active-class="" :class="[
                'u-nav-link',
                item.highlight && 'u-nav-highlight',
                isNavActive(item) && 'is-active'
              ]">{{ item.label }}</router-link>
            </li>
          </ul>
        </div>
      </nav>
    </header>

    <!-- ── PAGE CONTENT ─────────────────────────────────────── -->
    <main class="u-main">
      <router-view />
    </main>

    <!-- ── FOOTER ───────────────────────────────────────────── -->
    <footer class="u-footer">
      <div class="u-container u-footer-inner">
        <div class="u-footer-col u-footer-brand">
          <div class="u-footer-logo">
            <div>
              <div style="font-size:18px;font-weight:900;color:#4ade80">Green Electric</div>
              <div style="font-size:10px;color:#555;letter-spacing:3px;text-transform:uppercase">Điện gia dụng</div>
            </div>
          </div>
          <p>Cửa hàng điện tử, điện gia dụng uy tín tại Buôn Ma Thuột.</p>
          <div class="u-footer-contact">
            <p>344 Thị trấn Buôn Ma Thuột, Dak Lak</p>
            <p>0207713540</p>
            <p>huymap6307@gmail.com</p>
          </div>
        </div>

        <div class="u-footer-col">
          <h4 class="u-footer-title">Chính sách</h4>
          <ul class="u-footer-links">
            <li><a href="#">Chính sách bán hàng</a></li>
            <li><a href="#">Chính sách đổi trả</a></li>
            <li><a href="#">Chính sách vận chuyển</a></li>
            <li><a href="#">Bảo mật thông tin</a></li>
            <li><a href="#">Chính sách kiểm hàng</a></li>
          </ul>
        </div>

        <div class="u-footer-col">
          <h4 class="u-footer-title">Hỗ trợ khách hàng</h4>
          <ul class="u-footer-links">
            <li><a href="#">Hướng dẫn mua hàng</a></li>
            <li><a href="#">Tra cứu đơn hàng</a></li>
            <li><a href="#">Câu hỏi thường gặp</a></li>
            <li><a href="#">Liên hệ hỗ trợ</a></li>
          </ul>
        </div>

        <div class="u-footer-col">
          <h4 class="u-footer-title">Giao hàng & Thanh toán</h4>
          <p class="u-footer-sub">Miễn phí vận chuyển nội thành</p>
          <div class="u-ship-badge">Giao hàng trong ngày</div>
          <div class="u-pay-methods">
            <span>Thẻ ATM</span>
            <span>Tiền mặt</span>
            <span>Momo</span>
          </div>
        </div>
      </div>
      <div class="u-footer-bottom">
        <p>© 2025 Green Electric. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>

    <!-- ── AI CHAT BOT ──────────────────────────────────────── -->
    <AiChatBox />

  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AiChatBox from '@/user/components/AiChatBox.vue'
import { useAuthStore } from '@/user/stores/authStore'
import { useCartStore } from '@/user/stores/cartStore'
import logoImage from '@/assets/image/image-removebg-preview.png'

onMounted(() => {
  authStore.init()
  document.addEventListener('click', onClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
  clearTimeout(debounceTimer)
})

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}

function isNavActive(item: { to: string, exact?: boolean }) {
  if (item.exact) return route.path === item.to
  // Phải khớp đúng segment, tránh /coupons match /contact
  return route.path === item.to || route.path.startsWith(item.to + '/')
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

/* ── Search + Autocomplete ───────────────────────────────────────── */
const searchQuery = ref('')
const suggestions = ref<any[]>([])
const showSuggestions = ref(false)
const searchWrap = ref<HTMLElement | null>(null)
let debounceTimer: ReturnType<typeof setTimeout>

const fmt = (n: number) => n.toLocaleString('vi-VN')
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

function onSearchInput() {
  clearTimeout(debounceTimer)
  const q = searchQuery.value.trim()
  if (q.length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  debounceTimer = setTimeout(async () => {
    try {
      const res = await fetch(`${BASE}/products?search=${encodeURIComponent(q)}&per_page=6`)
      const data = await res.json()
      suggestions.value = Array.isArray(data) ? data.slice(0, 6) : []
      showSuggestions.value = suggestions.value.length > 0
    } catch {
      suggestions.value = []
      showSuggestions.value = false
    }
  }, 280)
}

function goSearch() {
  const q = searchQuery.value.trim()
  showSuggestions.value = false
  if (q) router.push({ path: '/', query: { search: q } })
}

function pickSuggestion(s: any) {
  searchQuery.value = ''
  showSuggestions.value = false
  suggestions.value = []
  router.push(`/products/${s.id}`)
}

function onClickOutside(e: MouseEvent) {
  if (searchWrap.value && !searchWrap.value.contains(e.target as Node)) {
    showSuggestions.value = false
  }
}

/* ── Nav ─────────────────────────────────────────────────────────── */
const navItems = [
  { label: 'Trang chủ', to: '/', exact: true },
  { label: 'Sản phẩm', to: '/products', exact: false },
  { label: 'Khuyến mãi', to: '/coupons', highlight: true, exact: false },
  { label: 'Tin tức', to: '/news', exact: false },
  { label: 'Liên hệ', to: '/contact', exact: false },
]

// Inline SVG Icons
const IconLogout = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', style: 'width:22px;height:22px' }, [h('path', { d: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4' }), h('polyline', { points: '16 17 21 12 16 7' }), h('line', { x1: '21', y1: '12', x2: '9', y2: '12' })]) }
const IconSearch = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', 'stroke-width': '2.5', style: 'width:18px;height:18px' }, [h('circle', { cx: '11', cy: '11', r: '8' }), h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })]) }
const IconUser = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', style: 'width:22px;height:22px' }, [h('path', { d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' }), h('circle', { cx: '12', cy: '7', r: '4' })]) }
const IconCart = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', style: 'width:22px;height:22px' }, [h('circle', { cx: '9', cy: '21', r: '1' }), h('circle', { cx: '20', cy: '21', r: '1' }), h('path', { d: 'M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6' })]) }
const IconMapPin = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', style: 'width:12px;height:12px;display:inline;vertical-align:middle' }, [h('path', { d: 'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z' }), h('circle', { cx: '12', cy: '10', r: '3' })]) }
</script>

<style scoped>
.u-nav-link.router-link-active:not(.is-active) {
  background: transparent !important;
  font-weight: 500 !important;
}

.u-nav-link.router-link-exact-active:not(.is-active) {
  background: transparent !important;
  font-weight: 500 !important;
}

/* Suggestions dropdown */
.u-search {
  position: relative;
}

.u-suggestions {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e0e8e3;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, .12);
  z-index: 9999;
  overflow: hidden;
}

.u-suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background .15s;
  border-bottom: 1px solid #f3f3f3;
}

.u-suggestion-item:last-child {
  border-bottom: none;
}

.u-suggestion-item:hover {
  background: #f0faf4;
}

.u-sug-img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  border-radius: 8px;
  background: #f8faf9;
  flex-shrink: 0;
  border: 1px solid #eee;
}

.u-sug-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.u-sug-name {
  font-size: 13px;
  color: #222;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.u-sug-price {
  font-size: 12px;
  color: #e03131;
  font-weight: 700;
}

.u-sug-footer {
  padding: 10px 14px;
  font-size: 12.5px;
  color: #2d8c4e;
  font-weight: 600;
  cursor: pointer;
  background: #f8fdf9;
  text-align: center;
  transition: background .15s;
}

.u-sug-footer:hover {
  background: #eaf7ef;
}

.u-sug-footer strong {
  color: #1a5c2e;
}

.u-nav-link.is-active {
  background: transparent;
  font-weight: 700;
  border-bottom: 3px solid #fff;
  padding-bottom: 7px;
}
</style>