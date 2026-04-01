<template>
  <div class="admin-shell">

    <!-- Sidebar -->
    <aside :class="['admin-sidebar', !open && 'collapsed']">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="logo-wrapper">
          <img :src="logoImage" alt="My Logo" class="logo" />
        </div>
        <transition name="fade">
          <div v-if="open" class="sidebar-logo-text">
            <p class="brand-name">S1mple Electric</p>
            <p class="brand-sub">Quản trị hệ thống</p>
          </div>
        </transition>
      </div>

      <!-- Nav -->
      <nav class="sidebar-nav">
        <p v-if="open" class="nav-section">Tổng quan</p>

        <router-link to="/admin/dashboard" custom v-slot="{ isActive, navigate }">
          <div @click="navigate" :class="['nav-link', isActive && 'active', !open && 'center']" :title="!open ? 'Dashboard' : ''">
            <IconGrid class="nav-icon" />
            <span v-if="open">Dashboard</span>
          </div>
        </router-link>

        <template v-if="open"><p class="nav-section" style="margin-top:8px">Quản lý</p></template>
        <div v-else class="nav-divider"></div>

        <router-link to="/admin/products" custom v-slot="{ isActive, navigate }">
          <div @click="navigate" :class="['nav-link', isActive && 'active', !open && 'center']" :title="!open ? 'Sản phẩm' : ''">
            <IconBox class="nav-icon" />
            <span v-if="open">Sản phẩm</span>
          </div>
        </router-link>

        <router-link to="/admin/categories" custom v-slot="{ isActive, navigate }">
          <div @click="navigate" :class="['nav-link', isActive && 'active', !open && 'center']" :title="!open ? 'Danh mục' : ''">
            <IconList class="nav-icon" />
            <span v-if="open">Danh mục</span>
          </div>
        </router-link>

        <router-link to="/admin/brands" custom v-slot="{ isActive, navigate }">
          <div @click="navigate" :class="['nav-link', isActive && 'active', !open && 'center']" :title="!open ? 'Thương hiệu' : ''">
            <IconList class="nav-icon" />
            <span v-if="open">Thương hiệu</span>
          </div>
        </router-link>

        <!-- ── 2 TRANG MỚI: BIẾN THỂ ─────────────────────────────────── -->
        <template v-if="open"><p class="nav-section" style="margin-top:8px">Biến thể</p></template>
        <div v-else class="nav-divider"></div>
 
        <!--
          TRANG 1: Tạo biến thể
          Route: /admin/variants/create
          File:  src/admin/views/VariantCreate.vue
          Chức năng:
            - Tạo mới một variant (product_variants: variant_name, product_id)
            - Thêm các option_values (variant_options: option_values INT(11), product_variant_id)
        -->
        <router-link to="/admin/variants/create" custom v-slot="{ isActive, navigate }">
          <div @click="navigate" :class="['nav-link', (isActive || isVariantCreateActive) && 'active', !open && 'center']" :title="!open ? 'Tạo biến thể' : ''">
            <IconVariantCreate class="nav-icon" />
            <span v-if="open">Tạo biến thể</span>
          </div>
        </router-link>
 
        <!--
          TRANG 2: Chọn biến thể cho sản phẩm
          Route: /admin/variants/assign
          File:  src/admin/views/VariantAssign.vue
          Chức năng:
            - Chọn sản phẩm → xem biến thể hiện có
            - Tạo biến thể mới và gán ngay vào sản phẩm đó
            - Tạo SKU (product_skus) và gán combination_options
        -->
        <router-link to="/admin/variants/assign" custom v-slot="{ isActive, navigate }">
          <div @click="navigate" :class="['nav-link', isActive && 'active', !open && 'center']" :title="!open ? 'Gán biến thể' : ''">
            <IconVariantAssign class="nav-icon" />
            <span v-if="open">Gán biến thể</span>
          </div>
        </router-link>
 
        <!--
          TRANG PHỤ: Danh sách biến thể (truy cập từ sidebar phụ)
          Route: /admin/variants
          File:  src/admin/views/VariantList.vue
        -->
        <router-link to="/admin/variants" custom v-slot="{ isActive, navigate }">
          <div
            @click="navigate"
            :class="['nav-link', (isActive && !isVariantCreateActive && !isVariantAssignActive) && 'active', !open && 'center']"
            :title="!open ? 'Danh sách biến thể' : ''"
          >
            <IconList class="nav-icon" />
            <span v-if="open">Danh sách biến thể</span>
          </div>
        </router-link>
        <!-- ──────────────────────────────────────────────────────────── -->

        <template v-if="open"><p class="nav-section" style="margin-top:8px">Kinh doanh</p></template>
        <div v-else class="nav-divider"></div>

        <router-link to="/admin/orders" custom v-slot="{ isActive, navigate }">
          <div @click="navigate" :class="['nav-link', isActive && 'active', !open && 'center']" :title="!open ? 'Đơn hàng' : ''">
            <IconPackage class="nav-icon" />
            <span v-if="open">Đơn hàng</span>
          </div>
        </router-link>

        <router-link to="/admin/users" custom v-slot="{ isActive, navigate }">
          <div @click="navigate" :class="['nav-link', isActive && 'active', !open && 'center']" :title="!open ? 'Người dùng' : ''">
            <IconUsers class="nav-icon" />
            <span v-if="open">Người dùng</span>
          </div>
        </router-link>

        

        <router-link to="/admin/coupons" custom v-slot="{ isActive, navigate }">
          <div @click="navigate" :class="['nav-link', isActive && 'active', !open && 'center']" :title="!open ? 'Mã giảm giá' : ''">
            <IconTag class="nav-icon" />
            <span v-if="open">Mã giảm giá</span>
          </div>
        </router-link>

        <template v-if="open"><p class="nav-section" style="margin-top:8px">Hệ thống</p></template>
        <div v-else class="nav-divider"></div>

        <router-link to="/" custom v-slot="{ navigate }">
          <div @click="navigate" :class="['nav-link', !open && 'center']" :title="!open ? 'Xem trang web' : ''">
            <IconHome class="nav-icon" />
            <span v-if="open">Xem trang web</span>
          </div>
        </router-link>
      </nav>

      <!-- Toggle -->
      <button @click="open = !open" :class="['sidebar-toggle', !open && 'collapsed']">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
        <span v-if="open">Thu gọn</span>
      </button>
    </aside>

    <!-- Main -->
    <div class="admin-main">
      <!-- Topbar -->
      <header class="admin-topbar">
        <div class="topbar-title">
          <h1>{{ pageTitle }}</h1>
          <p>Admin / <span>{{ pageTitle }}</span></p>
        </div>
        <div class="topbar-user">
          <div class="user-avatar">A</div>
          <div class="user-info">
            <p class="u-name">Admin</p>
            <p class="u-role">Quản trị viên</p>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="admin-content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { useRoute } from 'vue-router'
