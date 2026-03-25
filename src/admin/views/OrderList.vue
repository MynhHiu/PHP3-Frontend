<template>
  <div class="page-stack">
    <div class="page-header">
      <div class="page-header-info">
        <h2>Lịch sử đơn hàng</h2>
        <p>Tổng {{ store.meta.total }} đơn hàng</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <input v-model="filters.search" @input="debouncedFetch" placeholder="Tìm email, số điện thoại..." class="input" />
      <select v-model="filters.status" @change="doFetch" class="input" style="width:180px">
        <option value="">Tất cả trạng thái</option>
        <option value="pending">Chờ xử lý</option>
        <option value="confirmed">Đã xác nhận</option>
        <option value="shipping">Đang giao</option>
        <option value="delivered">Đã giao</option>
        <option value="cancelled">Đã hủy</option>
      </select>
      <select v-model="filters.payment" @change="doFetch" class="input" style="width:160px">
        <option value="">Tất cả thanh toán</option>
        <option value="cod">COD</option>
        <option value="bank">Chuyển khoản</option>
        <option value="momo">MoMo</option>
      </select>
      <button v-if="hasFilter" @click="clearFilter" class="btn btn-outline btn-sm" style="color:var(--red-500);border-color:var(--red-100)">✕ Xóa lọc</button>
    </div>

    <div class="table-card">
      <div v-if="store.loading" class="loading-state">
        <svg class="animate-spin" style="width:20px;height:20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Đang tải...
      </div>

      <div v-else-if="store.error" class="error-state">
        <div class="icon-lg">⚠️</div>
        <p class="e-title">Không kết nối được API</p>
        <p class="e-sub">{{ store.error }}</p>
        <button @click="doFetch" class="btn btn-outline btn-sm" style="margin-top:12px">🔄 Thử lại</button>
      </div>

      <div v-else-if="store.orders.length === 0" class="empty-table">
        <div class="icon-lg">📦</div>
        <p>Chưa có đơn hàng nào</p>
      </div>

      <table v-else class="table-auto">
        <thead>
          <tr>
            <th>#</th>
            <th>Khách hàng</th>
            <th>Địa chỉ</th>
            <th>Tổng tiền</th>
            <th>Thanh toán</th>
            <th>Trạng thái</th>
            <th>Ngày đặt</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in store.orders" :key="o.id">
            <td style="font-weight:700;color:var(--brand);font-size:13px">#{{ o.id }}</td>
            <td>
              <p style="font-weight:600;color:var(--gray-800);font-size:13px">{{ o.user?.fullname || o.email || '—' }}</p>
              <p style="font-size:11px;color:var(--gray-400)">{{ o.phone || '' }}</p>
            </td>
            <td style="font-size:12px;color:var(--gray-600);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ o.address || '—' }}</td>
            <td style="font-weight:700;color:var(--brand)">{{ fmt(Number(o.total)) }}</td>
            <td>
              <span class="payment-chip">{{ payLabel(o.payment) }}</span>
            </td>
            <td>
              <select :value="o.status" @change="changeStatus(o.id, ($event.target as HTMLSelectElement).value)"
                :class="['status-select', 'status-' + o.status]">
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="shipping">Đang giao</option>
                <option value="delivered">Đã giao</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </td>
            <td style="font-size:12px;color:var(--gray-500)">{{ fmtDate(o.created_at) }}</td>
            <td>
              <div class="row-actions">
                <button @click="viewOrder(o)" class="btn-icon edit" title="Xem chi tiết">
                  <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="store.meta.last_page > 1" class="pagination">
        <span>Trang {{ store.meta.current_page }} / {{ store.meta.last_page }}</span>
        <div class="page-btns">
          <button v-for="pg in store.meta.last_page" :key="pg" @click="goPage(pg)"
            :class="['page-btn', store.meta.current_page === pg && 'active']">{{ pg }}</button>
        </div>
      </div>
    </div>

    <!-- Detail modal -->
    <Teleport to="body">
      <div v-if="detailOrder" class="modal-overlay" @click.self="detailOrder = null">
        <div class="modal-box" style="max-width:560px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h3 style="font-size:15px;font-weight:700;color:var(--gray-800)">Chi tiết đơn #{{ detailOrder.id }}</h3>
            <button @click="detailOrder = null" style="background:none;border:none;cursor:pointer;color:var(--gray-400);font-size:20px">×</button>
          </div>
          <div class="order-detail-grid">
            <div class="od-row"><span class="od-label">Khách hàng</span><span>{{ detailOrder.user?.fullname || detailOrder.email }}</span></div>
            <div class="od-row"><span class="od-label">Email</span><span>{{ detailOrder.email }}</span></div>
            <div class="od-row"><span class="od-label">Điện thoại</span><span>{{ detailOrder.phone }}</span></div>
            <div class="od-row"><span class="od-label">Địa chỉ</span><span>{{ detailOrder.address }}</span></div>
            <div class="od-row"><span class="od-label">Thanh toán</span><span>{{ payLabel(detailOrder.payment) }}</span></div>
            <div class="od-row"><span class="od-label">Ngày đặt</span><span>{{ fmtDate(detailOrder.created_at) }}</span></div>
          </div>
          <div v-if="detailOrder.details && detailOrder.details.length > 0" style="margin-top:16px">
            <p style="font-size:12px;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Sản phẩm</p>
            <table class="table-auto">
              <thead><tr><th>SKU</th><th>Tên SP</th><th>SL</th><th>Giá</th></tr></thead>
              <tbody>
                <tr v-for="d in detailOrder.details" :key="d.id">
                  <td style="font-family:monospace;font-size:11px">{{ d.product_sku_code }}</td>
                  <td style="font-size:12px">{{ d.product_name || '—' }}</td>
                  <td>{{ d.quantity }}</td>
                  <td>{{ d.price ? fmt(d.price) : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:12px;border-top:1px solid var(--gray-100)">
            <span style="font-size:13px;color:var(--gray-500)">Tổng cộng</span>
            <span style="font-size:18px;font-weight:700;color:var(--brand)">{{ fmt(Number(detailOrder.total)) }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/admin/stores/orderStore'
import type { Order } from '@/admin/stores/orderStore'

const store   = useOrderStore()
const filters = ref({ search: '', status: '', payment: '' })
const detailOrder = ref<Order | null>(null)
const hasFilter = computed(() => filters.value.search || filters.value.status || filters.value.payment)

const fmt     = (v: number) => Number(v).toLocaleString('vi-VN') + '₫'
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'
const payLabel = (p: string) => ({ cod: 'COD', bank: 'Chuyển khoản', momo: 'MoMo' }[p] ?? p)

let timer: ReturnType<typeof setTimeout>
function debouncedFetch() { clearTimeout(timer); timer = setTimeout(doFetch, 350) }
function doFetch() { store.fetchAll({ ...filters.value, page: 1 }) }
function goPage(p: number) { store.fetchAll({ ...filters.value, page: p }) }
function clearFilter() { filters.value = { search: '', status: '', payment: '' }; doFetch() }

async function changeStatus(id: number, status: string) {
  await store.updateStatus(id, status)
}

async function viewOrder(o: Order) {
  detailOrder.value = o
  if (!o.details) {
    await store.fetchOne(o.id)
    if (store.current) detailOrder.value = store.current
  }
}

onMounted(() => store.fetchAll())
</script>
