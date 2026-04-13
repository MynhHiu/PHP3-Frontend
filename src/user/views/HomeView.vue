<template>
  <div class="home-page">

    <!-- ── PROMO TICKER ────────────────────────────────────────── -->
    <div class="promo-ticker">
      <div class="ticker-track">
        <span v-for="n in 4" :key="n">
          Miễn phí vận chuyển đơn từ 500K &nbsp;•&nbsp;
          Tặng quà khi mua máy lạnh &nbsp;•&nbsp;
          Flash Sale mỗi ngày 12h–14h &nbsp;•&nbsp;
          Bảo hành 2 năm chính hãng &nbsp;•&nbsp;
        </span>
      </div>
    </div>

    <!-- ── HERO: Banner + Side Banners ──────────────────────────── -->
    <section class="hero-wrap">
      <div class="u-container hero-inner">

        <!-- Main Banner Slider -->
        <div class="main-banner">
          <div v-if="bannersLoading" class="banner-skeleton">
            <div class="skeleton-shimmer"></div>
          </div>
          <template v-else>
            <div class="banner-slides-container">
              <div v-for="(b, i) in activeBanners" :key="b.id ?? i" class="banner-slide"
                :class="{ active: i === currentBanner }" :style="b.image_url ? {} : { background: b.bg }">
                <template v-if="b.image_url">
                  <img :src="b.image_url" :alt="b.title" class="b-real-img" />
                  <div class="b-real-overlay">
                    <h2 class="b-title">{{ b.title }}</h2>
                    <p v-if="b.description" class="b-sub">{{ b.description }}</p>
                    <router-link v-if="b.link" :to="b.link" class="b-cta">
                      Xem ngay
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </router-link>
                  </div>
                </template>
                <template v-else>
                  <div class="b-shape b-shape-1"></div>
                  <div class="b-shape b-shape-2"></div>
                  <div class="b-shape b-shape-3"></div>
                  <div class="b-content">
                    <span class="b-label">{{ b.label }}</span>
                    <h2 class="b-title">{{ b.title }}</h2>
                    <p class="b-sub">{{ b.sub }}</p>
                    <div class="b-price-row">
                      <span class="b-price-from">Chỉ từ</span>
                      <span class="b-price-val">{{ b.price }}</span>
                    </div>
                    <router-link to="/products" class="b-cta">
                      Mua ngay
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </router-link>
                  </div>
                  <div class="b-img-wrap">
                    <div class="b-img-circle"></div>
                    <div class="b-img-inner">
                      <svg viewBox="0 0 120 120" fill="none" class="b-icon">
                        <rect x="20" y="30" width="80" height="55" rx="6" stroke="rgba(255,255,255,0.8)"
                          stroke-width="2.5" fill="rgba(255,255,255,0.07)" />
                        <rect x="30" y="40" width="60" height="35" rx="3" fill="rgba(255,255,255,0.12)"
                          stroke="rgba(255,255,255,0.5)" stroke-width="1.5" />
                        <path d="M40 50h40M40 58h28" stroke="rgba(255,255,255,0.7)" stroke-width="2"
                          stroke-linecap="round" />
                        <path d="M35 85v8h50v-8" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
                      </svg>
                    </div>
                  </div>
                </template>
              </div>
            </div>
            <button class="b-arrow b-prev" @click="prevBanner">&#8249;</button>
            <button class="b-arrow b-next" @click="nextBanner">&#8250;</button>
            <div class="b-dots">
              <button v-for="(_, i) in activeBanners" :key="i" :class="['b-dot', { active: i === currentBanner }]"
                @click="currentBanner = i; resetBannerTimer()"></button>
            </div>
          </template>
        </div>

        <!-- Side banners -->
        <!-- Side banners -->
        <div class="side-banners">
          <div v-for="(sb, i) in displayedSideBanners" :key="sb.id"
            :class="['side-b', sb.colorClass ?? (i === 0 ? 'side-b-1' : 'side-b-2')]"
            @click="sb.link ? $router.push(sb.link) : null">
            <template v-if="sb.image_url">
              <img :src="sb.image_url" :alt="sb.title" class="side-b-img" />
              <div class="side-b-img-overlay">
                <div class="side-b-title">{{ sb.title }}</div>
                <div v-if="sb.description" class="side-b-disc">{{ sb.description }}</div>
                <span class="side-b-cta">Xem ngay →</span>
              </div>
            </template>
            <template v-else>
              <div class="side-b-inner">
                <span class="side-b-tag">{{ sb.tag ?? (i === 0 ? 'HOT DEAL' : 'MỚI VỀ') }}</span>
                <div class="side-b-title">{{ sb.title }}</div>
                <div class="side-b-disc">{{ sb.description }}</div>
                <span class="side-b-cta">Xem ngay →</span>
              </div>
            </template>
          </div>
        </div>

      </div>
    </section>

    <!-- ── TRUST BAR ─────────────────────────────────────────────── -->
    <div class="trust-strip">
      <div class="u-container trust-strip-inner">
        <div class="trust-cell" v-for="t in trustItems" :key="t.title">
          <span class="trust-ico">{{ t.ico }}</span>
          <div class="trust-text">
            <strong>{{ t.title }}</strong>
            <span>{{ t.sub }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── MAIN CONTENT: Sidebar + Products ──────────────────────── -->
    <div class="u-container main-layout">

      <!-- LEFT SIDEBAR -->
      <aside class="left-sidebar">
        <div class="ls-block">
          <div class="ls-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            Tất cả danh mục
          </div>
          <!-- Skeleton khi đang tải danh mục -->
          <ul v-if="catsLoading" class="ls-cat-list">
            <li v-for="n in 7" :key="n" class="ls-cat-skeleton"></li>
          </ul>

          <ul v-else class="ls-cat-list">
            <!-- Mục "Tất cả" -->
            <li class="ls-cat-item">
              <a href="javascript:void(0)" class="ls-cat-link" :class="{ active: activeCatId === null }"
                @click="selectCategory(null)">

                <span class="ls-cat-name">Tất cả sản phẩm</span>
              </a>
            </li>
            <!-- Danh mục cha + dropdown con -->
            <li v-for="cat in sidebarCats" :key="cat.id" class="ls-cat-item">
              <a href="javascript:void(0)" class="ls-cat-link" :class="{ active: activeCatId === cat.id }"
                @click="selectCategory(cat.id)">

                <span class="ls-cat-name">{{ cat.name }}</span>
                <span v-if="cat.children && cat.children.length" class="ls-cat-arrow">›</span>
              </a>
              <!-- Dropdown danh mục con -->
              <div v-if="cat.children && cat.children.length" class="ls-sub-dropdown">
                <div class="ls-sub-header">{{ cat.name }}</div>
                <a v-for="sub in cat.children" :key="sub.id" href="javascript:void(0)" class="ls-sub-link"
                  :class="{ active: activeCatId === sub.id }" @click="selectCategory(sub.id)">
                  <span class="ls-sub-dot">•</span>
                  {{ sub.name }}
                </a>
              </div>
            </li>
          </ul>
        </div>

        <!-- Filter giá -->
        <div class="ls-block ls-filter">
          <div class="ls-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Lọc giá
          </div>
          <div class="price-filter-btns">
            <button v-for="r in priceRanges" :key="r.label"
              :class="['pf-btn', { active: activePriceRange === r.label }]" @click="selectPriceRange(r.label)">{{
                r.label }}</button>
          </div>
        </div>

        <!-- Thương hiệu nổi bật -->
        <div class="ls-block ls-brands">
          <div class="ls-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
            Thương hiệu
          </div>
          <div class="brand-tags">
            <span v-for="b in brands" :key="b.id" :class="['brand-tag', { active: activeBrand === b.id }]"
              @click="selectBrand(b.id)">{{ b.name }}</span>
          </div>
        </div>
      </aside>

      <!-- RIGHT: PRODUCT CONTENT -->
      <div class="product-content">

        <!-- Search result banner -->
        <div v-if="searchKeyword" class="search-result-bar">
          <span class="search-result-icon"></span>
          <span>Kết quả tìm kiếm cho <strong>"{{ searchKeyword }}"</strong>: <em>{{ totalDisplay }} sản phẩm</em></span>
          <button class="search-clear-btn" @click="clearAllFilters">✕ Xoá tìm kiếm</button>
        </div>

        <!-- Active filters bar -->
        <div v-if="activePriceRange || activeBrand" class="active-filters-bar">
          <span class="af-label">Đang lọc:</span>
          <span v-if="activePriceRange" class="af-tag">
            {{ activePriceRange }}
            <button @click="selectPriceRange(activePriceRange)">✕</button>
          </span>
          <span v-if="activeBrand" class="af-tag">
            {{brands.find(b => b.id === activeBrand)?.name}}
            <button @click="selectBrand(activeBrand!)">✕</button>
          </span>
          <button class="af-clear-all" @click="clearAllFilters">Xoá tất cả</button>
        </div>

        <!-- Product Grid -->
        <div v-if="loading" class="grid-loading">
          <div class="loading-spinner"></div>
          <span>Đang tải sản phẩm...</span>
        </div>

        <div v-else class="product-grid">
          <div v-for="p in displayedProducts" :key="p.id" class="pg-card" @click="$router.push(`/products/${p.id}`)">
            <!-- Badges -->
            <div class="pg-badges">
              <span v-if="p.discount" class="pg-badge-sale">-{{ p.discount }}%</span>
              <span v-if="p.isNew" class="pg-badge-new">MỚI</span>
              <span v-if="p.isHot" class="pg-badge-hot">HOT</span>
            </div>

            <!-- Image -->
            <div class="pg-img-wrap">
              <img :src="resolveProductImage(p.image_url)" :alt="p.name" class="pg-img"
                @error="(e) => (e.target as HTMLImageElement).src = PLACEHOLDER" />
              <div class="pg-overlay">
                <button class="pg-cart-btn" @click.stop="$router.push(`/products/${p.id}`)" title="Thêm vào giỏ">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                  Thêm giỏ hàng
                </button>
                <!-- <button class="pg-quick-view" @click.stop title="Xem nhanh">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button> -->
              </div>
            </div>

            <!-- Info -->
            <div class="pg-info">
              <div class="pg-brand">{{ p.brand?.name || 'Green Electric' }}</div>
              <div class="pg-name">{{ p.name }}</div>
              <!-- <div class="pg-stars">
                <span v-for="s in 5" :key="s" :class="['star', s <= (p.rating || 4) ? 'filled' : '']">★</span>
                <span class="pg-review-count">({{ p.reviewCount || Math.floor(Math.random()*80+10) }})</span>
              </div> -->
              <div class="pg-price-row">
                <span class="pg-price-new">{{ fmt(p.price || 0) }}đ</span>
                <span v-if="p.old_price" class="pg-price-old">{{ fmt(p.old_price) }}đ</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-if="!loading && displayedProducts.length === 0" class="empty-state">
          <div class="empty-icon"></div>
          <h3>Không có sản phẩm nào</h3>
          <p>Vui lòng thử lại với bộ lọc khác</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
          <button v-for="p in totalPages" :key="p" :class="['page-btn', { active: p === currentPage }]"
            @click="currentPage = p">{{ p }}</button>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
        </div>

      </div>
    </div>

    <!-- ── TOAST ─────────────────────────────────────────────────── -->
    <transition name="toast-fade">
      <div v-if="toast.show" :class="['home-toast', toast.type]">
        {{ toast.message }}
      </div>
    </transition>
    <div class="home-page">
      <AiChatBox />
    </div>
  </div>
</template>

<script setup lang="ts">
import { resolveProductImage, PLACEHOLDER } from '@/utils/productImage'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCartStore } from '@/user/stores/cartStore'
import { useAuthStore } from '@/user/stores/authStore'
import { useProductUserStore, type ProductListItem } from '@/user/stores/productUserStore'
import AiChatBox from '@/user/components/AiChatBox.vue'
import BannerSlider from '@/user/components/BannerSlider.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const productStore = useProductUserStore()



