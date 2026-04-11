<template>
  <div class="order-detail-page">

    <div v-if="!order" class="loading-state">
      <div class="loading-icon"></div>
      <p>Đang tải đơn hàng...</p>
    </div>

    <template v-else>
      <div class="breadcrumb">
        <span>Trang chủ</span>
        <span class="sep">›</span>
        <span class="link" @click="$router.push('/order-history')">Lịch sử đơn hàng</span>
        <span class="sep">›</span>
        <span class="active">#{{ order.id }}</span>
      </div>

      <div class="page-header">
        <h1 class="page-title">Chi tiết đơn hàng <span class="order-id-title">#{{ order.id }}</span></h1>
        <span :class="['status-badge', `status-${order.status}`]">{{ statusLabel(order.status) }}</span>
      </div>

      <!-- Timeline trạng thái -->
      <div class="timeline-card">
        <div class="timeline">
          <div
            v-for="(step, idx) in timeline"
            :key="idx"
            :class="['timeline-step', { done: step.done, current: step.current }]"
          >
            <div class="step-icon">{{ step.icon }}</div>
            <div class="step-line" v-if="idx < timeline.length - 1"></div>
            <div class="step-label">{{ step.label }}</div>
            <div class="step-time" v-if="step.time">{{ step.time }}</div>
          </div>
        </div>
      </div>

      <div class="detail-layout">
        <!-- Cột trái -->
        <div class="detail-left">
          <div class="detail-card">
            <h3 class="card-title">Sản phẩm đã đặt</h3>
            <div class="product-list">
              <div v-for="(product, idx) in order.products" :key="idx" class="product-item">
                <img :src="product.image" :alt="product.name" class="product-img" />
                <div class="product-info">
                  <p class="product-name">{{ product.name }}</p>
                  <p class="product-variant" v-if="product.variant">{{ product.variant }}</p>
                  <p class="product-unit-price">Đơn giá: {{ formatPrice(product.price) }}đ</p>
                  <!-- Trạng thái đánh giá cho từng sản phẩm -->
                  <div v-if="order.status === 'delivered'" class="review-status-tag">
                    <span v-if="reviewedSkus.has(product.skuCode)" class="tag-reviewed">✓ Đã đánh giá</span>
                    <span v-else class="tag-not-reviewed">Chưa đánh giá</span>
                  </div>
                </div>
                <div class="product-right">
                  <p class="product-qty">x{{ product.qty }}</p>
                  <p class="product-subtotal">{{ formatPrice(product.price * product.qty) }}đ</p>
                  <!-- Nút đánh giá từng sản phẩm -->
                  <button
                    v-if="order.status === 'delivered' && !reviewedSkus.has(product.skuCode)"
                    class="btn-review-item"
                    @click="openReviewModal(product)"
                  >Đánh giá</button>
                </div>
              </div>
            </div>

            <div class="price-summary">
              <div class="price-row">
                <span>Tạm tính:</span>
                <span>{{ formatPrice(order.subtotal) }}đ</span>
              </div>
              <div class="price-row" v-if="order.discount > 0">
                <span class="discount-lbl">Giảm giá ({{ order.couponCode }}):</span>
                <span class="discount-val">-{{ formatPrice(order.discount) }}đ</span>
              </div>
              <div class="price-row">
                <span>Phí vận chuyển:</span>
                <span :class="order.shippingFee === 0 ? 'free-text' : ''">
                  {{ order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee) + 'đ' }}
                </span>
              </div>
              <div class="price-divider"></div>
              <div class="price-row total-row">
                <span>Tổng cộng:</span>
                <span class="total-val">{{ formatPrice(order.total) }}đ</span>
              </div>
              <div class="price-row payment-method-row">
                <span>Phương thức thanh toán:</span>
                <span class="payment-badge">{{ order.paymentMethod }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cột phải -->
        <div class="detail-right">
          <div class="detail-card">
            <h3 class="card-title">Thông tin giao hàng</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="info-label">Người nhận:</span>
                <span class="info-value">{{ order.shipping.name }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Điện thoại:</span>
                <span class="info-value">{{ order.shipping.phone }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Địa chỉ:</span>
                <span class="info-value">{{ order.shipping.address }}</span>
              </div>
              <div class="info-row" v-if="order.shipping.note">
                <span class="info-label">Ghi chú:</span>
                <span class="info-value note">{{ order.shipping.note }}</span>
              </div>
            </div>
          </div>

          <div class="detail-card">
            <h3 class="card-title">Thông tin đơn hàng</h3>
            <div class="info-list">
              <div class="info-row">
                <span class="info-label">Mã đơn hàng:</span>
                <span class="info-value order-id-badge">#{{ order.id }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ngày đặt:</span>
                <span class="info-value">{{ order.createdAt }}</span>
              </div>
              <div class="info-row" v-if="order.confirmedAt">
                <span class="info-label">Xác nhận lúc:</span>
                <span class="info-value">{{ order.confirmedAt }}</span>
              </div>
              <div class="info-row" v-if="order.deliveredAt">
                <span class="info-label">Giao thành công:</span>
                <span class="info-value">{{ order.deliveredAt }}</span>
              </div>
            </div>
          </div>

          <div class="action-group">
            <button
              v-if="order.status === 'pending'"
              class="btn-action btn-cancel"
              @click="cancelOrder"
            >Huỷ đơn hàng</button>
            <button
              v-if="order.status === 'delivered' && hasUnreviewedProducts"
              class="btn-action btn-review"
              @click="openReviewModal(order.products.find(p => !reviewedSkus.has(p.skuCode))!)"
            >Đánh giá sản phẩm</button>
            <button
              v-if="order.status === 'delivered' || order.status === 'cancelled'"
              class="btn-action btn-rebuy"
              @click="rebuyOrder"
            >Mua lại</button>
            <button class="btn-action btn-back" @click="$router.push('/order-history')">
              ← Quay lại lịch sử
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ── MODAL ĐÁNH GIÁ ──────────────────────────────────────────────────── -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <button class="modal-close" @click="closeModal">×</button>
        <h3 class="modal-title">Đánh giá sản phẩm</h3>

        <div class="modal-product-info" v-if="reviewTarget">
          <img :src="reviewTarget.image" class="modal-product-img" />
          <span class="modal-product-name">{{ reviewTarget.name }}</span>
        </div>

        <!-- Chọn sao -->
        <div class="modal-section">
          <label class="modal-label">Chất lượng sản phẩm</label>
          <div class="star-picker">
            <span
              v-for="s in 5"
              :key="s"
              :class="['star', { active: s <= reviewForm.rating }]"
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

        <!-- Error -->
        <p v-if="reviewStore.error" class="modal-error">{{ reviewStore.error }}</p>

        <!-- Success -->
        <div v-if="reviewStore.submitStatus === 'success'" class="modal-success">
          <span>🎉</span> Cảm ơn bạn đã đánh giá! Đánh giá đang chờ duyệt.
        </div>

        <div class="modal-actions" v-if="reviewStore.submitStatus !== 'success'">
          <button class="btn-modal-cancel" @click="closeModal">Huỷ</button>
          <button
            class="btn-modal-submit"
            @click="submitReview"
            :disabled="reviewStore.submitStatus === 'loading' || reviewForm.rating === 0"
          >
            {{ reviewStore.submitStatus === 'loading' ? 'Đang gửi...' : 'Gửi đánh giá' }}
          </button>
        </div>

        <div class="modal-actions" v-else>
          <button class="btn-modal-submit" @click="closeModal">Đóng</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/user/stores/orderStore'
import { useCartStore } from '@/user/stores/cartStore'
import { useReviewStore } from '@/user/stores/reviewStore'

const route       = useRoute()
const router      = useRouter()
const orderStore  = useOrderStore()
const cartStore   = useCartStore()
const reviewStore = useReviewStore()

// ── Review modal state ─────────────────────────────────────────────────────────
const showModal   = ref(false)
const hoverRating = ref(0)
const reviewTarget = ref<{ name: string; image: string; skuCode: string } | null>(null)
const reviewForm  = reactive({ rating: 0, comment: '' })

const starLabel = (n: number) =>
  ['', 'Rất tệ', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng'][n] ?? ''

function openReviewModal(product: any) {
  reviewTarget.value = product
  reviewForm.rating  = 0
  reviewForm.comment = ''
  reviewStore.resetSubmit()
  showModal.value    = true
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
  // Cập nhật danh sách đã review (reload myReviews đã được gọi trong store)
}

// Set các sku đã được đánh giá
const reviewedSkus = computed(() => {
  const set = new Set<string>()
  reviewStore.myReviews.forEach(r => set.add(r.product_sku_code))
  return set
})

const hasUnreviewedProducts = computed(() =>
  order.value?.products.some((p: any) => !reviewedSkus.value.has(p.skuCode)) ?? false
)

// ── Order ──────────────────────────────────────────────────────────────────────
const rawId = computed(() => {
  const param = String(route.params.id)
  const num = param.startsWith('ORD') ? Number(param.slice(3)) : Number(param)
  return num
})

onMounted(async () => {
  await orderStore.fetchOrder(rawId.value)
  await reviewStore.fetchMyReviews()
})

const order = computed(() => {
  const o = orderStore.current
  if (!o) return null

  const subtotal = (o.items ?? o.order_details ?? []).reduce(
    (s: number, d: any) => s + (d.price ?? d.product?.price ?? 0) * d.quantity, 0
  )
  const shippingFee = subtotal >= 5_000_000 ? 0 : 30_000

  return {
    id:            'ORD' + String(o.id).slice(-8),
    _id:           o.id,
    status:        o.status,
    createdAt:     new Date(o.created_at).toLocaleString('vi-VN'),
    confirmedAt:   null as string | null,
    deliveredAt:   null as string | null,
    couponCode:    '',
    subtotal,
    discount:      0,
    shippingFee,
    total:         o.total || (subtotal + shippingFee),
    paymentMethod: ({
      cod:     'Thanh toán khi nhận hàng (COD)',
      banking: 'Chuyển khoản ngân hàng',
      momo:    'Ví MoMo',
      vnpay:   'VNPay / Thẻ ATM',
    } as any)[o.payment] || o.payment,
    shipping: {
      name:    o.email,
      phone:   o.phone,
      address: o.address,
      note:    '',
    },
    products: (o.items ?? o.order_details ?? []).map((d: any) => ({
      name:    d.product_name || d.product?.name  || d.product_sku_code,
      skuCode: d.product_sku_code,
      variant: '',
      image:   d.product_image || d.product?.image_url || 'https://placehold.co/80x80/e8f5e9/2e7d32?text=SP',
      price:   d.price ?? d.product?.price ?? 0,
      qty:     d.quantity,
    })),
  }
})

const timeline = computed(() => {
  const status = order.value?.status ?? 'pending'
  const steps = [
    { key: 'pending',    icon: '🛒', label: 'Đặt hàng',  time: order.value?.createdAt   ?? null },
    { key: 'confirmed',  icon: '✅', label: 'Xác nhận',  time: order.value?.confirmedAt ?? null },
    { key: 'processing', icon: '📦', label: 'Đóng gói',  time: null },
    { key: 'shipping',   icon: '🚚', label: 'Đang giao', time: null },
    { key: 'delivered',  icon: '🏠', label: 'Đã giao',   time: order.value?.deliveredAt ?? null },
  ]
  const flow = ['pending', 'confirmed', 'processing', 'shipping', 'delivered']
  const currentIdx = flow.indexOf(status)
  return steps.map((s, idx) => ({
    ...s,
    done:    idx < currentIdx,
    current: flow[idx] === status,
  }))
})

const statusLabel = (s: string) => ({
  pending:    'Chờ xác nhận',
  processing: 'Đang xử lý',
  shipping:   'Đang giao',
  delivered:  'Đã giao',
  cancelled:  'Đã huỷ',
}[s] || s)

const formatPrice = (v: number) => v.toLocaleString('vi-VN')

const cancelOrder = async () => {
  if (!order.value) return
  if (confirm('Bạn có chắc muốn huỷ đơn hàng này?')) {
    await orderStore.cancelOrder(order.value._id)
    await orderStore.fetchOrder(order.value._id)
  }
}

const rebuyOrder = async () => {
  if (!order.value) return
  for (const p of order.value.products) {
    await cartStore.addToCart(p.skuCode, p.qty, {
      name:      p.name,
      image_url: p.image,
      price:     p.price,
    })
  }
  router.push('/cart')
}
</script>

<style scoped>
.order-detail-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 16px 60px;
  font-family: 'Segoe UI', sans-serif;
  color: #222;
}
.loading-state { text-align: center; padding: 80px 20px; color: #888; }
.loading-icon { font-size: 52px; margin-bottom: 16px; }
.breadcrumb { font-size: 13px; color: #888; margin-bottom: 12px; }
.breadcrumb .sep { margin: 0 6px; }
.breadcrumb .active { color: #2e7d32; font-weight: 500; }
.breadcrumb .link { color: #2e7d32; cursor: pointer; text-decoration: underline; }
.page-header { display: flex; align-items: center; gap: 14px; margin-bottom: 20px; flex-wrap: wrap; }
.page-title { font-size: 22px; font-weight: 700; color: #1b5e20; margin: 0; }
.order-id-title { color: #2e7d32; }
.status-badge { padding: 5px 14px; border-radius: 14px; font-size: 13px; font-weight: 600; }
.status-pending   { background: #fff8e1; color: #f57f17; }
.status-processing{ background: #e3f2fd; color: #1565c0; }
.status-shipping  { background: #e8f5e9; color: #2e7d32; }
.status-delivered { background: #e8f5e9; color: #1b5e20; }
.status-cancelled { background: #ffebee; color: #c62828; }
.timeline-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px 28px; margin-bottom: 20px; }
.timeline { display: flex; align-items: flex-start; justify-content: space-between; position: relative; }
.timeline-step { display: flex; flex-direction: column; align-items: center; flex: 1; position: relative; }
.step-icon { width: 44px; height: 44px; border-radius: 50%; background: #f5f5f5; border: 2px solid #ddd; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 8px; z-index: 2; transition: all .3s; }
.timeline-step.done .step-icon { background: #e8f5e9; border-color: #2e7d32; }
.timeline-step.current .step-icon { background: #2e7d32; border-color: #1b5e20; box-shadow: 0 0 0 4px rgba(46,125,50,.2); }
.step-line { position: absolute; top: 22px; left: 50%; width: 100%; height: 2px; background: #ddd; z-index: 1; }
.timeline-step.done .step-line { background: #2e7d32; }
.step-label { font-size: 12px; font-weight: 500; color: #888; text-align: center; }
.timeline-step.done .step-label, .timeline-step.current .step-label { color: #2e7d32; font-weight: 600; }
.step-time { font-size: 11px; color: #aaa; margin-top: 3px; text-align: center; }
.detail-layout { display: grid; grid-template-columns: 1fr 340px; gap: 16px; align-items: start; }
.detail-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 16px; }
.detail-card:last-of-type { margin-bottom: 0; }
.card-title { font-size: 15px; font-weight: 700; color: #1b5e20; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid #e8f5e9; }
.product-list { margin-bottom: 16px; }
.product-item { display: flex; gap: 14px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
.product-item:last-child { border-bottom: none; }
.product-img { width: 76px; height: 76px; object-fit: contain; border: 1px solid #eee; border-radius: 6px; }
.product-info { flex: 1; }
.product-name { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.product-variant { font-size: 12px; color: #888; margin-bottom: 4px; }
.product-unit-price { font-size: 12px; color: #aaa; }
.review-status-tag { margin-top: 6px; }
.tag-reviewed { font-size: 11px; color: #2e7d32; background: #e8f5e9; padding: 2px 8px; border-radius: 10px; }
.tag-not-reviewed { font-size: 11px; color: #f57c00; background: #fff3e0; padding: 2px 8px; border-radius: 10px; }
.product-right { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.product-qty { font-size: 13px; color: #888; }
.product-subtotal { font-size: 15px; font-weight: 700; color: #e53935; }
.btn-review-item { font-size: 12px; padding: 4px 10px; border-radius: 5px; border: 1.5px solid #f57c00; color: #f57c00; background: #fff; cursor: pointer; transition: all .2s; }
.btn-review-item:hover { background: #f57c00; color: #fff; }
.price-summary { border-top: 1px solid #f0f0f0; padding-top: 14px; }
.price-row { display: flex; justify-content: space-between; font-size: 14px; padding: 5px 0; color: #555; }
.discount-lbl { color: #2e7d32; }
.discount-val { color: #2e7d32; font-weight: 600; }
.free-text { color: #2e7d32; font-weight: 600; }
.price-divider { border-top: 1px dashed #ddd; margin: 8px 0; }
.total-row { font-size: 16px; font-weight: 600; }
.total-val { font-size: 22px; font-weight: 800; color: #e53935; }
.payment-method-row { margin-top: 8px; padding-top: 8px; border-top: 1px solid #f5f5f5; }
.payment-badge { font-size: 12px; background: #e8f5e9; color: #2e7d32; padding: 3px 10px; border-radius: 10px; font-weight: 500; }
.info-list { display: flex; flex-direction: column; gap: 10px; }
.info-row { display: flex; gap: 10px; }
.info-label { font-size: 13px; color: #888; min-width: 110px; }
.info-value { font-size: 14px; color: #333; font-weight: 500; }
.info-value.note { color: #666; font-style: italic; font-weight: 400; }
.order-id-badge { color: #2e7d32; font-weight: 700; }
.action-group { display: flex; flex-direction: column; gap: 10px; }
.btn-action { width: 100%; padding: 12px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; border: 1.5px solid; transition: all .2s; }
.btn-cancel { background: #fff; border-color: #e53935; color: #e53935; }
.btn-cancel:hover { background: #e53935; color: #fff; }
.btn-review { background: #fff; border-color: #f57c00; color: #f57c00; }
.btn-review:hover { background: #f57c00; color: #fff; }
.btn-rebuy { background: #2e7d32; border-color: #2e7d32; color: #fff; }
.btn-rebuy:hover { background: #1b5e20; }
.btn-back { background: #fff; border-color: #ccc; color: #555; }
.btn-back:hover { border-color: #2e7d32; color: #2e7d32; }

/* ── Modal ──────────────────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center; z-index: 999;
}
.modal-box {
  background: #fff; border-radius: 12px; padding: 28px;
  width: 90%; max-width: 480px; position: relative;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
}
.modal-close {
  position: absolute; top: 14px; right: 16px;
  background: none; border: none; font-size: 24px; cursor: pointer; color: #888;
}
.modal-title { font-size: 18px; font-weight: 700; color: #1b5e20; margin: 0 0 16px; }
.modal-product-info { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding: 10px; background: #f9f9f9; border-radius: 8px; }
.modal-product-img { width: 52px; height: 52px; object-fit: contain; border-radius: 6px; border: 1px solid #eee; }
.modal-product-name { font-size: 14px; font-weight: 500; color: #333; }
.modal-section { margin-bottom: 18px; }
.modal-label { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 8px; }
.star-picker { display: flex; align-items: center; gap: 6px; }
.star { font-size: 32px; cursor: pointer; color: #ddd; transition: color .15s; line-height: 1; }
.star.active, .star:hover { color: #f5a623; }
.star-label { font-size: 13px; color: #f5a623; font-weight: 600; margin-left: 6px; min-width: 100px; }
.modal-textarea {
  width: 100%; border: 1.5px solid #ddd; border-radius: 8px;
  padding: 10px 12px; font-size: 14px; resize: vertical;
  font-family: inherit; transition: border-color .2s;
  box-sizing: border-box;
}
.modal-textarea:focus { outline: none; border-color: #2e7d32; }
.modal-error { color: #e53935; font-size: 13px; margin-bottom: 12px; }
.modal-success { background: #e8f5e9; color: #2e7d32; padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; margin-bottom: 16px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.btn-modal-cancel { padding: 10px 20px; border-radius: 6px; border: 1.5px solid #ccc; background: #fff; color: #555; font-size: 14px; cursor: pointer; }
.btn-modal-submit { padding: 10px 24px; border-radius: 6px; border: none; background: #2e7d32; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .2s; }
.btn-modal-submit:hover:not(:disabled) { background: #1b5e20; }
.btn-modal-submit:disabled { background: #a5d6a7; cursor: not-allowed; }

@media (max-width: 768px) {
  .detail-layout { grid-template-columns: 1fr; }
  .timeline { gap: 0; }
  .step-icon { width: 34px; height: 34px; font-size: 14px; }
}
</style>