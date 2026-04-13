<template>
  <div class="main-banner">
    <!-- Loading skeleton -->
    <div v-if="loading" class="banner-skeleton">
      <div class="skeleton-shimmer"></div>
    </div>

    <!-- Slides -->
    <template v-else-if="banners.length > 0">
      <div class="banner-slides-container">
        <div
          v-for="(b, i) in banners"
          :key="b.id"
          class="banner-slide"
          :class="{ active: i === current }"
          @click="b.link && $router.push(b.link)"
          :style="b.link ? 'cursor:pointer' : ''"
        >
          <img :src="b.image_url" :alt="b.title" class="banner-img" />

          <!-- Overlay text -->
          <div class="banner-overlay">
            <h2 class="b-title">{{ b.title }}</h2>
            <p v-if="b.description" class="b-sub">{{ b.description }}</p>
            <router-link v-if="b.link" :to="b.link" class="b-cta" @click.stop>
              Xem ngay
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Dots -->
      <div class="b-dots">
        <button
          v-for="(_, i) in banners"
          :key="i"
          :class="['b-dot', { active: i === current }]"
          @click="goTo(i)"
        />
      </div>

      <!-- Arrows -->
      <button class="b-arrow b-prev" @click="prev" aria-label="Previous">&#8249;</button>
      <button class="b-arrow b-next" @click="next" aria-label="Next">&#8250;</button>
    </template>

    <!-- Fallback: dùng data tĩnh khi không có banner từ API -->
    <template v-else>
      <div class="banner-slides-container">
        <div
          v-for="(b, i) in fallbackBanners"
          :key="i"
          class="banner-slide"
          :class="{ active: i === current }"
          :style="{ background: b.bg }"
        >
          <div class="b-shape b-shape-1"></div>
          <div class="b-shape b-shape-2"></div>
          <div class="b-content">
            <span class="b-label">{{ b.label }}</span>
            <h2 class="b-title">{{ b.title }}</h2>
            <p class="b-sub">{{ b.sub }}</p>
            <router-link to="/products" class="b-cta">
              Mua ngay
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </router-link>
          </div>
        </div>
      </div>
      <div class="b-dots">
        <button v-for="(_, i) in fallbackBanners" :key="i" :class="['b-dot', { active: i === current }]" @click="goTo(i)" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { bannerPublicApi } from '@/api'

interface Banner {
  id: number
  title: string
  image_url: string
  link: string | null
  description: string | null
}

const banners  = ref<Banner[]>([])
const loading  = ref(true)
const current  = ref(0)
let   timer: ReturnType<typeof setInterval>

const fallbackBanners = [
  { label: 'Ưu đãi đặc biệt', title: 'Máy lạnh Inverter tiết kiệm điện', sub: 'Bảo hành 2 năm chính hãng', bg: 'linear-gradient(135deg,#0d4f2d 0%,#1e8a52 60%,#0d7a42 100%)' },
  { label: 'Hàng mới về',     title: 'Thiết bị điện thông minh 2025',   sub: 'Nhà thông minh – Giá cực ưu đãi', bg: 'linear-gradient(135deg,#0a2d5c 0%,#1255a8 60%,#0e4d96 100%)' },
  { label: 'Flash Sale',      title: 'Quạt điện giảm sốc',               sub: 'Giảm đến 50% mỗi ngày',           bg: 'linear-gradient(135deg,#5c1d0a 0%,#b53a1a 60%,#9e2d0d 100%)' },
]

onMounted(async () => {
  try {
    const res    = await bannerPublicApi.getActive()
    banners.value = res.data.data ?? res.data
  } catch {
    // giữ fallback
  } finally {
    loading.value = false
  }
  startTimer()
})

onUnmounted(() => clearInterval(timer))

function startTimer() {
  timer = setInterval(next, 4500)
}
function resetTimer() {
  clearInterval(timer)
  startTimer()
}

const total = () => banners.value.length || fallbackBanners.length

function next()        { current.value = (current.value + 1) % total(); resetTimer() }
function prev()        { current.value = (current.value - 1 + total()) % total(); resetTimer() }
function goTo(i: number) { current.value = i; resetTimer() }
</script>

<style scoped>
.main-banner {
  position: relative;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 16/6;
  min-height: 220px;
  background: var(--gray-100);
}

/* Skeleton */
.banner-skeleton { width:100%; height:100%; }
.skeleton-shimmer {
  width:100%; height:100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

/* Slides */
.banner-slides-container { width:100%; height:100%; position:relative; }
.banner-slide {
  position: absolute; inset: 0;
  opacity: 0;
  transition: opacity .6s ease;
  display: flex;
  align-items: center;
}
.banner-slide.active { opacity: 1; z-index: 1; }

/* Ảnh từ API */
.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Overlay text khi có ảnh thật */
.banner-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 20px 28px;
  background: linear-gradient(to top, rgba(0,0,0,.65) 0%, transparent 100%);
  color: #fff;
}
.banner-overlay .b-title { font-size: clamp(18px,3vw,28px); font-weight: 700; margin:0 0 4px; }
.banner-overlay .b-sub   { font-size: 14px; opacity:.85; margin:0 0 12px; }

/* Fallback content */
.b-content {
  padding: 28px 32px;
  color: #fff;
  z-index: 2;
  max-width: 60%;
}
.b-label { background: rgba(255,255,255,.2); border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; letter-spacing:.5px; }
.b-title { font-size: clamp(20px,4vw,36px); font-weight: 800; margin: 12px 0 8px; line-height: 1.2; }
.b-sub   { font-size: 14px; opacity: .8; margin: 0 0 20px; }
.b-shape {
  position: absolute;
  border-radius: 50%;
  opacity: .08;
  background: rgba(255,255,255,1);
}
.b-shape-1 { width:260px;height:260px;right:-40px;top:-60px; }
.b-shape-2 { width:160px;height:160px;right:100px;bottom:-40px; }

/* CTA button */
.b-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  color: #111;
  font-weight: 700;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: 8px;
  text-decoration: none;
  transition: opacity .2s;
}
.b-cta:hover { opacity: .85; }

/* Dots */
.b-dots {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  z-index: 5;
}
.b-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: rgba(255,255,255,.5);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all .2s;
}
.b-dot.active { background: #fff; width: 24px; border-radius: 4px; }

/* Arrows */
.b-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,.3);
  color: #fff;
  border: none;
  width: 36px; height: 36px;
  border-radius: 50%;
  font-size: 22px;
  cursor: pointer;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .2s;
  backdrop-filter: blur(4px);
}
.b-arrow:hover { background: rgba(0,0,0,.55); }
.b-prev { left: 12px; }
.b-next { right: 12px; }
</style>