/* ── Toast ──────────────────────────────────────────────────────── */
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer: ReturnType<typeof setTimeout>
function showToast(msg: string, type: 'success' | 'error' | 'warning' = 'success') {
  clearTimeout(toastTimer)
  toast.value = { show: true, message: msg, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 2800)
}

/* ── Add to cart ────────────────────────────────────────────────── */
async function handleAddToCart(p: any) {
  if (!authStore.token) {
    showToast('Vui lòng đăng nhập để thêm vào giỏ hàng!', 'warning')
    setTimeout(() => router.push({ name: 'login' }), 1200)
    return
  }
  try {
    await cartStore.addToCart(String(p.id), 1, {
      name: p.name,
      image_url: p.image_url,
      price: p.price || 0,
    })
    showToast(`Đã thêm "${p.name}" vào giỏ hàng!`, 'success')
  } catch {
    showToast('Không thể thêm vào giỏ hàng. Vui lòng thử lại.', 'error')
  }
}

/* ── Banner ─────────────────────────────────────────────────────── */
const currentBanner = ref(0)
const bannersLoading = ref(true)
const staticBanners = [
  { label: 'Ưu đãi đặc biệt', title: 'Máy lạnh Inverter tiết kiệm điện', sub: 'Bảo hành 2 năm chính hãng toàn quốc', price: '8.990.000đ', bg: 'linear-gradient(135deg,#0d4f2d 0%,#1e8a52 60%,#0d7a42 100%)', image_url: null, link: '/products' },
  { label: 'Hàng mới về', title: 'Thiết bị điện thông minh 2025', sub: 'Nhà thông minh — Giá cực ưu đãi hôm nay', price: '1.290.000đ', bg: 'linear-gradient(135deg,#0a2d5c 0%,#1255a8 60%,#0e4d96 100%)', image_url: null, link: '/products' },
  { label: 'Flash Sale', title: 'Quạt điện, quạt trần giảm sốc', sub: 'Hàng trăm sản phẩm giảm đến 50% mỗi ngày', price: '390.000đ', bg: 'linear-gradient(135deg,#5c1d0a 0%,#b53a1a 60%,#9e2d0d 100%)', image_url: null, link: '/products' },
]
const apiBanners = ref<any[]>([])
const activeBanners = computed(() =>
  apiBanners.value.filter(b => !b.banner_type || b.banner_type === 'main').length > 0
    ? apiBanners.value.filter(b => !b.banner_type || b.banner_type === 'main')
    : staticBanners
)
const activeSideBanners = computed(() =>
  apiBanners.value.filter(b => b.banner_type === 'side').slice(0, 2)
)
const staticSideBanners = [
  { id: 's1', title: 'Điều hòa Inverter', description: 'Tiết kiệm điện đến 60%', tag: 'HOT DEAL', link: '/products?category=dieu-hoa', image_url: null, colorClass: 'side-b-1' },
  { id: 's2', title: 'Đồ dùng nhà bếp', description: 'Thương hiệu châu Âu', tag: 'MỚI VỀ', link: '/products?category=nha-bep', image_url: null, colorClass: 'side-b-2' },
]
const displayedSideBanners = computed(() =>
  activeSideBanners.value.length > 0 ? activeSideBanners.value : staticSideBanners
)

