<template>
  <div class="admin-shell">

    <!-- Sidebar -->
    <aside :class="['admin-sidebar', !open && 'collapsed']">
      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">GE</div>
        <transition name="fade">
          <div v-if="open" class="sidebar-logo-text">
            <p class="brand-name">Green Electric</p>
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

const open  = ref(true)
const route = useRoute()

const titles: Record<string, string> = {
  'dashboard':       'Dashboard',
  'products':        'Sản phẩm',
  'product-create':  'Thêm sản phẩm',
  'product-edit':    'Sửa sản phẩm',
  'categories':      'Danh mục',
  'category-create': 'Thêm danh mục',
  'category-edit':   'Sửa danh mục',
}
const pageTitle = computed(() => titles[route.name as string] || 'Admin')

const IconGrid = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('rect', { x: '3', y: '3', width: '7', height: '7', rx: '1' }),
  h('rect', { x: '14', y: '3', width: '7', height: '7', rx: '1' }),
  h('rect', { x: '3', y: '14', width: '7', height: '7', rx: '1' }),
  h('rect', { x: '14', y: '14', width: '7', height: '7', rx: '1' }),
]) }
const IconBox = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z' }),
]) }
const IconList = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' }),
]) }
const IconHome = { render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' }),
  h('polyline', { points: '9 22 9 12 15 12 15 22' }),
]) }
</script>
