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
              @click="cancelOrder(order.id)"
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
import { ref, computed, onMounted } from 'vue'
import { useOrderStore } from '@/user/stores/orderStore'
import { useCartStore } from '@/user/stores/cartStore'

const orderStore = useOrderStore()
const cartStore  = useCartStore()

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

onMounted(() => orderStore.fetchOrders())

// Chuyển đổi order từ store sang format hiển thị
const orders = computed(() =>
  orderStore.orders.map(o => ({
    id:       'ORD' + String(o.id).slice(-8),
    _id:      o.id,
    date:     new Date(o.created_at).toLocaleString('vi-VN'),
    status:   o.status,
    total:    o.total,
    payment:  o.payment,
    address:  o.address,
    products: (o.order_details ?? []).map(d => ({
      name:  d.product?.name  || d.product_sku_code,
      qty:   d.quantity,
      price: (d.product?.price ?? 0) * d.quantity,
      image: d.product?.image_url || `https://placehold.co/60x60/e8f5e9/2e7d32?text=SP`,
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
  const order = orders.value.find(o => o.id === id)
  if (!order) return
  if (confirm('Bạn có chắc muốn huỷ đơn hàng này?')) {
    await orderStore.cancelOrder(order._id)
  }
}

const reviewOrder = (id: string) => alert('Chức năng đánh giá đang phát triển')

const rebuyOrder = async (order: any) => {
  for (const p of order.products) {
    await cartStore.addToCart(p.name, p.qty, {
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
</style>