async function fetchBanners() {
  try {
    const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
    const res = await fetch(`${BASE}/banners`)
    if (!res.ok) throw new Error('fetch failed')
    apiBanners.value = await res.json()
  } catch {
    console.warn('Không tải được banner, dùng banner mặc định')
  } finally {
    bannersLoading.value = false
  }
}

const nextBanner = () => { currentBanner.value = (currentBanner.value + 1) % activeBanners.value.length }
const prevBanner = () => { currentBanner.value = (currentBanner.value - 1 + activeBanners.value.length) % activeBanners.value.length }
function resetBannerTimer() { clearInterval(bannerTimer); bannerTimer = setInterval(nextBanner, 4500) }
let bannerTimer: ReturnType<typeof setInterval>

/* ── Static data ─────────────────────────────────────────────────── */
const trustItems = [
  { ico: '', title: 'Giao hàng nhanh', sub: 'Nội thành trong ngày' },
  { ico: '', title: 'Bảo hành chính hãng', sub: 'Cam kết 12–24 tháng' },
  { ico: '↺', title: 'Đổi trả dễ dàng', sub: 'Trong vòng 30 ngày' },
  { ico: '', title: 'Hỗ trợ 24/7', sub: 'Tư vấn tận tâm' },
  { ico: '', title: 'Thanh toán linh hoạt', sub: 'ATM · Momo · COD' },
]

