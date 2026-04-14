<template>
  <div class="page-stack">
    <div class="page-header">
      <div class="page-header-info">
        <h2>Quản lý đơn hàng</h2>
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
        <option value="banking">Chuyển khoản</option>
        <option value="momo">MoMo</option>
        <option value="vnpay">VNPay</option>
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
              <select
                :value="o.status"
                @change="changeStatus(o.id, ($event.target as HTMLSelectElement).value)"
                :class="['status-select', 'status-' + o.status]"
                :disabled="updatingId === o.id || !canChangeStatus(o.status)"
              >
                <option :value="o.status">{{ statusLabel(o.status) }}</option>
                <option v-for="opt in availableStatuses(o.status)" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
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

      <!-- Pagination -->
      <div v-if="store.meta.last_page > 1" class="pagination">
        <span>Trang {{ store.meta.current_page }} / {{ store.meta.last_page }}</span>
        <div class="page-btns">
          <button v-for="pg in store.meta.last_page" :key="pg" @click="goPage(pg)"
            :class="['page-btn', store.meta.current_page === pg && 'active']">{{ pg }}</button>
        </div>
      </div>
    </div>

    <!-- Toast thông báo -->
    <Teleport to="body">
      <div v-if="toast.show" :class="['toast', toast.type]">
        {{ toast.msg }}
      </div>
    </Teleport>

    <!-- Detail modal -->
    <Teleport to="body">
      <div v-if="detailOrder" class="modal-overlay" @click.self="detailOrder = null">
        <div class="modal-box" style="max-width:600px">
          <!-- Header -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h3 style="font-size:15px;font-weight:700;color:var(--gray-800)">Chi tiết đơn #{{ detailOrder.id }}</h3>
            <button @click="detailOrder = null" style="background:none;border:none;cursor:pointer;color:var(--gray-400);font-size:20px">×</button>
          </div>

          <!-- Thông tin khách hàng -->
          <div class="order-detail-grid">
            <div class="od-row"><span class="od-label">Khách hàng</span><span>{{ detailOrder.user?.fullname || detailOrder.email }}</span></div>
            <div class="od-row"><span class="od-label">Email</span><span>{{ detailOrder.email }}</span></div>
            <div class="od-row"><span class="od-label">Điện thoại</span><span>{{ detailOrder.phone }}</span></div>
            <div class="od-row"><span class="od-label">Địa chỉ</span><span>{{ detailOrder.address }}</span></div>
            <div class="od-row"><span class="od-label">Thanh toán</span><span>{{ payLabel(detailOrder.payment) }}</span></div>
            <div class="od-row"><span class="od-label">Ngày đặt</span><span>{{ fmtDate(detailOrder.created_at) }}</span></div>
            <div class="od-row">
              <span class="od-label">Trạng thái</span>
              <span :class="['status-badge', 'status-' + detailOrder.status]">{{ statusLabel(detailOrder.status) }}</span>
            </div>
          </div>

          <!-- Sản phẩm -->
          <div v-if="detailItems.length > 0" style="margin-top:16px">
            <p style="font-size:12px;font-weight:600;color:var(--gray-500);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Sản phẩm</p>
            <table class="table-auto">
              <thead>
                <tr>
                  <th style="width:44px"></th>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th>SL</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in detailItems" :key="d.id">
                  <td>
                    <img
                      :src="d.product_image || 'https://placehold.co/40x40/e8f5e9/2e7d32?text=SP'"
                      style="width:40px;height:40px;object-fit:contain;border-radius:4px;border:1px solid #eee"
                      @error="(e:any) => e.target.src='https://placehold.co/40x40/e8f5e9/2e7d32?text=SP'"
                    />
                  </td>
                  <td style="font-size:12px;font-weight:500">{{ d.product_name || '—' }}</td>
                  <td style="font-family:monospace;font-size:11px;color:var(--gray-500)">{{ d.product_sku_code }}</td>
                  <td>{{ d.quantity }}</td>
                  <td>{{ d.price ? fmt(d.price) : '—' }}</td>
                  <td style="font-weight:600;color:var(--brand)">{{ d.price ? fmt(d.price * d.quantity) : '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Tổng tiền -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:12px;border-top:1px solid var(--gray-100)">
            <span style="font-size:13px;color:var(--gray-500)">Tổng cộng</span>
            <span style="font-size:18px;font-weight:700;color:var(--brand)">{{ fmt(Number(detailOrder.total)) }}</span>
          </div>

          <!-- Nút đổi trạng thái nhanh -->
          <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--gray-100)">
            <p style="font-size:12px;font-weight:600;color:var(--gray-500);margin-bottom:8px">CẬP NHẬT TRẠNG THÁI</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button
                v-for="s in availableStatuses(detailOrder.status)"
                :key="s.value"
                @click="quickChangeStatus(detailOrder.id, s.value)"
                :disabled="updatingId === detailOrder.id"
                :class="['btn-status']"
              >
                {{ s.label }}
              </button>
            </div>
            <div v-if="!canChangeStatus(detailOrder.status)" style="font-size:12px;color:var(--gray-500);margin-top:8px">
              Đơn hàng này đã hoàn tất và không thể thay đổi trạng thái.
            </div>
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
const updatingId  = ref<number | null>(null)

const hasFilter = computed(() => filters.value.search || filters.value.status || filters.value.payment)

// Items từ detail order (ưu tiên items, fallback details)
const detailItems = computed(() => {
  if (!detailOrder.value) return []
  return (detailOrder.value as any).items || detailOrder.value.details || []
})

// Toast
const toast = ref({ show: false, msg: '', type: 'success' })
function showToast(msg: string, type = 'success') {
  toast.value = { show: true, msg, type }
  setTimeout(() => toast.value.show = false, 2500)
}

const fmt     = (v: number) => Number(v).toLocaleString('vi-VN') + '₫'
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'
const payLabel = (p: string) => ({ cod: 'COD', banking: 'Chuyển khoản', momo: 'MoMo', vnpay: 'VNPay' }[p] ?? p)
const statusLabel = (s: string) => ({ pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', shipping: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' }[s] ?? s)

const statusOptions = [
  { value: 'pending',   label: 'Chờ xử lý',    color: '#f59e0b' },
  { value: 'confirmed', label: 'Xác nhận',       color: '#3b82f6' },
  { value: 'shipping',  label: 'Đang giao',      color: '#8b5cf6' },
  { value: 'delivered', label: 'Đã giao',         color: '#10b981' },
  { value: 'cancelled', label: 'Hủy đơn',         color: '#ef4444' },
]

// Computed: các trạng thái có thể chọn dựa trên trạng thái hiện tại
const availableStatuses = computed(() => {
  const all = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'confirmed', label: 'Đã xác nhận' },
    { value: 'shipping', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'cancelled', label: 'Đã hủy' },
  ]

  return (currentStatus: string) => {
    if (currentStatus === 'delivered' || currentStatus === 'cancelled') {
      // Đã giao hoặc đã hủy thì không cho thay đổi nữa
      return []
    }
    if (currentStatus === 'confirmed') {
      // Đã xác nhận thì chỉ cho chuyển sang shipping hoặc delivered
      return all.filter(s => ['shipping', 'delivered'].includes(s.value))
    }
    if (currentStatus === 'shipping') {
      // Đang giao thì chỉ cho chuyển sang delivered
      return all.filter(s => s.value === 'delivered')
    }
    if (currentStatus === 'pending') {
      // Chờ xử lý thì cho chuyển sang confirmed, shipping hoặc cancelled
      return all.filter(s => ['confirmed', 'shipping', 'cancelled'].includes(s.value))
    }
    return all.filter(s => s.value !== currentStatus)
  }
})

