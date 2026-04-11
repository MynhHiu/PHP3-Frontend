<template>
  <div class="review-admin-page">
    <div class="page-header">
      <h1 class="page-title">Quản lý đánh giá</h1>
      <div class="header-stats">
        <span class="stat-badge pending">{{ countByStatus('pending') }} chờ duyệt</span>
        <span class="stat-badge approved">{{ countByStatus('approved') }} đã duyệt</span>
        <span class="stat-badge rejected">{{ countByStatus('rejected') }} từ chối</span>
      </div>
    </div>

    <!-- Filter tabs -->
    <div class="filter-tabs">
      <button
        v-for="f in filters"
        :key="f.value"
        :class="['filter-tab', { active: currentFilter === f.value }]"
        @click="changeFilter(f.value)"
      >{{ f.label }}</button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Đang tải...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="!reviews.length" class="empty-state">
      <div class="empty-icon">📭</div>
      <p>Không có đánh giá nào.</p>
    </div>

    <!-- Table -->
    <div v-else class="review-table-wrap">
      <table class="review-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Sản phẩm</th>
            <th>Khách hàng</th>
            <th>Đánh giá</th>
            <th>Nội dung</th>
            <th>Ngày gửi</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rv in reviews" :key="rv.id">
            <td class="td-id">{{ rv.id }}</td>
            <td class="td-product">
              <div class="product-cell">
                <img :src="rv.product_image || PLACEHOLDER" class="product-thumb" />
                <div>
                  <p class="product-name">{{ rv.product_name || '—' }}</p>
                  <p class="product-sku">{{ rv.product_sku_code }}</p>
                </div>
              </div>
            </td>
            <td class="td-user">
              <div class="user-cell">
                <div class="user-avatar">{{ (rv.user_name || 'K')[0].toUpperCase() }}</div>
                <span>{{ rv.user_name }}</span>
              </div>
            </td>
            <td class="td-rating">
              <div class="stars-row">
                <span v-for="s in 5" :key="s" :class="['star', s <= rv.rating ? 'filled' : '']">★</span>
              </div>
              <span class="rating-num">{{ rv.rating }}/5</span>
            </td>
            <td class="td-comment">
              <p class="comment-text">{{ rv.comment }}</p>
            </td>
            <td class="td-date">{{ formatDate(rv.created_at) }}</td>
            <td class="td-status">
              <span :class="['status-badge', `status-${rv.status}`]">
                {{ statusLabel(rv.status) }}
              </span>
            </td>
            <td class="td-actions">
              <button
                v-if="rv.status === 'pending' || rv.status === 'rejected'"
                class="btn-approve"
                @click="handleApprove(rv.id)"
                :disabled="actionLoading === rv.id"
              >✓ Duyệt</button>
              <button
                v-if="rv.status === 'pending' || rv.status === 'approved'"
                class="btn-reject"
                @click="handleReject(rv.id)"
                :disabled="actionLoading === rv.id"
              >✗ Từ chối</button>
              <button
                class="btn-delete"
                @click="handleDelete(rv.id)"
                :disabled="actionLoading === rv.id"
              >🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.last_page > 1" class="pagination">
      <button
        v-for="p in pagination.last_page"
        :key="p"
        :class="['page-btn', { active: pagination.current_page === p }]"
        @click="loadPage(p)"
      >{{ p }}</button>
    </div>

    <!-- Toast -->
    <transition name="toast-fade">
      <div v-if="toast.show" :class="['toast', toast.type]">{{ toast.message }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { reviewApi } from '@/api'

const PLACEHOLDER = 'https://placehold.co/48x48/e8f5e9/2e7d32?text=SP'

interface Review {
  id: number
  user_name: string
  user_avatar: string | null
  product_sku_code: string
  product_name: string | null
  product_image: string | null
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

interface Pagination {
  current_page: number
  last_page: number
  total: number
}

const reviews      = ref<Review[]>([])
const pagination   = ref<Pagination | null>(null)
const loading      = ref(false)
const actionLoading = ref<number | null>(null)
const currentFilter = ref<string>('pending')

const filters = [
  { value: 'pending',  label: '⏳ Chờ duyệt' },
  { value: 'approved', label: '✅ Đã duyệt' },
  { value: 'rejected', label: '❌ Từ chối' },
  { value: '',         label: '📋 Tất cả' },
]

// Toast
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer: ReturnType<typeof setTimeout>
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  clearTimeout(toastTimer)
  toast.value = { show: true, message: msg, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3000)
}

// Đếm theo status
const allReviews = ref<Review[]>([])
function countByStatus(status: string) {
  return allReviews.value.filter(r => r.status === status).length
}

async function loadAll() {
  try {
    const res = await reviewApi.adminGetAll()
    allReviews.value = res.data?.data ?? []
  } catch {}
}

async function loadPage(page = 1) {
  loading.value = true
  try {
    const params: any = { page }
    if (currentFilter.value) params.status = currentFilter.value
    const res      = await reviewApi.adminGetAll(params)
    reviews.value  = res.data?.data ?? []
    if (res.data?.current_page) {
      pagination.value = {
        current_page: res.data.current_page,
        last_page:    res.data.last_page,
        total:        res.data.total,
      }
    }
  } catch {
    showToast('Không thể tải danh sách đánh giá', 'error')
  } finally {
    loading.value = false
  }
}

function changeFilter(val: string) {
  currentFilter.value = val
  loadPage(1)
}

async function handleApprove(id: number) {
  actionLoading.value = id
  try {
    await reviewApi.approve(id)
    showToast('Đã duyệt đánh giá!')
    await Promise.all([loadPage(), loadAll()])
  } catch {
    showToast('Duyệt thất bại', 'error')
  } finally {
    actionLoading.value = null
  }
}

async function handleReject(id: number) {
  actionLoading.value = id
  try {
    await reviewApi.reject(id)
    showToast('Đã từ chối đánh giá.')
    await Promise.all([loadPage(), loadAll()])
  } catch {
    showToast('Từ chối thất bại', 'error')
  } finally {
    actionLoading.value = null
  }
}

async function handleDelete(id: number) {
  if (!confirm('Bạn có chắc muốn xoá đánh giá này?')) return
  actionLoading.value = id
  try {
    await reviewApi.delete(id)
    showToast('Đã xoá đánh giá.')
    await Promise.all([loadPage(), loadAll()])
  } catch {
    showToast('Xoá thất bại', 'error')
  } finally {
    actionLoading.value = null
  }
}

const statusLabel = (s: string) => ({
  pending:  'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
}[s] ?? s)

const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN')

onMounted(async () => {
  await Promise.all([loadPage(), loadAll()])
})
</script>

<style scoped>
.review-admin-page { padding: 24px; font-family: 'Segoe UI', sans-serif; color: #222; max-width: 1300px; }
.page-header { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.page-title { font-size: 22px; font-weight: 700; color: #1b5e20; margin: 0; }
.header-stats { display: flex; gap: 10px; flex-wrap: wrap; }
.stat-badge { padding: 4px 14px; border-radius: 12px; font-size: 13px; font-weight: 600; }
.stat-badge.pending  { background: #fff8e1; color: #f57f17; }
.stat-badge.approved { background: #e8f5e9; color: #2e7d32; }
.stat-badge.rejected { background: #ffebee; color: #c62828; }
.filter-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.filter-tab { padding: 8px 18px; border-radius: 20px; border: 1.5px solid #ddd; background: #fff; font-size: 13px; cursor: pointer; transition: all .2s; }
.filter-tab.active { background: #2e7d32; border-color: #2e7d32; color: #fff; }
.loading-state { text-align: center; padding: 60px; color: #888; }
.spinner { width: 36px; height: 36px; border: 3px solid #e8f5e9; border-top-color: #2e7d32; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 12px; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 60px; color: #aaa; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.review-table-wrap { overflow-x: auto; border: 1px solid #e0e0e0; border-radius: 10px; }
.review-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.review-table th { background: #f9fbe7; color: #1b5e20; font-weight: 600; padding: 12px 14px; text-align: left; border-bottom: 2px solid #e8f5e9; }
.review-table td { padding: 12px 14px; border-bottom: 1px solid #f5f5f5; vertical-align: top; }
.review-table tr:hover td { background: #fafff8; }
.td-id { color: #aaa; font-size: 12px; white-space: nowrap; }
.product-cell { display: flex; gap: 10px; align-items: flex-start; min-width: 180px; }
.product-thumb { width: 48px; height: 48px; object-fit: contain; border-radius: 6px; border: 1px solid #eee; flex-shrink: 0; }
.product-name { font-size: 13px; font-weight: 500; margin: 0 0 2px; }
.product-sku { font-size: 11px; color: #aaa; margin: 0; }
.user-cell { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
.user-avatar { width: 32px; height: 32px; border-radius: 50%; background: #c8e6c9; color: #2e7d32; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; }
.stars-row { display: flex; gap: 1px; }
.star { font-size: 16px; color: #ddd; }
.star.filled { color: #f5a623; }
.rating-num { font-size: 12px; color: #888; }
.td-comment { max-width: 280px; }
.comment-text { margin: 0; font-size: 13px; color: #444; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
.td-date { white-space: nowrap; font-size: 12px; color: #888; }
.status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; }
.status-pending  { background: #fff8e1; color: #f57f17; }
.status-approved { background: #e8f5e9; color: #2e7d32; }
.status-rejected { background: #ffebee; color: #c62828; }
.td-actions { display: flex; gap: 6px; flex-wrap: wrap; align-items: flex-start; min-width: 130px; }
.btn-approve, .btn-reject, .btn-delete { padding: 5px 10px; border-radius: 5px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: all .2s; }
.btn-approve { background: #e8f5e9; color: #2e7d32; }
.btn-approve:hover:not(:disabled) { background: #2e7d32; color: #fff; }
.btn-reject  { background: #fff3e0; color: #f57c00; }
.btn-reject:hover:not(:disabled)  { background: #f57c00; color: #fff; }
.btn-delete  { background: #ffebee; color: #c62828; }
.btn-delete:hover:not(:disabled)  { background: #c62828; color: #fff; }
.btn-approve:disabled, .btn-reject:disabled, .btn-delete:disabled { opacity: .5; cursor: not-allowed; }
.pagination { display: flex; gap: 6px; margin-top: 20px; flex-wrap: wrap; }
.page-btn { width: 36px; height: 36px; border-radius: 6px; border: 1.5px solid #ddd; background: #fff; cursor: pointer; font-size: 14px; }
.page-btn.active { background: #2e7d32; border-color: #2e7d32; color: #fff; }
.toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,.15); }
.toast.success { background: #2e7d32; color: #fff; }
.toast.error   { background: #c62828; color: #fff; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: all .3s; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>