const priceRanges = [
  { label: 'Dưới 500K', min: 0, max: 500000 },
  { label: '500K–2 triệu', min: 500000, max: 2000000 },
  { label: '2–5 triệu', min: 2000000, max: 5000000 },
  { label: '5–10 triệu', min: 5000000, max: 10000000 },
  { label: 'Trên 10 triệu', min: 10000000, max: Infinity },
]

interface Brand { id: number; name: string }
const brands = ref<Brand[]>([])

async function fetchBrands() {
  try {
    const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
    const res = await fetch(`${BASE}/brands`)
    if (!res.ok) throw new Error('fetch failed')
    brands.value = await res.json()
  } catch (e) {
    console.error('Không tải được thương hiệu:', e)
  }
}

const sortOptions = [
  { key: 'default', label: 'Mặc định' },
  { key: 'price_asc', label: 'Giá tăng dần' },
  { key: 'price_desc', label: 'Giá giảm dần' },
  { key: 'newest', label: 'Mới nhất' },
  { key: 'popular', label: 'Phổ biến' },
]

/* ── Categories from API ────────────────────────────────────────── */
interface SubCategory { id: number; name: string; parent_id: number }
interface ParentCategory { id: number; name: string; parent_id: null; children: SubCategory[] }

const sidebarCats = ref<ParentCategory[]>([])
const catsLoading = ref(true)

async function fetchCategories() {
  try {
    const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'
    const res = await fetch(`${BASE}/categories`)
    if (!res.ok) throw new Error('fetch failed')
    sidebarCats.value = await res.json()
  } catch (e) {
    console.error('Không tải được danh mục:', e)
  } finally {
    catsLoading.value = false
  }
}

/* ── State ─────────────────────────────────────────────────────── */
const activeCatId = ref<number | null>(null)   // null = tất cả
const activePriceRange = ref('')
const activeBrand = ref<number | null>(null)
const searchKeyword = ref('')
const activeSort = ref('default')
const currentPage = ref(1)
const PAGE_SIZE = 12

/** Chọn danh mục cha hoặc con → gọi API lọc ngay */
function selectCategory(id: number | null) {
  activeCatId.value = id
  currentPage.value = 1
  const params: Record<string, any> = { per_page: 48 }
  if (id !== null) params.category_id = id
  productStore.fetchProducts(params).catch(() => { })
}

/** Chọn / bỏ chọn khoảng giá */
function selectPriceRange(label: string) {
  activePriceRange.value = activePriceRange.value === label ? '' : label
  currentPage.value = 1
}

/** Chọn / bỏ chọn thương hiệu */
function selectBrand(id: number) {
  activeBrand.value = activeBrand.value === id ? null : id
  currentPage.value = 1
}

/** Xoá tất cả bộ lọc */
function clearAllFilters() {
  activePriceRange.value = ''
  activeBrand.value = null
  searchKeyword.value = ''
  activeCatId.value = null
  currentPage.value = 1
  productStore.fetchProducts({ per_page: 48 }).catch(() => { })
}

/* ── Helpers ────────────────────────────────────────────────────── */
const fmt = (n: number) => n.toLocaleString('vi-VN')

/* ── Products display logic ─────────────────────────────────────── */
const loading = computed(() => productStore.loading)

const allProducts = computed<any[]>(() => productStore.products)

