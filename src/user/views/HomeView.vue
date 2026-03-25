<template>
  <div>
    <!-- ── HERO: Sidebar + Banner + Side banners ─────────────── -->
    <section class="u-hero">
      <div class="u-container u-hero-inner">

        <!-- Sidebar danh mục -->
        <div class="u-sidebar">
          <div class="u-sidebar-title">☰ Danh mục sản phẩm</div>
          <ul class="u-sidebar-list">
            <li v-for="cat in sidebarCats" :key="cat.name" class="u-sidebar-item">
              <router-link :to="`/products?category=${cat.slug}`">
                <span class="u-sidebar-icon">{{ cat.icon }}</span>
                {{ cat.name }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Banner slider -->
        <div class="u-banner">
          <div class="u-banner-slider">

            <button class="u-slider-btn prev" @click="prevBanner">‹</button>
            <button class="u-slider-btn next" @click="nextBanner">›</button>
            <div class="u-slider-dots">
              <button
                v-for="(_, i) in banners" :key="i"
                :class="['u-dot', { active: i === currentBanner }]"
                @click="currentBanner = i"
              ></button>
            </div>
          </div>
        </div>

        <!-- Side banners -->
        <div class="u-side-banners">
          <div class="u-side-banner u-side-banner-1">
            <span class="u-side-tag">Khuyến mãi</span>
            <div class="u-side-title">Điện tử thông minh</div>
            <button class="u-btn u-btn-outline">Xem ngay</button>
          </div>
          <div class="u-side-banner u-side-banner-2">
            <span class="u-side-tag">Mới về</span>
            <div class="u-side-title">Thiết bị cao cấp</div>
            <button class="u-btn u-btn-outline">Xem ngay</button>
          </div>
        </div>

      </div>
    </section>

    <!-- ── FLASH SALE ─────────────────────────────────────────── -->
    <div class="u-container">
      <div class="u-flash-section">
        <div class="u-flash-header">
          <div class="u-flash-title">
            <span class="u-flash-icon">⚡</span>
            <h2>FLASHSALE GIÁ SỐC</h2>
          </div>
          <div class="u-flash-countdown">
            Kết thúc sau:
            <div class="u-cd">
              <span class="u-cd-block">{{ cd.h }}</span>
              <span class="u-cd-sep">:</span>
              <span class="u-cd-block">{{ cd.m }}</span>
              <span class="u-cd-sep">:</span>
              <span class="u-cd-block">{{ cd.s }}</span>
            </div>
          </div>
        </div>
        <div class="u-flash-body">
          <ProductSlider :products="flashProducts" :show-stock="true" />
        </div>
      </div>

      <!-- ── PRODUCT SECTIONS ──────────────────────────────────── -->
      <div
        v-for="sec in sections"
        :key="sec.id"
        class="u-section"
      >
        <div class="u-section-header" :style="{ background: sec.gradient }">
          <span class="u-section-title">{{ sec.title }}</span>
        </div>
        <div class="u-section-body">
          <ProductSlider :products="sec.products" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, h, defineComponent } from 'vue'
import { useCartStore } from '@/user/stores/cartStore'

const cartStore = useCartStore()

/* ── ProductSlider component (inline) ─────────────────────────── */
interface Prod {
  id: number
  name: string
  image: string
  price: number
  oldPrice?: number | null
  discount?: number
  stock?: number
}

