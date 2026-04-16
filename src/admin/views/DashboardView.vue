<template>
  <div class="page-stack">

    <!-- Stats Cards -->
    <div class="stat-grid">
      <div v-for="s in statCards" :key="s.label" class="stat-card">
        <div :class="['stat-icon', s.bg]">
          <span>{{ s.emoji }}</span>
        </div>
        <div>
          <p class="stat-label">{{ s.label }}</p>
          <p class="stat-value">
            <template v-if="dash.loading">—</template>
            <template v-else>{{ s.value }}</template>
          </p>
          <p v-if="s.sub" class="stat-sub">{{ s.sub }}</p>
        </div>
      </div>
    </div>

    <!-- Doanh thu 6 tháng -->
    <div class="dash-grid" v-if="!dash.loading">

      <div class="card">
        <div class="card-head">
          <h3>Doanh thu 6 tháng gần nhất</h3>
        </div>
        <div class="card-body">
          <div
            v-for="item in dash.stats.revenue_chart"
            :key="item.label"
            class="chart-row"
          >
            <span class="chart-label">{{ item.label }}</span>
            <div class="chart-bar-wrap">
              <div
                class="chart-bar"
                :style="{ width: barWidth(item.revenue) + '%' }"
              ></div>
            </div>
            <span class="chart-value">{{ fmtRevenue(item.revenue) }}</span>
          </div>
        </div>
      </div>

      <!-- Top sản phẩm bán chạy -->
      <div class="card">
        <div class="card-head">
          <h3>Top sản phẩm bán chạy</h3>
          <router-link to="/admin/products">Xem tất cả →</router-link>
        </div>
        <table class="table-auto">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên sản phẩm</th>
              <th>Đã bán</th>
              <th>Giá</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(p, idx) in dash.stats.top_products"
              :key="p.id"
            >
              <td style="color:var(--gray-400);font-weight:600">{{ idx + 1 }}</td>
              <td style="font-weight:600;color:var(--gray-800);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                {{ p.name }}
              </td>
              <td><span class="badge badge-green">{{ p.sold_count }}</span></td>
              <td class="price-main">{{ fmt(p.price) }}</td>
            </tr>
            <tr v-if="dash.stats.top_products.length === 0">
              <td colspan="4" style="text-align:center;color:var(--gray-400)">Chưa có dữ liệu</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <!-- Đơn hàng & Người dùng -->
    <div class="dash-grid" v-if="!dash.loading">

      <div class="card">
        <div class="card-head">
          <h3>Đơn hàng</h3>
          <router-link to="/admin/orders">Quản lý →</router-link>
        </div>
        <div class="card-body order-summary">
          <div class="order-item">
            <span>Tổng đơn</span>
            <strong>{{ dash.stats.orders.total }}</strong>
          </div>
          <div class="order-item">
            <span>Chờ xử lý</span>
            <span class="badge badge-yellow">{{ dash.stats.orders.pending }}</span>
          </div>
          <div class="order-item">
            <span>Hoàn thành</span>
            <span class="badge badge-green">{{ dash.stats.orders.done }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h3>Người dùng</h3>
          <router-link to="/admin/users">Quản lý →</router-link>
        </div>
        <div class="card-body order-summary">
          <div class="order-item">
            <span>Tổng người dùng</span>
            <strong>{{ dash.stats.users.total }}</strong>
          </div>
          <div class="order-item">
            <span>Mới tháng này</span>
            <span class="badge badge-blue">+{{ dash.stats.users.new_month }}</span>
          </div>
          <div class="order-item">
            <span>Đánh giá chờ duyệt</span>
            <span class="badge badge-yellow">{{ dash.stats.reviews.pending }}</span>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useDashboardStore } from '@/admin/stores/dashboardStore'

const dash = useDashboardStore()

// ── Stat cards ──────────────────────────────────────────────────────────────
const statCards = computed(() => [
  {
    label: 'Tổng sản phẩm',
    value: dash.stats.products.total,
    sub:   `Đang bán: ${dash.stats.products.active}`,
    bg: 'green', emoji: '📦',
  },
  {
    label: 'Hết hàng',
    value: dash.stats.products.out_stock,
    bg: 'red', emoji: '⚠️',
  },
  {
    label: 'Doanh thu tháng này',
    value: fmtRevenue(dash.stats.revenue.this_month),
    sub:   `Tổng: ${fmtRevenue(dash.stats.revenue.total)}`,
    bg: 'blue', emoji: '💰',
  },
  {
    label: 'Đơn chờ xử lý',
    value: dash.stats.orders.pending,
    sub:   `Tổng đơn: ${dash.stats.orders.total}`,
    bg: 'yellow', emoji: '🛒',
  },
])

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(v: number) {
  return Number(v).toLocaleString('vi-VN') + '₫'
}
function fmtRevenue(v: number) {
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + ' tỷ₫'
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(1) + ' triệu₫'
  return Number(v).toLocaleString('vi-VN') + '₫'
}

// Bar chart: tính chiều rộng % so với max
const maxRevenue = computed(() =>
  Math.max(...dash.stats.revenue_chart.map(r => r.revenue), 1)
)
function barWidth(v: number) {
  return Math.round((v / maxRevenue.value) * 100)
}

onMounted(() => dash.fetchStats())
</script>

<style scoped>
.chart-row {
  display: grid;
  grid-template-columns: 60px 1fr 90px;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}
.chart-label  { font-size: 12px; color: var(--gray-500); }
.chart-bar-wrap { background: var(--gray-100); border-radius: 4px; height: 10px; overflow: hidden; }
.chart-bar {
  height: 100%;
  background: var(--primary, #6366f1);
  border-radius: 4px;
  transition: width .4s ease;
  min-width: 4px;
}
.chart-value { font-size: 12px; font-weight: 600; color: var(--gray-700); text-align: right; }

.order-summary { display: flex; flex-direction: column; gap: 12px; padding: 4px 0; }
.order-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0; border-bottom: 1px solid var(--gray-100);
}
.order-item:last-child { border-bottom: none; }
.stat-sub { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
</style>