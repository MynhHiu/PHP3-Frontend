<template>
  <div class="product-detail-page">

    <!-- ── BREADCRUMB ─────────────────────────────────────────── -->
    <div class="u-container breadcrumb-bar">
      <router-link to="/">Trang chủ</router-link>
      <span class="bc-sep">›</span>
      <router-link to="/">Sản phẩm</router-link>
      <span class="bc-sep">›</span>
      <span class="bc-current">{{ product?.name || 'Chi tiết sản phẩm' }}</span>
    </div>

    <!-- ── LOADING ────────────────────────────────────────────── -->
    <div v-if="loading" class="pd-loading">
      <div class="pd-spinner"></div>
      <span>Đang tải sản phẩm...</span>
    </div>

    <!-- ── ERROR ──────────────────────────────────────────────── -->
    <div v-else-if="error" class="pd-error">
      <div class="pd-error-icon">⚠</div>
      <h3>Không tìm thấy sản phẩm</h3>
      <p>{{ error }}</p>
      <router-link to="/" class="pd-back-btn">← Quay về trang chủ</router-link>
    </div>

    <!-- ── MAIN DETAIL ─────────────────────────────────────────── -->
    <div v-else-if="product" class="u-container pd-main">

      <!-- LEFT: Images -->
      <div class="pd-gallery">
        <!-- Main Image -->
        <div class="pd-main-img-wrap">
          <div class="pd-badges">
            <!-- <span v-if="selectedSku && originalPrice > selectedSku.price" class="pd-badge-sale">
              -{{ discountPercent }}%
            </span>
            <span class="pd-badge-new">MỚI</span> -->
          </div>
          <img :src="activeImage || product.image_url || PLACEHOLDER" :alt="product.name" class="pd-main-img"
            @error="(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER)" />
          <div class="pd-zoom-hint">Hover để xem</div>
        </div>

        <!-- Thumbnail strip -->
        <div class="pd-thumbs" v-if="allImages.length > 1">
          <button v-for="(img, i) in allImages" :key="i" :class="['pd-thumb', { active: activeImage === img }]"
            @click="activeImage = img">
            <img :src="img" :alt="`Ảnh ${i + 1}`" @error="(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER)" />
          </button>
        </div>

        <!-- Trust badges -->
        <div class="pd-trust-row">
          <div class="pd-trust-item">
            <span class="pd-trust-ico">🛡</span>
            <span>Bảo hành 24 tháng</span>
          </div>
          <div class="pd-trust-item">
            <span class="pd-trust-ico">↺</span>
            <span>Đổi trả 30 ngày</span>
          </div>
          <div class="pd-trust-item">
            <span class="pd-trust-ico">⛟</span>
            <span>Giao hàng nhanh</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Info -->
      <div class="pd-info">
        <!-- Brand & Category -->
        <div class="pd-meta-tags">
          <span v-if="product.brand" class="pd-brand-tag">{{ product.brand.name }}</span>
          <span v-if="product.category" class="pd-cat-tag">{{ product.category.name }}</span>
        </div>

        <!-- Product name -->
        <h1 class="pd-title">{{ product.name }}</h1>

        <!-- Rating -->
        <!-- <div class="pd-rating-row">
          <div class="pd-stars">
            <span v-for="s in 5" :key="s" :class="['pd-star', s <= rating ? 'filled' : '']">★</span>
          </div>
          <span class="pd-rating-val">{{ rating }}/5</span>
          <span class="pd-review-count">({{ reviewCount }} đánh giá)</span>
          <span class="pd-divider">|</span>
          <span class="pd-sold-count">Đã bán: {{ soldCount }}</span>
        </div> -->

        <!-- Price -->
        <div class="pd-price-box">
          <div class="pd-price-main">
            {{ fmt(Math.floor(Number(selectedSku?.price ?? product.price ?? 0))) }}<span class="pd-currency">đ</span>
          </div>

          <!-- <div v-if="originalPrice > (selectedSku?.price ?? product.price ?? 0)" class="pd-price-old-row">
          <span class="pd-price-old">{{ fmt(Math.floor(originalPrice)) }}đ</span>
          <span class="pd-discount-badge">
            Tiết kiệm {{ fmt(Math.floor(originalPrice - (selectedSku?.price ?? product.price ?? 0))) }}đ
          </span>
        </div> -->
        </div>

        <!-- Thay toàn bộ khối variant selection -->
        <div v-if="product.variants && product.variants.length > 0" class="pd-variant-section">
          <template v-for="variant in product.variants" :key="variant.id">
            <div v-if="variant?.options?.length > 1" class="pd-variant-group">
              <div class="pd-section-label">
                {{ variant.variant_name }}:
                <span class="pd-selected-label">
                  {{ selectedOptions[variant.id]?.option_values ?? 'Chưa chọn' }}
                </span>
              </div>
              <div class="pd-option-list">
                <button v-for="option in variant.options" :key="option.id" :class="[
                  'pd-option-btn',
                  { active: selectedOptions[variant.id]?.id === option.id },
                  { disabled: !isOptionAvailable(option.id) }
                ]" :disabled="!isOptionAvailable(option.id)" @click="selectOption(variant.id, option)">
                  {{ option.option_values }}
                </button>
              </div>
            </div>
          </template>
        </div>

        <!-- Fallback: hiển thị SKU cũ nếu không có variant -->
        <div v-else-if="product.skus && product.skus.length > 1" class="pd-sku-section">
          <div class="pd-section-label">Phiên bản:</div>
          <div class="pd-sku-list">
            <button v-for="sku in product.skus" :key="sku.sku_code"
              :class="['pd-sku-btn', { active: selectedSku?.sku_code === sku.sku_code, 'out-of-stock': sku.quantity === 0 }]"
              @click="selectedSku = sku" :disabled="sku.quantity === 0">
              <span class="pd-sku-code">{{ sku.sku_code }}</span>
              <span class="pd-sku-price">{{ fmt(Number(sku.price)) }}đ</span>
              <span v-if="sku.quantity === 0" class="pd-sku-oos">Hết hàng</span>
            </button>
          </div>
        </div>

        <!-- Quantity -->
        <div class="pd-qty-section">
          <div class="pd-section-label">Số lượng:</div>
          <div class="pd-qty-row">
            <div class="pd-qty-ctrl">
              <button class="pd-qty-btn" @click="qty > 1 && qty--" :disabled="qty <= 1">−</button>
              <input type="number" v-model.number="qty" min="1" :max="maxQty" class="pd-qty-input" />
              <button class="pd-qty-btn" @click="qty < maxQty && qty++" :disabled="qty >= maxQty">+</button>
            </div>
            <span class="pd-stock-info">
              <span v-if="maxQty > 0" class="in-stock">
                ✓ Còn {{ maxQty }} sản phẩm
              </span>
              <span v-else class="out-stock">✗ Hết hàng</span>
            </span>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="pd-actions">
          <button class="pd-btn-cart" @click="handleAddToCart" :disabled="maxQty === 0 || addingToCart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
            </svg>
            {{ addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng' }}
          </button>
          <button class="pd-btn-buy" @click="handleBuyNow" :disabled="maxQty === 0 || addingToCart">
            Mua ngay
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        <!-- Wishlist & Share -->
        <div class="pd-secondary-actions">
          <button class="pd-secondary-btn" @click="toggleWishlist">
            <span :class="['pd-heart', { active: isWishlisted }]">♥</span>
            {{ isWishlisted ? 'Đã yêu thích' : 'Yêu thích' }}
          </button>
          <button class="pd-secondary-btn" @click="handleShare">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Chia sẻ
          </button>
        </div>

        <!-- Policy strip -->
        <div class="pd-policy-strip">
          <div class="pd-policy-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <div>
              <strong>Chính hãng 100%</strong>
              <span>Sản phẩm chính hãng có tem niêm phong</span>
            </div>
          </div>
          <div class="pd-policy-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="1" y="3" width="15" height="13" />
              <path d="M16 8h4l3 5v3h-7V8z" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <div>
              <strong>Giao hàng toàn quốc</strong>
              <span>Miễn phí vận chuyển đơn hàng từ 5 triệu</span>
            </div>
          </div>
          <div class="pd-policy-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            <div>
              <strong>Đổi trả dễ dàng</strong>
              <span>Hoàn tiền 100% nếu hàng lỗi trong 30 ngày</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── TAB SECTION: Description / Specs / Reviews ─────────── -->
    <div v-if="product" class="u-container pd-tabs-section">
      <div class="pd-tabs-header">
        <button v-for="tab in tabs" :key="tab.key" :class="['pd-tab', { active: activeTab === tab.key }]"
          @click="activeTab = tab.key">
          {{ tab.label }}
        </button>
      </div>

      <!-- Description -->
      <div v-if="activeTab === 'desc'" class="pd-tab-desc">
        <div v-if="product.description" class="pd-desc-text" v-html="formattedDesc"></div>
        <div v-else class="pd-desc-placeholder">
          <p>Sản phẩm <strong>{{ product.name }}</strong> từ thương hiệu <strong>{{ product.brand?.name || 'GreenElectric'}}</strong>.</p>
        </div>
      </div>

      <!-- Specs -->
      <div v-if="activeTab === 'specs'" class="pd-tab-specs">
        <table class="spec-table">
          <tbody>
            <tr v-if="product.brand">
              <td class="spec-key">Thương hiệu</td>
              <td class="spec-val">{{ product.brand.name }}</td>
            </tr>
            <tr v-if="product.category">
              <td class="spec-key">Danh mục</td>
              <td class="spec-val">{{ product.category.name }}</td>
            </tr>
            <tr v-for="spec in mockSpecs" :key="spec.key">
              <td class="spec-key">{{ spec.key }}</td>
              <td class="spec-val">{{ spec.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Reviews -->
      <div v-if="activeTab === 'reviews'" class="pd-tab-reviews">
        <div class="pd-rating-summary">
          <div class="pd-rating-big">
            <div class="pd-rating-number">{{ rating }}</div>
            <div class="pd-rating-stars-big">
              <span v-for="s in 5" :key="s" :class="['pd-rv-star-lg', s <= rating ? 'filled' : '']">★</span>
            </div>
            <div class="pd-rating-label">{{ reviewCount }} đánh giá</div>
          </div>
          <div class="pd-rating-bars">
            <div v-for="bar in ratingBars" :key="bar.star" class="pd-rating-bar-row">
              <span class="pd-bar-star">{{ bar.star }}★</span>
              <div class="pd-bar-track">
                <div class="pd-bar-fill" :style="{ width: bar.percent + '%' }"></div>
              </div>
              <span class="pd-bar-count">{{ bar.count }}</span>
            </div>
          </div>
        </div>
        <div class="pd-review-list">
          <div v-for="(rv, i) in mockReviews" :key="i" class="pd-review-item">
            <div class="pd-rv-header">
              <div class="pd-rv-avatar">{{ rv.name[0] }}</div>
              <div class="pd-rv-meta">
                <strong class="pd-rv-name">{{ rv.name }}</strong>
                <div class="pd-rv-stars">
                  <span v-for="s in 5" :key="s" :class="['pd-rv-star', s <= rv.rating ? 'filled' : '']">★</span>
                </div>
              </div>
              <span class="pd-rv-date">{{ rv.date }}</span>
            </div>
            <p class="pd-rv-text">{{ rv.text }}</p>
            <div v-if="rv.verified" class="pd-rv-verified">✓ Đã mua sản phẩm</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── RELATED PRODUCTS ───────────────────────────────────── -->
    <div v-if="relatedProducts.length > 0" class="u-container pd-related">
      <div class="pd-related-header">
        <h2 class="pd-related-title">Sản phẩm liên quan</h2>
        <router-link to="/" class="pd-related-all">Xem tất cả →</router-link>
      </div>
      <div class="pd-related-grid">
        <div v-for="rp in relatedProducts" :key="rp.id" class="pd-rel-card" @click="$router.push(`/products/${rp.id}`)">
          <div class="pd-rel-img-wrap">
            <img :src="rp.image_url || PLACEHOLDER" :alt="rp.name"
              @error="(e) => ((e.target as HTMLImageElement).src = PLACEHOLDER)" />
          </div>
          <div class="pd-rel-info">
            <div class="pd-rel-name">{{ rp.name }}</div>
            <div class="pd-rel-price">{{ fmt(rp.price || 0) }}đ</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── TOAST ──────────────────────────────────────────────── -->
    <transition name="toast-fade">
      <div v-if="toast.show" :class="['pd-toast', toast.type]">
        {{ toast.message }}
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductUserStore, type ProductSku } from '@/user/stores/productUserStore'
import { useCartStore } from '@/user/stores/cartStore'
import { useAuthStore } from '@/user/stores/authStore'

const route = useRoute()
const router = useRouter()
const productStore = useProductUserStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const PLACEHOLDER = 'https://placehold.co/500x500/e8f5e9/2d8c4e?text=SP'

/* ── Toast ─────────────────────────────────────────────────── */
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer: ReturnType<typeof setTimeout>
function showToast(msg: string, type: 'success' | 'error' | 'warning' = 'success') {
  clearTimeout(toastTimer)
  toast.value = { show: true, message: msg, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3000)
}

/* ── Store state (dữ liệu thật từ API) ─────────────────────── */
const product = computed(() => productStore.detail)
const loading = computed(() => productStore.loading)
const error = computed(() => {
  if (productStore.loading || productStore.detail) return null
  return productStore.error ?? null
})

/* ── Gallery ────────────────────────────────────────────────── */
const activeImage = ref<string>('')
const allImages = computed<string[]>(() => {
  const imgs: string[] = []
  if (product.value?.image_url) imgs.push(product.value.image_url)
  if (product.value?.images)
    product.value.images.forEach((i: any) => { if (!imgs.includes(i.url)) imgs.push(i.url) })
  return imgs
})

/* ── SKU selection ──────────────────────────────────────────── */
const selectedSku = ref<ProductSku | null>(null)

import type { VariantOption } from '@/user/stores/productUserStore'

// ── Variant selection state ──────────────────────────────────
// key = variant.id, value = option được chọn
const selectedOptions = ref<Record<number, VariantOption>>({})

// Tính SKU hiện tại dựa theo combination_map
const resolvedSku = computed(() => {
  if (!product.value?.variants?.length || !product.value?.combination_map) return null
  const selectedOptionIds = Object.values(selectedOptions.value).map(o => o.id)
  if (selectedOptionIds.length === 0) return null

  // Tìm SKU mà TẤT CẢ option đã chọn đều map vào
  const map = product.value.combination_map
  const skuCandidates = map
    .filter(c => selectedOptionIds.includes(c.option_id))
    .reduce<Record<string, number>>((acc, c) => {
      acc[c.sku_code] = (acc[c.sku_code] || 0) + 1
      return acc
    }, {})

  const matchSku = Object.entries(skuCandidates).find(
    ([, count]) => count === selectedOptionIds.length
  )?.[0]

  return product.value.skus?.find(s => s.sku_code === matchSku) ?? null
})

// Kiểm tra 1 option có tạo ra SKU hợp lệ không (còn hàng)
function isOptionAvailable(optionId: number): boolean {
  if (!product.value?.combination_map || !product.value?.skus) return true
  const map = product.value.combination_map
  // Lấy tất cả sku_code của option này
  const skuCodes = map.filter(c => c.option_id === optionId).map(c => c.sku_code)
  // Kiểm tra có sku nào còn hàng không
  return skuCodes.some(code => {
    const sku = product.value!.skus!.find(s => s.sku_code === code)
    return sku && sku.quantity > 0
  })
}

function selectOption(variantId: number, option: VariantOption) {
  selectedOptions.value = { ...selectedOptions.value, [variantId]: option }
  // Cập nhật selectedSku theo combination
  const sku = resolvedSku.value
  if (sku) selectedSku.value = sku
}
const qty = ref(1)
const maxQty = computed(() => selectedSku.value?.quantity ?? product.value?.quantity ?? 0)
const addingToCart = ref(false)

const originalPrice = computed(() => {
  const cur = Number(selectedSku.value?.price ?? product.value?.price ?? 0)
  return Math.round(cur * 1.2)
})
const discountPercent = computed(() => {
  const cur = Number(selectedSku.value?.price ?? product.value?.price ?? 0)
  const ori = originalPrice.value
  if (!ori || !cur) return 0
  return Math.round(((ori - cur) / ori) * 100)
})

/* ── Rating / Review data (static) ─────────────────────────── */
const rating = ref(4)
const reviewCount = ref(128)
const soldCount = ref(342)
const isWishlisted = ref(false)

const ratingBars = computed(() => [
  { star: 5, count: 72, percent: 56 },
  { star: 4, count: 38, percent: 30 },
  { star: 3, count: 12, percent: 9 },
  { star: 2, count: 4, percent: 3 },
  { star: 1, count: 2, percent: 2 },
])

const mockReviews = [
  {
    name: 'Nguyễn Minh Tuấn', rating: 5, date: '15/03/2025', verified: true,
    text: 'Sản phẩm chất lượng tốt, giao hàng nhanh, đóng gói cẩn thận. Dùng được 1 tháng vẫn hoạt động tốt. Rất hài lòng!'
  },
  {
    name: 'Trần Thị Lan', rating: 4, date: '08/03/2025', verified: true,
    text: 'Hàng đúng mô tả, giá hợp lý. Shipper nhiệt tình. Sẽ ủng hộ shop lần sau.'
  },
  {
    name: 'Lê Quốc Bảo', rating: 5, date: '01/03/2025', verified: false,
    text: 'Tuyệt vời! Chất lượng vượt kỳ vọng. Hỗ trợ lắp đặt chuyên nghiệp, nhân viên thân thiện.'
  },
]

/* ── Tabs ───────────────────────────────────────────────────── */
const activeTab = ref('desc')
const tabs = [
  { key: 'desc', label: 'Mô tả sản phẩm' },
  { key: 'specs', label: 'Thông số kỹ thuật' },
  { key: 'reviews', label: `Đánh giá (${reviewCount.value})` },
]

const formattedDesc = computed(() =>
  product.value?.description
    ? product.value.description.replace(/\n/g, '<br/>')
    : ''
)

const mockSpecs = computed(() => [
  { key: 'Xuất xứ', value: 'Chính hãng' },
  { key: 'Bảo hành', value: '24 tháng' },
  { key: 'Tình trạng', value: 'Mới 100%' },
  { key: 'Tiêu chuẩn', value: 'CE, ISO 9001' },
  { key: 'Màu sắc', value: 'Trắng / Bạc' },
  { key: 'Điện áp', value: '220V – 50Hz' },
])

/* ── Related products (từ store) ────────────────────────────── */
const relatedProducts = computed(() => {
  return productStore.products
    .filter((p: any) => p.id !== product.value?.id)
    .slice(0, 5)
})

/* ── Helpers ────────────────────────────────────────────────── */
function fmt(n: number) {
  return n.toLocaleString('vi-VN')
}

/* ── Actions ────────────────────────────────────────────────── */
async function handleAddToCart() {
  if (!authStore.token) {
    showToast('Vui lòng đăng nhập để thêm vào giỏ hàng!', 'warning')
    setTimeout(() => router.push({ name: 'login' }), 1200)
    return
  }
  if (!selectedSku.value && !(product.value?.skus?.length === 0)) {
    // Nếu chưa chọn SKU mà có SKU thì nhắc chọn
    if (product.value?.skus?.length > 0 && !selectedSku.value) {
      showToast('Vui lòng chọn phiên bản sản phẩm!', 'warning')
      return
    }
  }
  addingToCart.value = true
  try {
    const skuCode = selectedSku.value?.sku_code
    if (!skuCode) {
      showToast('Vui lòng chọn phiên bản sản phẩm!', 'warning')
      return
    }
    await cartStore.addToCart(skuCode, qty.value, {
      name: product.value!.name,
      image_url: product.value!.image_url,
      price: Number(selectedSku.value?.price ?? product.value?.price ?? 0),
    })
    showToast(`Đã thêm "${product.value!.name}" vào giỏ hàng!`, 'success')
  } catch {
    showToast('Không thể thêm vào giỏ hàng. Vui lòng thử lại.', 'error')
  } finally {
    addingToCart.value = false
  }
}

async function handleBuyNow() {
  await handleAddToCart()
  if (!authStore.token) return
  router.push({ name: 'cart' })
}

function toggleWishlist() {
  isWishlisted.value = !isWishlisted.value
  showToast(
    isWishlisted.value ? '❤ Đã thêm vào danh sách yêu thích!' : 'Đã xóa khỏi danh sách yêu thích',
    isWishlisted.value ? 'success' : 'warning'
  )
}

function handleShare() {
  if (navigator.share) {
    navigator.share({ title: product.value?.name, url: location.href })
  } else {
    navigator.clipboard?.writeText(location.href)
    showToast('Đã sao chép link sản phẩm!', 'success')
  }
}

/* ── Load product ───────────────────────────────────────────── */
async function loadProduct(id: number) {
  productStore.detail = null  // reset để hiện loading
  await productStore.fetchDetail(id)
  if (product.value) {
    // Ảnh chính
    activeImage.value = product.value.image_url || ''
    // Tự động chọn SKU đầu tiên còn hàng
    const firstActiveSku = product.value.skus?.find((s: any) => s.status === 'active' && s.quantity > 0)
      ?? product.value.skus?.[0]
      ?? null
    selectedSku.value = firstActiveSku
    qty.value = 1
  }

  if (product.value.variants?.length) {
    const initOptions: Record<number, VariantOption> = {}
    for (const variant of product.value.variants) {
      const firstAvail = variant.options.find(o => isOptionAvailable(o.id))
      if (firstAvail) initOptions[variant.id] = firstAvail
    }
    selectedOptions.value = initOptions
  }
  // Tải sản phẩm liên quan nếu chưa có
  if (productStore.products.length === 0) {
    productStore.fetchProducts({ per_page: 20 }).catch(() => { })
  }
}

/* ── Lifecycle ──────────────────────────────────────────────── */
onMounted(() => {
  const id = Number(route.params.id)
  if (id) loadProduct(id)
})

watch(() => route.params.id, (newId) => {
  const id = Number(newId)
  if (id) loadProduct(id)
})

watch(allImages, (imgs) => {
  if (imgs.length > 0 && !activeImage.value) {
    activeImage.value = imgs[0]
  }
})
</script>

<style scoped>
/* ─────────────────────────────────────────
   BREADCRUMB
───────────────────────────────────────── */
.breadcrumb-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 0 10px;
  font-size: 13px;
  color: #888;
}

.breadcrumb-bar a {
  color: var(--u-green, #2d8c4e);
  text-decoration: none;
}

.breadcrumb-bar a:hover {
  text-decoration: underline;
}

.bc-sep {
  color: #ccc;
}

.bc-current {
  color: #444;
  font-weight: 500;
}

/* ─────────────────────────────────────────
   LOADING / ERROR
───────────────────────────────────────── */
.pd-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 80px;
  font-size: 15px;
  color: #888;
}

.pd-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e0e8e3;
  border-top-color: #2d8c4e;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pd-error {
  text-align: center;
  padding: 80px 20px;
}

.pd-error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.pd-error h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 8px;
}