const filteredProducts = computed(() => {
  let list = [...allProducts.value]

  // Lọc theo từ khoá tìm kiếm
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.trim().toLowerCase()
    list = list.filter(p => p.name?.toLowerCase().includes(kw))
  }

  // Lọc theo khoảng giá
  if (activePriceRange.value) {
    const range = priceRanges.find(r => r.label === activePriceRange.value)
    if (range) list = list.filter(p => (p.price || 0) >= range.min && (p.price || 0) <= range.max)
  }

  // Lọc theo thương hiệu
  if (activeBrand.value !== null) {
    list = list.filter(p => p.brand?.id === activeBrand.value)
  }

  if (activeSort.value === 'price_asc') list.sort((a, b) => (a.price || 0) - (b.price || 0))
  if (activeSort.value === 'price_desc') list.sort((a, b) => (b.price || 0) - (a.price || 0))
  if (activeSort.value === 'newest') list.sort((a, b) => b.id - a.id)
  return list
})

const totalDisplay = computed(() => filteredProducts.value.length)
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / PAGE_SIZE))

const displayedProducts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return filteredProducts.value.slice(start, start + PAGE_SIZE)
})

/* ── Lifecycle ──────────────────────────────────────────────────── */
onMounted(async () => {
  fetchBanners()
  bannerTimer = setInterval(nextBanner, 4500)
  await fetchCategories()
  await fetchBrands()

  // Đọc ?search= từ URL (khi từ Navbar search sang)
  const q = route.query.search as string
  if (q?.trim()) {
    searchKeyword.value = q.trim()
    productStore.fetchProducts({ per_page: 200 }).catch(() => { })
  } else {
    productStore.fetchProducts({ per_page: 48 }).catch(() => { })
  }
})

// Theo dõi nếu URL thay đổi (ví dụ: search lần 2 từ cùng trang)
watch(() => route.query.search, (newQ) => {
  const q = (newQ as string)?.trim() ?? ''
  searchKeyword.value = q
  currentPage.value = 1
  if (q) {
    productStore.fetchProducts({ per_page: 200 }).catch(() => { })
  } else {
    productStore.fetchProducts({ per_page: 48 }).catch(() => { })
  }
})

onUnmounted(() => {
  clearInterval(bannerTimer)
  clearTimeout(toastTimer)
})
</script>

<style scoped>
/* ───────────────────────────────────────────────
   PROMO TICKER
─────────────────────────────────────────────── */
.promo-ticker {
  background: linear-gradient(90deg, #1a5c2e, #2d8c4e);
  color: #fff;
  font-size: 12.5px;
  font-weight: 500;
  overflow: hidden;
  padding: 7px 0;
  white-space: nowrap;
}

.ticker-track {
  display: inline-block;
  animation: ticker-scroll 40s linear infinite;
  letter-spacing: .3px;
}

@keyframes ticker-scroll {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

/* ───────────────────────────────────────────────
   HERO
─────────────────────────────────────────────── */
.hero-wrap {
  background: #edf4f0;
  padding: 16px 0 20px;
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 14px;
  align-items: start;
}

/* Main Banner */
.main-banner {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  height: 360px;
  box-shadow: 0 6px 28px rgba(0, 0, 0, .14);
}

.banner-slides-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.banner-slide {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px 52px;
  opacity: 0;
  transition: opacity .55s ease;
  pointer-events: none;
}

.banner-slide.active {
  opacity: 1;
  pointer-events: auto;
}

.b-shape {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.b-shape-1 {
  width: 340px;
  height: 340px;
  background: rgba(255, 255, 255, .06);
  top: -120px;
  right: -80px;
}

.b-shape-2 {
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, .07);
  bottom: -80px;
  right: 140px;
}

.b-shape-3 {
  width: 110px;
  height: 110px;
  background: rgba(255, 255, 255, .08);
  top: 50px;
  right: 220px;
}

.b-content {
  position: relative;
  z-index: 2;
  max-width: 350px;
}

.b-label {
  background: rgba(255, 255, 255, .2);
  border: 1px solid rgba(255, 255, 255, .35);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: inline-block;
  padding: 4px 14px;
  border-radius: 30px;
  margin-bottom: 14px;
}

.b-title {
  font-size: 26px;
  font-weight: 900;
  color: #fff;
  line-height: 1.25;
  margin-bottom: 10px;
  text-shadow: 0 2px 12px rgba(0, 0, 0, .2);
}

.b-sub {
  font-size: 13.5px;
  color: rgba(255, 255, 255, .85);
  margin-bottom: 18px;
  line-height: 1.6;
}

.b-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 22px;
}

.b-price-from {
  font-size: 13px;
  color: rgba(255, 255, 255, .75);
}

.b-price-val {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  text-shadow: 0 2px 8px rgba(0, 0, 0, .15);
}

.b-cta {
  background: #fff;
  color: #1a5c2e;
  border: none;
  border-radius: 50px;
  padding: 12px 30px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  transition: all .2s;
  box-shadow: 0 4px 18px rgba(0, 0, 0, .15);
  letter-spacing: .3px;
}

.b-cta svg {
  width: 15px;
  height: 15px;
}

.b-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, .2);
}

.b-img-wrap {
  position: relative;
  z-index: 2;
  flex-shrink: 0;
}

