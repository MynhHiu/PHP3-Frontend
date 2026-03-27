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

          <div class="u-search">
            <input class="u-search-input" type="text" v-model="searchQuery" placeholder="Tìm sản phẩm..."
              @keyup.enter="goSearch" />
            <button class="u-search-btn" @click="goSearch">
              <IconSearch />
            </button>
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
        <span class="u-action-icon-sm"><IconLogout /></span>
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
              <router-link :to="item.to" :class="['u-nav-link', item.highlight && 'u-nav-highlight']">{{ item.label
              }}</router-link>
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

  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/user/stores/authStore'
import { useCartStore } from '@/user/stores/cartStore'
import logoImage from '@/assets/image/image-removebg-preview.png'

onMounted(() => {
  authStore.init()
})

async function handleLogout() {
  await authStore.logout()
  // Giữ nguyên trang hiện tại sau khi đăng xuất (không chuyển về /login)
  // Nếu muốn đổi hướng, dùng router.push('/login') ở đây.
}

const IconLogout = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', style: 'width:22px;height:22px' }, [h('path', { d: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4' }), h('polyline', { points: '16 17 21 12 16 7' }), h('line', { x1: '21', y1: '12', x2: '9', y2: '12' })]) }

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const searchQuery = ref('')
const goSearch = () => {
  const q = searchQuery.value.trim()
  if (q) router.push({ path: '/products', query: { search: q } })
}

const navItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Sản phẩm', to: '/products' },
  { label: 'Thương hiệu', to: '/brands' },
  { label: 'Khuyến mãi', to: '/promotions', highlight: true },
  { label: 'Tin tức', to: '/news' },
  { label: 'Liên hệ', to: '/contact' },
]

// Inline SVG Icons
const IconMapPin = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', style: 'width:12px;height:12px;display:inline;vertical-align:middle' }, [h('path', { d: 'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z' }), h('circle', { cx: '12', cy: '10', r: '3' })]) }
const IconSearch = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', 'stroke-width': '2.5', style: 'width:18px;height:18px' }, [h('circle', { cx: '11', cy: '11', r: '8' }), h('line', { x1: '21', y1: '21', x2: '16.65', y2: '16.65' })]) }
const IconUser = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', style: 'width:22px;height:22px' }, [h('path', { d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' }), h('circle', { cx: '12', cy: '7', r: '4' })]) }
const IconCart = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2', style: 'width:22px;height:22px' }, [h('circle', { cx: '9', cy: '21', r: '1' }), h('circle', { cx: '20', cy: '21', r: '1' }), h('path', { d: 'M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6' })]) }
</script>