.pd-error p {
  color: #888;
  margin-bottom: 24px;
}

.pd-back-btn {
  display: inline-block;
  background: #2d8c4e;
  color: #fff;
  padding: 11px 28px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  transition: background .2s;
}

.pd-back-btn:hover {
  background: #1a5c2e;
}

/* ─────────────────────────────────────────
   LAYOUT
───────────────────────────────────────── */
.pd-main {
  display: grid;
  grid-template-columns: 480px 1fr;
  gap: 36px;
  align-items: start;
  padding-bottom: 48px;
  padding-top: 8px;
}

/* ─────────────────────────────────────────
   GALLERY
───────────────────────────────────────── */
.pd-gallery {
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pd-main-img-wrap {
  position: relative;
  background: #fff;
  border: 1.5px solid #e8ede9;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 24px rgba(45, 140, 78, .08);
}

.pd-main-img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform .4s ease;
}

.pd-main-img-wrap:hover .pd-main-img {
  transform: scale(1.06);
}

.pd-badges {
  position: absolute;
  top: 14px;
  left: 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 3;
}

.pd-badge-sale {
  background: #e53e3e;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
}

.pd-badge-new {
  background: #2d8c4e;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
}

.pd-zoom-hint {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 11px;
  color: #aaa;
  background: rgba(255, 255, 255, .85);
  padding: 4px 10px;
  border-radius: 12px;
  pointer-events: none;
}