.b-img-circle {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .1);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-ring 3s ease-in-out infinite;
}

@keyframes pulse-ring {

  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: .6;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.08);
    opacity: 1;
  }
}

.b-img-inner {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .14);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 4s ease-in-out infinite;
}

.b-icon {
  width: 80px;
  height: 80px;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

/* Arrow / dots */
.b-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, .18);
  border: 1px solid rgba(255, 255, 255, .35);
  color: #fff;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 22px;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .2s;
  line-height: 1;
}

.b-arrow:hover {
  background: rgba(255, 255, 255, .35);
}

.b-prev {
  left: 14px;
}

.b-next {
  right: 14px;
}

.b-dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 7px;
  z-index: 5;
}

.b-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .4);
  border: none;
  cursor: pointer;
  transition: all .25s;
}

.b-dot.active {
  background: #fff;
  width: 26px;
  border-radius: 4px;
}

/* Side banners */
.side-banners {
  display: flex;
  flex-direction: column;
  gap: 14px;
  height: 360px;
}

.side-b {
  flex: 1;
  border-radius: 14px;
  cursor: pointer;
  overflow: hidden;
  position: relative;
  transition: transform .2s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, .1);
}

.side-b:hover {
  transform: translateY(-3px);
}

.side-b-1 {
  background: linear-gradient(135deg, #c45c00, #f09030);
}

.side-b-2 {
  background: linear-gradient(135deg, #004fa8, #0090d4);
}

.side-b::before {
  content: '';
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, .08);
  right: -40px;
  top: -40px;
}

.side-b-inner {
  padding: 22px 20px;
  position: relative;
  z-index: 1;
}

.side-b-tag {
  background: rgba(255, 255, 255, .22);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 8px;
}

.side-b-title {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 5px;
}

.side-b-disc {
  font-size: 12px;
  color: rgba(255, 255, 255, .82);
  margin-bottom: 14px;
}

.side-b-cta {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: rgba(255, 255, 255, .2);
  border: 1px solid rgba(255, 255, 255, .35);
  border-radius: 20px;
  padding: 5px 14px;
  display: inline-block;
  transition: background .2s;
}

.side-b:hover .side-b-cta {
  background: rgba(255, 255, 255, .36);
}

.side-b-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}

.side-b-img-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  background: linear-gradient(to top, rgba(0, 0, 0, .65) 0%, transparent 100%);
  border-radius: 0 0 14px 14px;
  z-index: 2;
}

.side-b-img-overlay .side-b-title {
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 4px;
}

.side-b-img-overlay .side-b-disc {
  color: rgba(255, 255, 255, .85);
  font-size: 12px;
  margin-bottom: 10px;
}

.side-b-img-overlay .side-b-cta {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: rgba(255, 255, 255, .2);
  border: 1px solid rgba(255, 255, 255, .35);
  border-radius: 20px;
  padding: 5px 14px;
  display: inline-block;
}

/* ───────────────────────────────────────────────
   TRUST STRIP
─────────────────────────────────────────────── */
.trust-strip {
  background: #fff;
  border-bottom: 1px solid #e8efe9;
  padding: 14px 0;
}

.trust-strip-inner {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 10px;
}

.trust-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trust-ico {
  font-size: 22px;
  flex-shrink: 0;
}

.trust-text {
  display: flex;
  flex-direction: column;
}

.trust-text strong {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.3;
}

.trust-text span {
  font-size: 11.5px;
  color: #888;
}

/* ───────────────────────────────────────────────
   MAIN LAYOUT
─────────────────────────────────────────────── */
.main-layout {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 20px;
  padding-top: 20px;
  padding-bottom: 48px;
  align-items: start;
}

/* ─── LEFT SIDEBAR ─── */
.left-sidebar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.ls-block {
  background: #fff;
  border-radius: 12px;
  overflow: visible;
  box-shadow: 0 1px 8px rgba(0, 0, 0, .06);
  border: 1px solid #edf4f0;
}

