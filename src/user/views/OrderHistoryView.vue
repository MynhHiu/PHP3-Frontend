<template>
  <div class="order-history-page">
    <div class="breadcrumb">
      <span>Trang chủ</span>
      <span class="sep">›</span>
      <span>Tài khoản</span>
      <span class="sep">›</span>
      <span class="active">Lịch sử đơn hàng</span>
    </div>

    <h1 class="page-title">Lịch sử đơn hàng</h1>

    <!-- Filter tabs -->
    <div class="filter-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span class="tab-count" v-if="countByStatus(tab.key) > 0">{{ countByStatus(tab.key) }}</span>
      </button>
    </div>

    <!-- Search order -->
    <div class="search-row">
      <div class="search-input-wrap">
        <span class="search-icon"></span>
        <input v-model="searchQuery" type="text" placeholder="Tìm kiếm theo mã đơn hàng, tên sản phẩm..." />
      </div>
    </div>

    <!-- Order list -->
    <div v-if="filteredOrders.length === 0" class="empty-state">
      <div class="empty-icon"></div>
      <p>Không có đơn hàng nào</p>
    </div>

    <div v-else class="order-list">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <!-- Order header -->
        <div class="order-card-header">
          <div class="order-meta">
            <span class="order-id">#{{ order.id }}</span>
            <span class="order-date">{{ order.date }}</span>
          </div>
          <div class="order-status-wrap">
            <span :class="['status-badge', `status-${order.status}`]">
              {{ statusLabel(order.status) }}
            </span>
          </div>
        </div>

        <!-- Products preview -->
        <div class="order-products">
          <div v-for="(product, idx) in order.products.slice(0, 2)" :key="idx" class="product-row">
            <img :src="product.image" :alt="product.name" class="product-img" />
            <div class="product-info">
              <p class="product-name">{{ product.name }}</p>
              <p class="product-qty">x{{ product.qty }}</p>
            </div>
            <span class="product-price">{{ formatPrice(product.price) }}đ</span>
          </div>
          <p v-if="order.products.length > 2" class="more-products">
            +{{ order.products.length - 2 }} sản phẩm khác
          </p>
        </div>

        <!-- Order footer -->
        <div class="order-card-footer">
          <div class="order-total">
            <span>Tổng tiền:</span>
            <span class="total-amount">{{ formatPrice(order.total) }}đ</span>
          </div>
          <div class="order-actions">
            <button
              v-if="order.status === 'pending'"
              class="btn-cancel"
              @click="openCancelModal(order.id)"
            >Huỷ đơn</button>
            <button
              v-if="order.status === 'delivered'"
              class="btn-review"
              @click="reviewOrder(order.id)"
            >Đánh giá</button>
            <button
              v-if="order.status === 'delivered'"
              class="btn-rebuy"
              @click="rebuyOrder(order)"
            >Mua lại</button>
            <button class="btn-detail" @click="$router.push(`/order/${order._id}`)">
              Xem chi tiết
            </button>
          </div>
        </div>
        <!-- Lý do huỷ -->
        <div v-if="order.status === 'cancelled' && order.cancelReason" class="cancel-reason-bar">
          <span class="cancel-reason-label">Lý do huỷ:</span>
          <span class="cancel-reason-text">{{ order.cancelReason }}</span>
        </div>
      </div>
    </div>

    <!-- ── MODAL HUỶ ĐƠN ──────────────────────────────────────────────── -->
    <div v-if="showCancelModal" class="modal-overlay" @click.self="closeCancelModal">
      <div class="modal-box">
        <button class="modal-close" @click="closeCancelModal">×</button>
        <h3 class="modal-title cancel-modal-title">Huỷ đơn hàng</h3>
        <p class="cancel-modal-desc">Vui lòng cho chúng tôi biết lý do bạn muốn huỷ đơn hàng này.</p>

        <div class="modal-section">
          <label class="modal-label">Chọn lý do nhanh:</label>
          <div class="quick-reasons">
            <button
              v-for="r in quickReasons"
              :key="r"
              :class="['quick-reason-btn', { active: cancelReason === r }]"
              @click="cancelReason = r"
            >{{ r }}</button>
          </div>
        </div>

        <div class="modal-section">
          <label class="modal-label">Hoặc nhập lý do khác:</label>
          <textarea
            v-model="cancelReason"
            class="modal-textarea"
            rows="3"
            placeholder="Nhập lý do huỷ đơn hàng... (ít nhất 5 ký tự)"
          ></textarea>
          <p v-if="cancelError" class="modal-error">{{ cancelError }}</p>
        </div>

        <div class="modal-actions">
          <button class="btn-modal-cancel" @click="closeCancelModal">Đóng</button>
          <button
            class="btn-modal-submit btn-modal-cancel-confirm"
            @click="submitCancel"
            :disabled="cancelLoading"
          >{{ cancelLoading ? 'Đang xử lý...' : 'Xác nhận huỷ' }}</button>
        </div>
      </div>
    </div>


    <!-- ── MODAL ĐÁNH GIÁ ──────────────────────────────────────────── -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <button class="modal-close" @click="closeModal">×</button>
        <h3 class="modal-title">Đánh giá sản phẩm</h3>

        <!-- Chọn sản phẩm nếu có nhiều -->
        <div v-if="modalProducts.length > 1" class="modal-product-select">
          <label class="modal-label">Chọn sản phẩm muốn đánh giá:</label>
          <div class="modal-product-list">
            <div
              v-for="p in modalProducts"
              :key="p.skuCode"
              :class="['modal-product-item', { active: reviewTarget?.skuCode === p.skuCode, reviewed: reviewedSkus.has(p.skuCode) }]"
              @click="!reviewedSkus.has(p.skuCode) && selectProduct(p)"
            >
              <img :src="p.image" class="modal-product-img" />
              <span class="modal-product-name">{{ p.name }}</span>
              <span v-if="reviewedSkus.has(p.skuCode)" class="tag-reviewed">✓ Đã đánh giá</span>
            </div>
          </div>
        </div>

        <!-- Info sản phẩm đang đánh giá -->
        <div class="modal-product-info" v-if="reviewTarget">
          <img :src="reviewTarget.image" class="modal-product-img-lg" />
          <span class="modal-product-name-lg">{{ reviewTarget.name }}</span>
        </div>

        <div v-if="reviewTarget && !reviewedSkus.has(reviewTarget.skuCode)">
          <!-- Chọn sao -->
          <div class="modal-section">
            <label class="modal-label">Chất lượng sản phẩm</label>
            <div class="star-picker">
              <span
                v-for="s in 5" :key="s"
                :class="['star', { active: s <= (hoverRating || reviewForm.rating) }]"
                @click="reviewForm.rating = s"
                @mouseover="hoverRating = s"
                @mouseleave="hoverRating = 0"
              >{{ s <= (hoverRating || reviewForm.rating) ? '★' : '☆' }}</span>
              <span class="star-label">{{ starLabel(hoverRating || reviewForm.rating) }}</span>
            </div>
          </div>

          <!-- Nội dung -->
          <div class="modal-section">
            <label class="modal-label">Nội dung đánh giá</label>
            <textarea
              v-model="reviewForm.comment"
              class="modal-textarea"
              rows="4"
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            ></textarea>
          </div>

          <p v-if="reviewStore.error" class="modal-error">{{ reviewStore.error }}</p>

          <div v-if="reviewStore.submitStatus === 'success'" class="modal-success">
            🎉 Cảm ơn bạn đã đánh giá! Đánh giá đang chờ admin duyệt.
          </div>

          <div class="modal-actions" v-if="reviewStore.submitStatus !== 'success'">
            <button class="btn-modal-cancel" @click="closeModal">Huỷ</button>
            <button
              class="btn-modal-submit"
              @click="submitReview"
              :disabled="reviewStore.submitStatus === 'loading' || reviewForm.rating === 0"
            >{{ reviewStore.submitStatus === 'loading' ? 'Đang gửi...' : 'Gửi đánh giá' }}</button>
          </div>
          <div class="modal-actions" v-else>
            <button class="btn-modal-submit" @click="closeModal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="page--" class="page-btn">‹</button>
      <button
        v-for="p in totalPages"
        :key="p"
        :class="['page-btn', { active: page === p }]"
        @click="page = p"
      >{{ p }}</button>
      <button :disabled="page >= totalPages" @click="page++" class="page-btn">›</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useOrderStore } from '@/user/stores/orderStore'