.pd-thumbs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pd-thumb {
  width: 66px;
  height: 66px;
  border-radius: 10px;
  border: 2px solid #e8ede9;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  padding: 0;
  transition: border-color .2s;
  flex-shrink: 0;
}

.pd-thumb:hover {
  border-color: #2d8c4e;
}

.pd-thumb.active {
  border-color: #2d8c4e;
  box-shadow: 0 0 0 2px #dcfce7;
}

.pd-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pd-trust-row {
  display: flex;
  gap: 6px;
  background: #f0faf4;
  border: 1px solid #c8e6d0;
  border-radius: 12px;
  padding: 12px 14px;
}

.pd-trust-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  color: #2a6a3e;
  font-weight: 600;
  justify-content: center;
}

.pd-trust-ico {
  font-size: 16px;
}

/* ─────────────────────────────────────────
   INFO PANEL
───────────────────────────────────────── */
.pd-info {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.pd-meta-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pd-brand-tag {
  background: #dcfce7;
  color: #166534;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
}

.pd-cat-tag {
  background: #eff6ff;
  color: #1e40af;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.pd-title {
  font-size: 24px;
  font-weight: 900;
  color: #111;
  line-height: 1.35;
}

.pd-rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pd-stars {
  display: flex;
  gap: 2px;
}

.pd-star {
  font-size: 15px;
  color: #ddd;
}

.pd-star.filled {
  color: #f5a623;
}

.pd-rating-val {
  font-size: 13.5px;
  font-weight: 700;
  color: #333;
}

.pd-review-count,
.pd-sold-count {
  font-size: 12.5px;
  color: #888;
}

.pd-divider {
  color: #ddd;
}

.pd-price-box {
  background: linear-gradient(135deg, #fff9f0, #fff);
  border: 2px solid #fde8c8;
  border-radius: 14px;
  padding: 18px 22px;
}

.pd-price-main {
  font-size: 36px;
  font-weight: 900;
  color: #e03131;
  line-height: 1;
}

.pd-currency {
  font-size: 20px;
  margin-left: 2px;
}

.pd-price-old-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.pd-price-old {
  font-size: 16px;
  color: #bbb;
  text-decoration: line-through;
}

.pd-discount-badge {
  background: #fff3e0;
  color: #c45c00;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid #ffd699;
}

.pd-sku-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pd-section-label {
  font-size: 13px;
  font-weight: 700;
  color: #555;
}

.pd-sku-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pd-sku-btn {
  border: 2px solid #e0e8e3;
  border-radius: 10px;
  padding: 10px 16px;
  background: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  transition: all .2s;
  min-width: 120px;
  position: relative;
  font-family: inherit;
}

.pd-sku-btn:hover:not(:disabled) {
  border-color: #2d8c4e;
  background: #f0faf4;
}

.pd-sku-btn.active {
  border-color: #2d8c4e;
  background: #f0faf4;
  box-shadow: 0 0 0 3px #dcfce7;
}

.pd-sku-btn.out-of-stock {
  opacity: .5;
  cursor: not-allowed;
}

.pd-sku-code {
  font-size: 12px;
  font-weight: 700;
  color: #333;
}

.pd-sku-price {
  font-size: 13px;
  font-weight: 700;
  color: #e03131;
}

.pd-sku-oos {
  position: absolute;
  top: 4px;
  right: 6px;
  font-size: 9px;
  color: #e53e3e;
  font-weight: 700;
}

.pd-qty-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pd-qty-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pd-qty-ctrl {
  display: flex;
  align-items: center;
}

.pd-qty-btn {
  width: 36px;
  height: 36px;
  border: 1.5px solid #d4e8da;
  background: #f8fdf9;
  color: #2d8c4e;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .15s;
  font-family: inherit;
}

.pd-qty-btn:first-child {
  border-radius: 8px 0 0 8px;
}

.pd-qty-btn:last-child {
  border-radius: 0 8px 8px 0;
}

.pd-qty-btn:hover:not(:disabled) {
  background: #dcfce7;
  border-color: #2d8c4e;
}

.pd-qty-btn:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.pd-qty-input {
  width: 56px;
  height: 36px;
  border: 1.5px solid #d4e8da;
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  color: #222;
  outline: none;
  font-family: inherit;
}

.pd-qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

.pd-stock-info {
  font-size: 13px;
}

.in-stock {
  color: #16a34a;
  font-weight: 600;
}

.out-stock {
  color: #dc2626;
  font-weight: 600;
}

.pd-actions {
  display: flex;
  gap: 12px;
}

.pd-btn-cart {
  flex: 1;
  background: #fff;
  color: #2d8c4e;
  border: 2.5px solid #2d8c4e;
  border-radius: 50px;
  padding: 14px 24px;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all .2s;
  font-family: inherit;
}

.pd-btn-cart svg {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.pd-btn-cart:hover:not(:disabled) {
  background: #f0faf4;
  box-shadow: 0 4px 16px rgba(45, 140, 78, .2);
}

.pd-btn-cart:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.pd-btn-buy {
  flex: 1;
  background: linear-gradient(135deg, #1a5c2e, #2d8c4e);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 14px 24px;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all .2s;
  font-family: inherit;
  box-shadow: 0 4px 18px rgba(26, 92, 46, .3);
}

.pd-btn-buy svg {
  width: 15px;
  height: 15px;
}

.pd-btn-buy:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(26, 92, 46, .4);
}

.pd-btn-buy:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.pd-secondary-actions {
  display: flex;
  gap: 10px;
}

.pd-secondary-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1.5px solid #e0e8e3;
  border-radius: 50px;
  padding: 8px 18px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  font-family: inherit;
  transition: all .2s;
}

.pd-secondary-btn:hover {
  border-color: #2d8c4e;
  color: #2d8c4e;
  background: #f0faf4;
}

.pd-heart {
  font-size: 15px;
  color: #ccc;
  transition: color .2s;
}

.pd-heart.active {
  color: #e53e3e;
}

.pd-policy-strip {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #fff;
  border: 1.5px solid #e8ede9;
  border-radius: 14px;
  overflow: hidden;
}

.pd-policy-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-bottom: 1px solid #f0f5f1;
  transition: background .15s;
}

.pd-policy-item:last-child {
  border-bottom: none;
}

.pd-policy-item:hover {
  background: #f8fdf9;
}

.pd-policy-item svg {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  stroke: #2d8c4e;
}

.pd-policy-item div {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.pd-policy-item strong {
  font-size: 13px;
  color: #222;
}

.pd-policy-item span {
  font-size: 12px;
  color: #888;
}

/* ─────────────────────────────────────────
   TABS
───────────────────────────────────────── */
.pd-tabs-section {
  padding-bottom: 48px;
}

.pd-tabs-header {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e8ede9;
  margin-bottom: 28px;
  overflow-x: auto;
}

.pd-tab {
  padding: 13px 28px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: all .2s;
  font-family: inherit;
}

.pd-tab:hover {
  color: #2d8c4e;
}

.pd-tab.active {
  color: #2d8c4e;
  border-bottom-color: #2d8c4e;
  background: #f0faf4;
  border-radius: 8px 8px 0 0;
}

.pd-tab-desc {
  max-width: 820px;
}

.pd-desc-text {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
}

.spec-table {
  width: 100%;
  border-collapse: collapse;
  max-width: 640px;
}

.spec-table tr:nth-child(odd) {
  background: #f8fdf9;
}

.spec-key {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  width: 200px;
}

.spec-val {
  padding: 12px 16px;
  font-size: 14px;
  color: #222;
}

/* Reviews */
.pd-rating-summary {
  display: flex;
  gap: 40px;
  margin-bottom: 32px;
  align-items: center;
}

.pd-rating-big {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.pd-rating-number {
  font-size: 56px;
  font-weight: 900;
  color: #222;
  line-height: 1;
}

.pd-rating-stars-big {
  display: flex;
  gap: 3px;
}

.pd-rv-star-lg {
  font-size: 20px;
  color: #ddd;
}

.pd-rv-star-lg.filled {
  color: #f5a623;
}

.pd-rating-label {
  font-size: 13px;
  color: #888;
}

.pd-rating-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pd-rating-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pd-bar-star {
  font-size: 12px;
  color: #888;
  width: 24px;
  text-align: right;
}

.pd-bar-track {
  flex: 1;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.pd-bar-fill {
  height: 100%;
  background: #f5a623;
  border-radius: 4px;
}

.pd-bar-count {
  font-size: 12px;
  color: #888;
  width: 24px;
}

.pd-review-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pd-review-item {
  padding: 20px;
  background: #fff;
  border: 1px solid #eef2ee;
  border-radius: 12px;
}

.pd-rv-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.pd-rv-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2d8c4e, #1a5c2e);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.pd-rv-meta {
  flex: 1;
}

.pd-rv-name {
  font-size: 14px;
  color: #222;
}

.pd-rv-stars {
  display: flex;
  gap: 2px;
  margin-top: 3px;
}

.pd-rv-star {
  font-size: 13px;
  color: #ddd;
}

.pd-rv-star.filled {
  color: #f5a623;
}

.pd-rv-date {
  font-size: 12px;
  color: #aaa;
}

.pd-rv-text {
  font-size: 14px;
  color: #444;
  line-height: 1.7;
  margin-bottom: 8px;
}

.pd-rv-verified {
  font-size: 11.5px;
  color: #16a34a;
  font-weight: 600;
}

/* ─────────────────────────────────────────
   RELATED PRODUCTS
───────────────────────────────────────── */
.pd-related {
  padding-bottom: 60px;
}

.pd-related-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.pd-related-title {
  font-size: 20px;
  font-weight: 800;
  color: #1a5c2e;
}

.pd-related-all {
  font-size: 13px;
  color: #2d8c4e;
  text-decoration: none;
  font-weight: 600;
}

.pd-related-all:hover {
  text-decoration: underline;
}

.pd-related-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}

.pd-rel-card {
  border: 1.5px solid #e8ede9;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  transition: all .2s;
}

.pd-rel-card:hover {
  border-color: #2d8c4e;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(45, 140, 78, .12);
}

.pd-rel-img-wrap {
  aspect-ratio: 1;
  background: #f8fdf9;
  padding: 10px;
}

.pd-rel-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.pd-rel-info {
  padding: 10px 12px;
}

.pd-rel-name {
  font-size: 12.5px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.pd-rel-price {
  font-size: 13.5px;
  font-weight: 800;
  color: #e03131;
}

/* ─────────────────────────────────────────
   TOAST
───────────────────────────────────────── */
.pd-toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  padding: 14px 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  z-index: 9999;
  box-shadow: 0 8px 28px rgba(0, 0, 0, .18);
  max-width: 340px;
}

.pd-toast.success {
  background: #1a5c2e;
}

.pd-toast.error {
  background: #dc2626;
}

.pd-toast.warning {
  background: #d97706;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all .3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

/* ─────────────────────────────────────────
   RESPONSIVE
───────────────────────────────────────── */
@media (max-width: 900px) {
  .pd-main {
    grid-template-columns: 1fr;
  }

  .pd-gallery {
    position: static;
  }

  .pd-related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .pd-title {
    font-size: 18px;
  }

  .pd-price-main {
    font-size: 28px;
  }

  .pd-actions {
    flex-direction: column;
  }
}
</style>