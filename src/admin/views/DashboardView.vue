<template>
  <div class="page-stack">

    <!-- Stats -->
    <div class="stat-grid">
      <div v-for="s in statCards" :key="s.label" class="stat-card">
        <div :class="['stat-icon', s.bg]">
          <span>{{ s.emoji }}</span>
        </div>
        <div>
          <p class="stat-label">{{ s.label }}</p>
          <p class="stat-value">
            <template v-if="loading">—</template>
            <template v-else>{{ s.value }}</template>
          </p>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && productStore.products.length === 0" class="empty-state">
      <div class="empty-icon">📦</div>
      <h3>Chưa có dữ liệu</h3>
      <p>
        Chưa kết nối được với API Laravel. Kiểm tra lại
        <code>.env</code> hoặc bắt đầu thêm sản phẩm.
      </p>
      <!-- <div class="empty-actions">
        <router-link to="/admin/products/create" class="btn btn-primary">+ Thêm sản phẩm</router-link>
        <router-link to="/admin/categories/create" class="btn btn-outline">+ Thêm danh mục</router-link>
      </div> -->
    </div>

    <!-- Có dữ liệu -->
    <div v-else-if="productStore.products.length > 0" class="dash-grid">
      <div class="card">
        <div class="card-head">
          <h3>Sản phẩm mới nhất</h3>
          <router-link to="/admin/products">Xem tất cả →</router-link>
        </div>
        <table class="table-auto">
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in productStore.products.slice(0, 5)" :key="p.id">
              <td style="font-weight:600;color:var(--gray-800);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ p.name }}</td>
              <td class="price-main">{{ fmt(p.price) }}</td>
              <td :style="p.stock === 0 ? 'color:var(--red-500);font-weight:600' : ''">{{ p.stock }}</td>
              <td><span :class="statusBadge(p.status)">{{ statusLabel(p.status) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-head">
          <h3>Danh mục</h3>
          <router-link to="/admin/categories">Quản lý →</router-link>
        </div>
        <div class="card-body">
          <div v-if="categoryStore.categories.length === 0" class="cat-empty">Chưa có danh mục</div>
          <div v-for="cat in categoryStore.categories.slice(0, 6)" :key="cat.id" class="cat-row">
            <span>{{ cat.name }}</span>
            <span class="cat-count">{{ cat.products_count ?? 0 }} SP</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <!-- <div class="action-grid">
      <router-link to="/admin/products/create" class="action-card">
        <div class="action-icon">
          <svg style="width:24px;height:24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
        <div class="action-text">
          <p class="a-title">Thêm sản phẩm mới</p>
          <p class="a-sub">Tạo và đăng bán ngay</p>
        </div>
      </router-link>

      <router-link to="/admin/categories/create" class="action-card">
        <div class="action-icon">
          <svg style="width:24px;height:24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
        </div>
        <div class="action-text">
          <p class="a-title">Thêm danh mục</p>
          <p class="a-sub">Tổ chức sản phẩm theo nhóm</p>
        </div>
      </router-link>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useProductStore }  from '@/admin/stores/productStore'
import { useCategoryStore } from '@/admin/stores/categoryStore'

const productStore  = useProductStore()
const categoryStore = useCategoryStore()
const loading       = computed(() => productStore.loading || categoryStore.loading)

const statCards = computed(() => [
  { label: 'Tổng sản phẩm', value: productStore.meta.total,         bg: 'green',  emoji: '📦' },
  { label: 'Đang bán',       value: productStore.stats.active,       bg: 'blue',   emoji: '✅' },
  { label: 'Hết hàng',       value: productStore.stats.outStock,     bg: 'red',    emoji: '⚠️' },
  { label: 'Danh mục',       value: categoryStore.categories.length, bg: 'yellow', emoji: '📂' },
])

const fmt = (v: number) => Number(v).toLocaleString('vi-VN') + '₫'
const statusLabel = (s: string) => ({ active: 'Đang bán', draft: 'Nháp', hidden: 'Ẩn' }[s] ?? s)
const statusBadge = (s: string) => ({
  active: 'badge badge-green', draft: 'badge badge-yellow', hidden: 'badge badge-gray',
}[s] ?? 'badge badge-gray')

onMounted(async () => {
  await categoryStore.fetchAll()
  await productStore.fetchAll()
})
</script>