import { useCartStore } from '@/user/stores/cartStore'
import { useReviewStore } from '@/user/stores/reviewStore'

const orderStore  = useOrderStore()
const cartStore   = useCartStore()
const reviewStore = useReviewStore()

const activeTab   = ref('all')
const searchQuery = ref('')
const page        = ref(1)
const perPage     = 5

const tabs = [
  { key: 'all',        label: 'Tất cả' },
  { key: 'pending',    label: 'Chờ xác nhận' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipping',   label: 'Đang giao' },
  { key: 'delivered',  label: 'Đã giao' },
  { key: 'cancelled',  label: 'Đã huỷ' },
]

onMounted(async () => {
  await orderStore.fetchOrders()
  await reviewStore.fetchMyReviews()
})

// ── Review modal ──────────────────────────────────────────────────────────────
const showModal    = ref(false)
const hoverRating  = ref(0)
const reviewTarget = ref<{ name: string; image: string; skuCode: string } | null>(null)
const modalProducts = ref<{ name: string; image: string; skuCode: string }[]>([])
const reviewForm   = reactive({ rating: 0, comment: '' })

const starLabel = (n: number) =>
  ['', 'Rất tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng'][n] ?? ''

const reviewedSkus = computed(() => {
  const s = new Set<string>()
  reviewStore.myReviews.forEach(r => s.add(r.product_sku_code))
  return s
})

function reviewOrder(orderId: string) {
  const order = orders.value.find(o => o.id === orderId)
  if (!order) return
  modalProducts.value = order.products.map((p: any) => ({
    name:    p.name,
    image:   p.image,
    skuCode: p.skuCode,
  }))
  // Tự chọn sản phẩm đầu tiên chưa đánh giá
  const first = modalProducts.value.find(p => !reviewedSkus.value.has(p.skuCode))
  reviewTarget.value = first ?? modalProducts.value[0]
  reviewForm.rating  = 0
  reviewForm.comment = ''
  reviewStore.resetSubmit()
  showModal.value    = true
}

function selectProduct(p: { name: string; image: string; skuCode: string }) {
  reviewTarget.value = p
  reviewForm.rating  = 0
  reviewForm.comment = ''
  reviewStore.resetSubmit()
}

function closeModal() {
  showModal.value = false
  reviewStore.resetSubmit()
}

async function submitReview() {
  if (!reviewTarget.value || reviewForm.rating === 0) return
  await reviewStore.submitReview({
    product_sku_code: reviewTarget.value.skuCode,
    rating:           reviewForm.rating,
    comment:          reviewForm.comment,
  })
}

// ── Orders ────────────────────────────────────────────────────────────────────
const orders = computed(() =>
  orderStore.orders.map(o => ({
    id:           'ORD' + String(o.id).slice(-8),
    _id:          o.id,
    date:         new Date(o.created_at).toLocaleString('vi-VN'),
    status:       o.status,
    cancelReason: o.cancel_reason ?? null,
    total:        o.total,
    payment:      o.payment,
    address:      o.address,
    products: (o.items ?? o.order_details ?? []).map((d: any) => ({
      name:    d.product_name || d.product?.name  || d.product_sku_code,
      skuCode: d.product_sku_code,
      qty:     d.quantity,
      price:   (d.price ?? d.product?.price ?? 0) * d.quantity,
      image:   d.product_image || d.product?.image_url || `https://placehold.co/60x60/e8f5e9/2e7d32?text=SP`,
    })),
  }))
)

const statusLabel = (s: string) => ({
  pending:    'Chờ xác nhận',
  processing: 'Đang xử lý',
  shipping:   'Đang giao',
  delivered:  'Đã giao',
  cancelled:  'Đã huỷ',
}[s] || s)

const countByStatus = (tab: string) => {
  if (tab === 'all') return 0
  return orders.value.filter(o => o.status === tab).length
}

const filteredOrders = computed(() => {
  let list = orders.value
  if (activeTab.value !== 'all') list = list.filter(o => o.status === activeTab.value)
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(o =>
      o.id.toLowerCase().includes(q) ||
      o.products.some(p => p.name.toLowerCase().includes(q))
    )
  }
  const start = (page.value - 1) * perPage
  return list.slice(start, start + perPage)
})