const ProductSlider = defineComponent({
  props: {
    products:  { type: Array as () => Prod[], required: true },
    showStock: { type: Boolean, default: false },
  },
  setup(props) {
    const rowRef = ref<HTMLElement | null>(null)
    const slideL = () => { if (rowRef.value) rowRef.value.scrollLeft -= 320 }
    const slideR = () => { if (rowRef.value) rowRef.value.scrollLeft += 320 }
    const fmt = (n: number) => n.toLocaleString('vi-VN')
    const fallback = (e: Event) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200/e8f5e9/2d8c4e?text=SP' }
    const addCart  = (p: Prod) => { console.log('addToCart', p.id) /* TODO: cartStore.addToCart(skuCode) */ }

    return () => h('div', { class: 'u-pslider' }, [
      h('button', { class: 'u-pslider-arrow left',  onClick: slideL }, '‹'),
      h('div',    { class: 'u-prow', ref: rowRef },
        props.products.map(p =>
          h('div', { class: 'u-card', key: p.id }, [
            p.discount ? h('span', { class: 'u-card-badge' }, `-${p.discount}%`) : null,
            h('div', { class: 'u-card-img' }, [
              h('img', { src: p.image, alt: p.name, onError: fallback }),
              h('div', { class: 'u-card-overlay' }, [
                h('button', { class: 'u-overlay-btn', onClick: () => addCart(p) }, '🛒'),
              ]),
            ]),
            h('div', { class: 'u-card-info' }, [
              h('div', { class: 'u-card-name' }, p.name),
              h('div', { class: 'u-card-price' }, [
                h('span', { class: 'u-price-new' }, fmt(p.price) + 'đ'),
                p.oldPrice ? h('span', { class: 'u-price-old' }, fmt(p.oldPrice) + 'đ') : null,
              ]),
              props.showStock && p.stock != null ? h('div', null, [
                h('div', { class: 'u-stock-bar' }, [
                  h('div', { class: 'u-stock-fill', style: { width: p.stock + '%' } }),
                ]),
                h('span', { class: 'u-stock-text' }, `Còn ${p.stock}%`),
              ]) : null,
            ]),
          ])
        )
      ),
      h('button', { class: 'u-pslider-arrow right', onClick: slideR }, '›'),
    ])
  },
})

/* ── Banner ─────────────────────────────────────────────────────── */
const currentBanner = ref(0)
const banners = [
  { tag: 'Ưu đãi đặc biệt',  title: 'Máy lạnh Inverter tiết kiệm điện',   subtitle: 'Giảm đến 30% — Bảo hành 2 năm chính hãng',   bg: 'linear-gradient(135deg,#1a5c2e 0%,#2d8c4e 100%)' },
  { tag: 'Hàng mới về',       title: 'Thiết bị điện thông minh 2025',      subtitle: 'Nhà thông minh — Giá cực ưu đãi',            bg: 'linear-gradient(135deg,#0b3d6b 0%,#1a6fa8 100%)' },
  { tag: 'Flash Sale hôm nay', title: 'Quạt điện, quạt trần giá sốc',     subtitle: 'Hàng trăm sản phẩm giảm đến 50%',           bg: 'linear-gradient(135deg,#7b0e0e 0%,#c0392b 100%)' },
]
const nextBanner = () => { currentBanner.value = (currentBanner.value + 1) % banners.length }
const prevBanner = () => { currentBanner.value = (currentBanner.value - 1 + banners.length) % banners.length }
let bannerTimer: ReturnType<typeof setInterval>

/* ── Countdown ──────────────────────────────────────────────────── */
const cd = ref({ h: '01', m: '09', s: '55' })
let cdTimer: ReturnType<typeof setInterval>
function startCountdown() {
  let total = 3600 + 9 * 60 + 55
  cdTimer = setInterval(() => {
    if (--total < 0) { clearInterval(cdTimer); return }
    cd.value = {
      h: String(Math.floor(total / 3600)).padStart(2, '0'),
      m: String(Math.floor((total % 3600) / 60)).padStart(2, '0'),
      s: String(total % 60).padStart(2, '0'),
    }
  }, 1000)
}