import logoImage from '@/assets/image/image-removebg-preview.png'

const open  = ref(true)
const route = useRoute()

// Computed để active đúng nav-link biến thể
const isVariantCreateActive = computed(() =>
  route.path.includes('/admin/variants/create') || route.path.includes('/admin/variants/') && route.path.includes('/edit')
)
const isVariantAssignActive = computed(() => route.path.includes('/admin/variants/assign'))

const titles: Record<string, string> = {
  'dashboard':       'Dashboard',
  'products':        'Sản phẩm',
  'product-create':  'Thêm sản phẩm',
  'product-edit':    'Sửa sản phẩm',
  'categories':      'Danh mục',
  'category-create': 'Thêm danh mục',
  'category-edit':   'Sửa danh mục',
  'brands':           'Thương hiệu',
  'brand-create':     'Thêm thương hiệu',
  'brand-edit':       'Sửa thương hiệu',
  'orders':           'Lịch sử đơn hàng',
  'users':            'Quản lý người dùng',
  'coupons':          'Mã giảm giá',
  'coupon-create':    'Thêm mã giảm giá',
  'coupon-edit':      'Sửa mã giảm giá',

  'variants':         'Danh sách biến thể',
  'variant-create':   'Tạo biến thể',    
  'variant-edit':     'Sửa biến thể',
  'variant-assign':   'Gán biến thể',     

}
const pageTitle = computed(() => titles[route.name as string] || 'Admin')

// Icons
const IconGrid    = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }),
  h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }),
  h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }),
  h('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' }),
]) }
const IconBox     = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' }),
]) }
const IconList    = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' }),
]) }
const IconTag     = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z' }),
  h('line', { x1: '7', y1: '7', x2: '7.01', y2: '7' }),
]) }
const IconPackage = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' }),
  h('polyline', { points: '3.27 6.96 12 12.01 20.73 6.96' }),
  h('line', { x1: '12', y1: '22.08', x2: '12', y2: '12' }),
]) }
const IconUsers   = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' }),
  h('circle', { cx: '9', cy: '7', r: '4' }),
  h('path', { d: 'M23 21v-2a4 4 0 00-3-3.87' }),
  h('path', { d: 'M16 3.13a4 4 0 010 7.75' }),
]) }
const IconHome    = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' }),
  h('polyline', { points: '9 22 9 12 15 12 15 22' }),
]) }

// Icon cho trang "Tạo biến thể" — dấu + trong ô
const IconVariantCreate = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('rect', { x: '2', y: '7', width: '20', height: '14', rx: '2' }),
  h('path', { d: 'M16 2H8l-2 5h12z' }),
  h('path', { d: 'M12 11v6M9 14h6' }),
]) }
 
// Icon cho trang "Gán biến thể" — mũi tên nối
const IconVariantAssign = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('rect', { x: '2', y: '3', width: '8', height: '8', rx: '1' }),
  h('rect', { x: '14', y: '13', width: '8', height: '8', rx: '1' }),
  h('path', { d: 'M10 7h4M14 7l-2-2M14 7l-2 2' }),
  h('path', { d: 'M6 11v3M6 14h12M18 14v-3' }),
]) }
</script>