const totalPages = computed(() => {
  let list = orders.value
  if (activeTab.value !== 'all') list = list.filter(o => o.status === activeTab.value)
  return Math.ceil(list.length / perPage)
})

const formatPrice = (v: number) => v.toLocaleString('vi-VN')

const cancelOrder = async (id: string) => {
  // kept for backward compat – now uses modal
  openCancelModal(id)
}

// ── Cancel modal ─────────────────────────────────────────────────────────────
const showCancelModal  = ref(false)
const cancelTargetId   = ref<string | null>(null)
const cancelReason     = ref('')
const cancelError      = ref('')
const cancelLoading    = ref(false)

const quickReasons = [
  'Tôi muốn thay đổi địa chỉ giao hàng',
  'Tôi muốn thay đổi sản phẩm',
  'Đặt nhầm sản phẩm / số lượng',
  'Tìm được giá tốt hơn ở nơi khác',
  'Tôi không còn cần sản phẩm này nữa',
]

function openCancelModal(id: string) {
  cancelTargetId.value = id
  cancelReason.value   = ''
  cancelError.value    = ''
  showCancelModal.value = true
}

function closeCancelModal() {
  showCancelModal.value = false
  cancelTargetId.value  = null
}

async function submitCancel() {
  if (!cancelReason.value || cancelReason.value.trim().length < 5) {
    cancelError.value = 'Vui lòng nhập lý do huỷ ít nhất 5 ký tự.'
    return
  }
  const order = orders.value.find(o => o.id === cancelTargetId.value)
  if (!order) return
  cancelLoading.value = true
  cancelError.value   = ''
  try {
    await orderStore.cancelOrder(order._id, cancelReason.value.trim())
    closeCancelModal()
  } catch (err: any) {
    // Interceptor wrap lỗi thành { ...err, userMessage } nên cần lấy đúng chỗ
    cancelError.value =
      err?.response?.data?.errors?.cancel_reason?.[0] ||
      err?.response?.data?.message ||
      err?.userMessage ||
      'Huỷ đơn thất bại.'
  } finally {
    cancelLoading.value = false
  }
}