.ls-title {
  background: linear-gradient(135deg, #1a5c2e, #2d8c4e);
  color: #fff;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ls-title svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.ls-cat-list {
  padding: 6px 0;
}

.ls-cat-link {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 14px;
  font-size: 13px;
  color: #333;
  text-decoration: none;
  transition: all .15s;
  border-bottom: 1px solid #f5faf6;
}

.ls-cat-link:hover,
.ls-cat-link.active {
  background: #f0faf4;
  color: #1a6e35;
}

.ls-cat-ico {
  font-size: 14px;
  width: 20px;
  text-align: center;
}

.ls-cat-name {
  flex: 1;
}

.ls-cat-arrow {
  opacity: 0;
  color: #2d8c4e;
  font-size: 15px;
  transition: opacity .15s;
}

.ls-cat-link:hover .ls-cat-arrow {
  opacity: 1;
}

/* ── Skeleton loading ── */
.ls-cat-skeleton {
  height: 36px;
  margin: 3px 10px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8f5ec 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* ── Dropdown danh mục con ── */
.ls-cat-item {
  position: relative;
}

.ls-sub-dropdown {
  position: absolute;
  left: 100%;
  top: 0;
  width: 220px;
  background: #fff;
  border: 1px solid #c8e6d0;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(45, 140, 78, .18);
  z-index: 999;
  padding: 8px 0;
  opacity: 0;
  pointer-events: none;
  transform: translateX(8px);
  transition: opacity .18s ease, transform .18s ease;
}

.ls-cat-item:hover .ls-sub-dropdown {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

/* Cầu nối để chuột di sang dropdown không bị mất hover */
.ls-sub-dropdown::before {
  content: '';
  position: absolute;
  left: -10px;
  top: 0;
  width: 10px;
  height: 100%;
}

.ls-sub-header {
  font-size: 11px;
  font-weight: 800;
  color: #1a5c2e;
  text-transform: uppercase;
  letter-spacing: .7px;
  padding: 6px 14px 8px;
  border-bottom: 1px solid #edf4f0;
  margin-bottom: 4px;
}

.ls-sub-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 13px;
  color: #444;
  text-decoration: none;
  transition: background .12s, color .12s;
  white-space: nowrap;
  cursor: pointer;
}

.ls-sub-link:hover,
.ls-sub-link.active {
  background: #f0faf4;
  color: #1a6e35;
}

.ls-sub-dot {
  color: #2d8c4e;
  font-size: 10px;
  flex-shrink: 0;
}

/* Price filter */
.ls-filter .price-filter-btns {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.pf-btn {
  background: #f5faf6;
  border: 1px solid #d4e8da;
  color: #444;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12.5px;
  text-align: left;
  cursor: pointer;
  transition: all .15s;
  font-family: inherit;
}

.pf-btn:hover {
  border-color: #2d8c4e;
  color: #1a6e35;
  background: #ecf7ef;
}

.pf-btn.active {
  background: #2d8c4e;
  color: #fff;
  border-color: #2d8c4e;
}

/* Brands */
.ls-brands .brand-tags {
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.brand-tag {
  background: #f0faf4;
  border: 1px solid #c8e6d0;
  color: #2a6a3e;
  font-size: 11.5px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 20px;
  cursor: pointer;
  transition: all .15s;
}

.brand-tag:hover {
  background: #2d8c4e;
  color: #fff;
  border-color: #2d8c4e;
}

.brand-tag.active {
  background: #2d8c4e;
  color: #fff;
  border-color: #2d8c4e;
  box-shadow: 0 2px 8px rgba(45, 140, 78, .25);
}

/* ─── PRODUCT CONTENT ─── */
.product-content {
  min-width: 0;
}

/* Search result bar */
.search-result-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f0faf4;
  border: 1px solid #b5d9c3;
  border-radius: 10px;
  padding: 10px 16px;
  margin-bottom: 12px;
  font-size: 13.5px;
  color: #333;
  flex-wrap: wrap;
}

.search-result-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.search-result-bar strong {
  color: #1a5c2e;
}

.search-result-bar em {
  color: #2d8c4e;
  font-style: normal;
  font-weight: 600;
}

.search-clear-btn {
  margin-left: auto;
  background: none;
  border: 1px solid #c8e6d0;
  border-radius: 20px;
  color: #888;
  font-size: 12px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all .15s;
  font-family: inherit;
  flex-shrink: 0;
}

.search-clear-btn:hover {
  border-color: #e53e3e;
  color: #e53e3e;
  background: #fff5f5;
}

/* Active filters bar */
.active-filters-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.af-label {
  font-size: 12.5px;
  color: #888;
  font-weight: 600;
}

.af-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #e8f5ee;
  border: 1px solid #b5d9c3;
  color: #1a5c2e;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
}

.af-tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: #888;
  font-size: 11px;
  padding: 0;
  line-height: 1;
  transition: color .15s;
}

.af-tag button:hover {
  color: #e53e3e;
}

.af-clear-all {
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  color: #999;
  font-size: 12px;
  padding: 4px 12px;
  cursor: pointer;
  transition: all .15s;
  font-family: inherit;
  margin-left: auto;
}

.af-clear-all:hover {
  border-color: #e53e3e;
  color: #e53e3e;
}

.content-header {
  margin-bottom: 12px;
}

.breadcrumb {
  font-size: 12.5px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 6px;
}

.breadcrumb a {
  color: #2d8c4e;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

/* Sort bar */
.sort-bar {
  background: #fff;
  border: 1px solid #e8efe9;
  border-radius: 10px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.sort-label {
  font-size: 13px;
  color: #666;
  font-weight: 600;
  flex-shrink: 0;
}

.sort-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.sort-tab {
  padding: 6px 14px;
  border: 1px solid #e0e8e3;
  border-radius: 20px;
  font-size: 12.5px;
  color: #555;
  background: #f8fdf9;
  cursor: pointer;
  transition: all .15s;
  font-family: inherit;
}

.sort-tab:hover {
  border-color: #2d8c4e;
  color: #2d8c4e;
}

.sort-tab.active {
  background: #2d8c4e;
  color: #fff;
  border-color: #2d8c4e;
}

.sort-count {
  margin-left: auto;
  font-size: 12.5px;
  color: #999;
  flex-shrink: 0;
}

/* Grid loading */
.grid-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px;
  color: #888;
  font-size: 14px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
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

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

/* Product Card */
.pg-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #ebebeb;
  overflow: hidden;
  cursor: pointer;
  transition: all .22s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.pg-card:hover {
  box-shadow: 0 10px 32px rgba(45, 140, 78, .15);
  transform: translateY(-5px);
  border-color: #b5d9c3;
}

/* Badges */
.pg-badges {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 3;
}

.pg-badge-sale {
  background: #e53e3e;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 20px;
  letter-spacing: .3px;
}

.pg-badge-new {
  background: #2d8c4e;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 20px;
}

.pg-badge-hot {
  background: #e67e22;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 20px;
}

/* Card image */
.pg-img-wrap {
  position: relative;
  height: 190px;
  background: #f8faf9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.pg-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform .4s ease;
  display: block;
}

.pg-card:hover .pg-img {
  transform: scale(1.06);
}

.pg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 40, 20, .8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity .25s;
}

.pg-card:hover .pg-overlay {
  opacity: 1;
}

.pg-cart-btn {
  background: #2d8c4e;
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 9px 18px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  transition: background .2s;
  font-family: inherit;
  white-space: nowrap;
}

.pg-cart-btn svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.pg-cart-btn:hover {
  background: #1a5c2e;
}

.pg-quick-view {
  background: rgba(255, 255, 255, .15);
  border: 1px solid rgba(255, 255, 255, .3);
  color: #fff;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .2s;
}

.pg-quick-view svg {
  width: 16px;
  height: 16px;
}

.pg-quick-view:hover {
  background: rgba(255, 255, 255, .25);
}

/* Card info */
.pg-info {
  padding: 12px 12px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.pg-brand {
  font-size: 11px;
  color: #2d8c4e;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.pg-name {
  font-size: 13px;
  color: #222;
  font-weight: 500;
  line-height: 1.45;
  height: 38px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.pg-stars {
  display: flex;
  align-items: center;
  gap: 1px;
}

.star {
  font-size: 12px;
  color: #ddd;
  transition: color .1s;
}

.star.filled {
  color: #f5a623;
}

.pg-review-count {
  font-size: 11px;
  color: #aaa;
  margin-left: 4px;
}

.pg-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 2px;
}

.pg-price-new {
  color: #e03131;
  font-weight: 800;
  font-size: 15px;
}

.pg-price-old {
  color: #bbb;
  font-size: 12px;
  text-decoration: line-through;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 16px;
  color: #444;
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 28px;
}

.page-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #d4e8da;
  background: #fff;
  color: #444;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all .15s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.page-btn:hover:not(:disabled) {
  border-color: #2d8c4e;
  color: #2d8c4e;
  background: #f0faf4;
}

.page-btn.active {
  background: #2d8c4e;
  color: #fff;
  border-color: #2d8c4e;
}

.page-btn:disabled {
  opacity: .4;
  cursor: not-allowed;
}

/* Toast */
.home-toast {
  position: fixed;
  bottom: 32px;
  left: 28px;
  right: auto;
  transform: none;
  z-index: 9999;
  padding: 13px 26px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 8px 32px rgba(0, 0, 0, .2);
  pointer-events: none;
  white-space: nowrap;
}

.home-toast.success {
  background: #1a6e35;
  color: #fff;
}

.home-toast.error {
  background: #c62828;
  color: #fff;
}

.home-toast.warning {
  background: #d46b08;
  color: #fff;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity .3s, transform .3s;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(16px);
}

.b-real-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.b-real-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24px 36px;
  background: linear-gradient(to top, rgba(0, 0, 0, .65) 0%, transparent 100%);
  color: #fff;
  z-index: 2;
}

.b-real-overlay .b-title {
  font-size: clamp(18px, 3vw, 28px);
  font-weight: 800;
  margin: 0 0 6px;
}

.b-real-overlay .b-sub {
  font-size: 14px;
  opacity: .88;
  margin: 0 0 14px;
}

.banner-skeleton {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
}

.skeleton-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #e8e8e8 25%, #d4d4d4 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  animation: bshimmer 1.4s infinite;
}

@keyframes bshimmer {
  0% {
    background-position: 200% 0
  }

  100% {
    background-position: -200% 0
  }
}

/* ───────────────────────────────────────────────
   RESPONSIVE
─────────────────────────────────────────────── */
@media (max-width: 1200px) {
  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .hero-inner {
    grid-template-columns: 1fr;
  }

  .side-banners {
    flex-direction: row;
    height: auto;
  }

  .side-b {
    min-height: 130px;
  }

  .main-layout {
    grid-template-columns: 200px 1fr;
  }
}

@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 1fr;
  }

  .left-sidebar {
    display: none;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .trust-strip-inner {
    justify-content: flex-start;
    gap: 16px;
  }

  .sort-bar {
    gap: 8px;
  }

  .sort-count {
    display: none;
  }
}

@media (max-width: 480px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>