/* ── Static data (thay bằng API sau) ────────────────────────────── */
const sidebarCats = [
  { icon: '', name: 'Điều hòa, làm lạnh',    slug: 'dieu-hoa' },
  { icon: '', name: 'Điện tủ, tủ lạnh',       slug: 'tu-lanh' },
  { icon: '', name: 'Đồ dùng nhà bếp',        slug: 'nha-bep' },
  { icon: '', name: 'Quạt điện, quạt trần',   slug: 'quat-dien' },
  { icon: '', name: 'Thiết bị điện',           slug: 'thiet-bi-dien' },
  { icon: '', name: 'Nhà thông minh',          slug: 'nha-thong-minh' },
  { icon: '', name: 'Dây cáp điện',            slug: 'day-cap' },
  { icon: '', name: 'Sản phẩm khác',           slug: 'khac' },
]

const brands = ['Panasonic', 'Samsung', 'LG', 'Midea', 'Daikin', 'Rapido', 'Philips', 'Toshiba', 'Sharp', 'Mitsubishi']

const PLACEHOLDER = 'https://via.placeholder.com/200x200/e8f5e9/2d8c4e?text=SP'

const mkProds = (name: string, n: number, base: number, discount = false): Prod[] =>
  Array.from({ length: n }, (_, i) => ({
    id: i + 1,
    name: `${name} ${String.fromCharCode(65 + i)}${i + 1}`,
    image: PLACEHOLDER,
    price: base + i * 200000,
    oldPrice: discount ? base + i * 200000 + 800000 : null,
    discount: discount ? Math.floor(20 + Math.random() * 30) : undefined,
    stock: discount ? Math.floor(20 + Math.random() * 60) : undefined,
  }))

const flashProducts = mkProds('Sản phẩm Flash Sale', 8, 150000, true)

const sections = [
  { id: 's1', slug: 'dieu-hoa',       title: 'Hàng cao cấp',           gradient: 'linear-gradient(90deg,#1a5c2e,#2d8c4e)', products: mkProds('Máy lạnh cao cấp',    6, 8000000) },
  { id: 's2', slug: 'tu-lanh',        title: 'Điện tử, điện lạnh',     gradient: 'linear-gradient(90deg,#1b4f72,#2980b9)', products: mkProds('Quạt điều hòa',       6, 3500000) },
  { id: 's3', slug: 'nha-bep',        title: 'Gia dụng, khỏe & đẹp',  gradient: 'linear-gradient(90deg,#7b241c,#c0392b)', products: mkProds('Ấm điện siêu tốc',    6, 150000)  },
  { id: 's4', slug: 'thiet-bi-dien',  title: 'Thiết bị điện',          gradient: 'linear-gradient(90deg,#4a235a,#8e44ad)', products: mkProds('Bảng công tắc',       6, 90000)   },
  { id: 's5', slug: 'quat-dien',      title: 'Quạt điện, quạt trần',   gradient: 'linear-gradient(90deg,#1a5276,#2471a3)', products: mkProds('Quạt bàn Hali',       6, 190000)  },
  { id: 's6', slug: 'chieu-sang',     title: 'Thiết bị chiếu sáng',    gradient: 'linear-gradient(90deg,#7d6608,#d4ac0d)', products: mkProds('Bảng điều khiển',     6, 45000)   },
  { id: 's7', slug: 'nha-thong-minh', title: 'Nhà thông minh',         gradient: 'linear-gradient(90deg,#0b5345,#1abc9c)', products: mkProds('Bộ cảm biến',         6, 380000)  },
  { id: 's8', slug: 'day-cap',        title: 'Dây cáp điện',           gradient: 'linear-gradient(90deg,#4d0000,#922b21)', products: mkProds('Dây cáp điện',        6, 90000)   },
  { id: 's9', slug: 'khac',           title: 'Sản phẩm khác',          gradient: 'linear-gradient(90deg,#2c3e50,#4d6474)', products: mkProds('Bình giữ nhiệt',      6, 250000)  },
]

/* ── Lifecycle ──────────────────────────────────────────────────── */
onMounted(() => {
  startCountdown()
  bannerTimer = setInterval(nextBanner, 4000)
  // TODO: Khi có backend → cartStore.fetchCart() nếu user đã login
})
onUnmounted(() => {
  clearInterval(cdTimer)
  clearInterval(bannerTimer)
})
</script>