const rebuyOrder = async (order: any) => {
  for (const p of order.products) {
    await cartStore.addToCart(p.skuCode, p.qty, {
      name:      p.name,
      image_url: p.image,
      price:     p.qty > 0 ? Math.round(p.price / p.qty) : 0,
    })
  }
  alert('Đã thêm sản phẩm vào giỏ hàng!')
}
</script>

<style scoped>
.order-history-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px 16px 60px;
  font-family: 'Segoe UI', sans-serif;
  color: #222;
}

.breadcrumb { font-size: 13px; color: #888; margin-bottom: 12px; }
.breadcrumb .sep { margin: 0 6px; }
.breadcrumb .active { color: #2e7d32; font-weight: 500; }

.page-title { font-size: 22px; font-weight: 700; color: #1b5e20; margin-bottom: 20px; }

.filter-tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e8f5e9;
  margin-bottom: 18px;
  overflow-x: auto;
}
.tab-btn {
  padding: 10px 18px;
  background: none;
  border: none;
  font-size: 14px;
  color: #555;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: all .2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tab-btn.active { color: #2e7d32; border-bottom-color: #2e7d32; font-weight: 600; }
.tab-btn:hover:not(.active) { color: #2e7d32; background: #f1f8f2; }
.tab-count {
  background: #e53935;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
}

.search-row { margin-bottom: 18px; }
.search-input-wrap {
  position: relative;
  max-width: 420px;
}
.search-icon {
  position: absolute;
  left: 11px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 15px;
}
.search-input-wrap input {
  width: 100%;
  padding: 10px 14px 10px 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border .2s;
  box-sizing: border-box;
}
.search-input-wrap input:focus { border-color: #2e7d32; }

.empty-state { text-align: center; padding: 60px 20px; color: #aaa; }
.empty-icon { font-size: 52px; margin-bottom: 12px; }

.order-list { display: flex; flex-direction: column; gap: 14px; }

.order-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow .2s;
}
.order-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,.08); }

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
}
.order-meta { display: flex; align-items: center; gap: 14px; }
.order-id { font-weight: 700; color: #2e7d32; font-size: 14px; }
.order-date { font-size: 13px; color: #888; }

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.status-pending   { background: #fff8e1; color: #f57f17; }
.status-processing{ background: #e3f2fd; color: #1565c0; }
.status-shipping  { background: #e8f5e9; color: #2e7d32; }
.status-delivered { background: #e8f5e9; color: #1b5e20; }
.status-cancelled { background: #ffebee; color: #c62828; }

.order-products { padding: 14px 18px; }
.product-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid #f5f5f5;
}
.product-row:last-of-type { border-bottom: none; }
.product-img {
  width: 56px; height: 56px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #eee;
}
.product-info { flex: 1; }
.product-name { font-size: 13px; font-weight: 500; color: #333; margin-bottom: 3px; }
.product-qty { font-size: 12px; color: #888; }
.product-price { font-size: 14px; font-weight: 600; color: #e53935; }
.more-products { font-size: 13px; color: #888; padding-top: 6px; }

.order-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}
.order-total { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #555; }
.total-amount { font-size: 18px; font-weight: 700; color: #e53935; }
.order-actions { display: flex; gap: 8px; }

.btn-cancel, .btn-review, .btn-rebuy, .btn-detail {
  padding: 7px 14px;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
  border: 1.5px solid;
  transition: all .2s;
  font-weight: 500;
}
.btn-cancel { border-color: #e53935; color: #e53935; background: #fff; }
.btn-cancel:hover { background: #e53935; color: #fff; }
.btn-review { border-color: #f57c00; color: #f57c00; background: #fff; }
.btn-review:hover { background: #f57c00; color: #fff; }
.btn-rebuy { border-color: #2e7d32; color: #2e7d32; background: #fff; }
.btn-rebuy:hover { background: #2e7d32; color: #fff; }
.btn-detail { border-color: #2e7d32; background: #2e7d32; color: #fff; }
.btn-detail:hover { background: #1b5e20; }

.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 28px;
}
.page-btn {
  min-width: 36px; height: 36px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all .2s;
  color: #444;
}
.page-btn:hover:not(:disabled):not(.active) { border-color: #2e7d32; color: #2e7d32; }
.page-btn.active { background: #2e7d32; color: #fff; border-color: #2e7d32; font-weight: 700; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }

@media (max-width: 600px) {
  .order-card-footer { flex-direction: column; gap: 10px; align-items: flex-start; }
  .order-actions { flex-wrap: wrap; }
}

/* ── Modal ─────────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.modal-box {
  background: #fff; border-radius: 12px; padding: 28px;
  width: 90%; max-width: 500px; position: relative;
  box-shadow: 0 8px 32px rgba(0,0,0,.18); max-height: 90vh; overflow-y: auto;
}
.modal-close {
  position: absolute; top: 14px; right: 16px;
  background: none; border: none; font-size: 24px; cursor: pointer; color: #888;
}
.modal-title { font-size: 18px; font-weight: 700; color: #1b5e20; margin: 0 0 16px; }

.modal-product-select { margin-bottom: 16px; }
.modal-product-list { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
.modal-product-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border-radius: 8px; border: 1.5px solid #eee;
  cursor: pointer; transition: all .2s;
}
.modal-product-item:hover:not(.reviewed) { border-color: #f57c00; background: #fff8f0; }
.modal-product-item.active { border-color: #f57c00; background: #fff3e0; }
.modal-product-item.reviewed { opacity: .5; cursor: default; }

.modal-product-info {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 20px; padding: 10px; background: #f9f9f9; border-radius: 8px;
}
.modal-product-img { width: 40px; height: 40px; object-fit: contain; border-radius: 4px; }
.modal-product-img-lg { width: 52px; height: 52px; object-fit: contain; border-radius: 6px; border: 1px solid #eee; }
.modal-product-name { font-size: 13px; color: #555; flex: 1; }
.modal-product-name-lg { font-size: 14px; font-weight: 500; color: #333; }
.tag-reviewed { font-size: 11px; color: #2e7d32; background: #e8f5e9; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }

.modal-section { margin-bottom: 18px; }
.modal-label { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 8px; }
.star-picker { display: flex; align-items: center; gap: 6px; }
.star { font-size: 32px; cursor: pointer; color: #ddd; transition: color .15s; }
.star.active { color: #f5a623; }
.star-label { font-size: 13px; color: #f5a623; font-weight: 600; margin-left: 6px; min-width: 100px; }
.modal-textarea {
  width: 100%; border: 1.5px solid #ddd; border-radius: 8px;
  padding: 10px 12px; font-size: 14px; resize: vertical;
  font-family: inherit; box-sizing: border-box; transition: border-color .2s;
}
.modal-textarea:focus { outline: none; border-color: #2e7d32; }
.modal-error { color: #e53935; font-size: 13px; margin-bottom: 12px; }
.modal-success {
  background: #e8f5e9; color: #2e7d32;
  padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; margin-bottom: 16px;
}
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn-modal-cancel { padding: 10px 20px; border-radius: 6px; border: 1.5px solid #ccc; background: #fff; color: #555; font-size: 14px; cursor: pointer; }
.btn-modal-submit { padding: 10px 24px; border-radius: 6px; border: none; background: #2e7d32; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .2s; }
.btn-modal-submit:hover:not(:disabled) { background: #1b5e20; }
.btn-modal-submit:disabled { background: #a5d6a7; cursor: not-allowed; }

/* ── Cancel modal specifics ─────────────────────────────────────────────────── */
.cancel-modal-title { color: #c62828; }
.cancel-modal-desc { font-size: 13px; color: #666; margin: -8px 0 18px; line-height: 1.5; }

.quick-reasons {
  display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px;
}
.quick-reason-btn {
  padding: 6px 12px; border: 1.5px solid #ddd; border-radius: 20px;
  background: #fff; font-size: 12px; color: #555; cursor: pointer;
  transition: all .2s; white-space: nowrap;
}
.quick-reason-btn:hover { border-color: #e53935; color: #e53935; }
.quick-reason-btn.active { border-color: #e53935; background: #ffebee; color: #c62828; font-weight: 600; }

.btn-modal-cancel-confirm {
  background: #e53935 !important;
}
.btn-modal-cancel-confirm:hover:not(:disabled) { background: #c62828 !important; }
.btn-modal-cancel-confirm:disabled { background: #ef9a9a !important; }

/* ── Cancel reason bar ──────────────────────────────────────────────────────── */
.cancel-reason-bar {
  padding: 8px 18px;
  background: #fff8e1;
  border-top: 1px solid #ffe082;
  font-size: 13px;
  color: #795548;
  display: flex;
  gap: 6px;
  align-items: flex-start;
}
.cancel-reason-label { font-weight: 600; white-space: nowrap; }
.cancel-reason-text { flex: 1; }

</style>