// Computed: kiểm tra có thể thay đổi trạng thái không
const canChangeStatus = computed(() => {
  return (status: string) => {
    return status !== 'delivered' && status !== 'cancelled'
  }
})

let timer: ReturnType<typeof setTimeout>
function debouncedFetch() { clearTimeout(timer); timer = setTimeout(doFetch, 350) }
function doFetch() { store.fetchAll({ ...filters.value, page: 1 }) }
function goPage(p: number) { store.fetchAll({ ...filters.value, page: p }) }
function clearFilter() { filters.value = { search: '', status: '', payment: '' }; doFetch() }

async function changeStatus(id: number, status: string) {
  updatingId.value = id
  try {
    await store.updateStatus(id, status)
    showToast(`Đã cập nhật trạng thái: ${statusLabel(status)}`)
    // Nếu đang mở modal đơn đó thì cập nhật luôn
    if (detailOrder.value?.id === id) detailOrder.value.status = status
  } catch (e: any) {
    showToast(e.userMessage || 'Cập nhật thất bại', 'error')
    // Reset select về giá trị cũ
    doFetch()
  } finally {
    updatingId.value = null
  }
}

async function quickChangeStatus(id: number, status: string) {
  await changeStatus(id, status)
}

async function viewOrder(o: Order) {
  detailOrder.value = o
  // Fetch lại để lấy đầy đủ items/details
  await store.fetchOne(o.id)
  if (store.current) detailOrder.value = store.current
}

onMounted(() => store.fetchAll())
</script>

<style scoped>
/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 4px 16px rgba(0,0,0,.15);
  animation: slideUp .25s ease;
}
.toast.success { background: #16a34a; color: #fff; }
.toast.error   { background: #dc2626; color: #fff; }
@keyframes slideUp { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }

/* Status badge (modal) */
.status-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
.status-badge.status-pending   { background:#fef3c7; color:#92400e }
.status-badge.status-confirmed { background:#dbeafe; color:#1e40af }
.status-badge.status-shipping  { background:#ede9fe; color:#5b21b6 }
.status-badge.status-delivered { background:#d1fae5; color:#065f46 }
.status-badge.status-cancelled { background:#fee2e2; color:#991b1b }

/* Status select (table) */
.status-select {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1.5px solid #e0e0e0;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
}
.status-select.status-pending   { background:#fef3c7; color:#92400e; border-color:#fcd34d }
.status-select.status-confirmed { background:#dbeafe; color:#1e40af; border-color:#93c5fd }
.status-select.status-shipping  { background:#ede9fe; color:#5b21b6; border-color:#c4b5fd }
.status-select.status-delivered { background:#d1fae5; color:#065f46; border-color:#6ee7b7 }
.status-select.status-cancelled { background:#fee2e2; color:#991b1b; border-color:#fca5a5 }
.status-select:disabled         { opacity:.6; cursor:default }

/* Nút đổi trạng thái nhanh */
.btn-status {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1.5px solid #e0e0e0;
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  color: var(--gray-700, #374151);
}
.btn-status:hover:not(:disabled) { border-color: var(--brand, #2e7d32); color: var(--brand, #2e7d32) }
.btn-status:disabled { opacity:.5; cursor:default }
.btn-status.active { cursor: default }

/* Payment chip */
.payment-chip {
  display: inline-block;
  padding: 3px 8px;
  background: #f1f5f9;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
}
</style>