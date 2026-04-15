<template>
  <div class="news-page">

    <!-- Hero -->
    <div class="news-hero">
      <div class="hero-bg-pattern"></div>
      <div class="hero-content">
        <h1>Tin tức mới nhất</h1>
        <p>Cập nhật xu hướng điện gia dụng, mẹo tiết kiệm điện và công nghệ thông minh</p>
      </div>
    </div>

    <div class="news-container">

      <!-- Category Filter -->
      <div class="filter-bar">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="filter-btn"
          :class="{ active: activeCategory === cat.value }"
          @click="activeCategory = cat.value"
        >
          {{ cat.label }}
        </button>
      </div>

      <!-- Featured Article (top) -->
      <div v-if="featured" class="featured-article">
        <div class="featured-img">
          <img :src="featured.image" :alt="featured.title" />
          <span class="featured-tag">{{ featured.category }}</span>
        </div>
        <div class="featured-body">
          <div class="meta">
            <span class="meta-date">📅 {{ featured.date }}</span>
            <span class="meta-read">⏱ {{ featured.readTime }} phút đọc</span>
          </div>
          <h2>{{ featured.title }}</h2>
          <p>{{ featured.excerpt }}</p>
          <button class="read-btn">Đọc tiếp →</button>
        </div>
      </div>

      <!-- Grid Articles -->
      <div class="section-title">
        <h3>Bài viết gần đây</h3>
        <span class="section-line"></span>
      </div>

      <div class="articles-grid">
        <div
          v-for="(article, i) in filteredArticles"
          :key="article.id"
          class="article-card"
          :style="{ animationDelay: i * 0.08 + 's' }"
        >
          <div class="card-img">
            <img :src="article.image" :alt="article.title" />
            <span class="card-category">{{ article.category }}</span>
          </div>
          <div class="card-body">
            <div class="card-meta">
              <span>📅 {{ article.date }}</span>
              <span>⏱ {{ article.readTime }} phút</span>
            </div>
            <h4>{{ article.title }}</h4>
            <p>{{ article.excerpt }}</p>
            <div class="card-footer">
              <div class="author">
                <div class="author-avatar">{{ article.author[0] }}</div>
                <span>{{ article.author }}</span>
              </div>
              <button class="read-more">Xem →</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="filteredArticles.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>Chưa có bài viết trong danh mục này</p>
      </div>

      <!-- Newsletter -->
      <div class="newsletter-box">
        <div class="nl-left">
          <div>
            <h3>Đăng ký nhận tin</h3>
            <p>Nhận ngay ưu đãi và tin tức mới nhất từ Green Electric</p>
          </div>
        </div>
        <div class="nl-form">
          <input v-model="email" type="email" placeholder="Nhập email của bạn..." />
          <button @click="subscribeNewsletter">Đăng ký</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeCategory = ref('all')
const email = ref('')

const categories = [
  { value: 'all', label: 'Tất cả' },
  { value: 'tiet-kiem',  label: 'Tiết kiệm điện' },
  { value: 'cong-nghe', label: 'Công nghệ' },
  { value: 'tu-van', label: 'Tư vấn' },
  { value: 'khuyen-mai', label: 'Khuyến mãi' },
]

const allArticles = [
  {
    id: 1,
    title: 'Top 5 điều hoà tiết kiệm điện nhất 2025 cho gia đình Việt',
    excerpt: 'Với mùa hè ngày càng khắc nghiệt, chọn một chiếc điều hoà inverter tiết kiệm điện là quyết định thông minh giúp bạn giảm tới 60% hoá đơn tiền điện hàng tháng.',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
    date: '10/04/2025',
    readTime: 5,
    category: 'Tiết kiệm điện',
    catValue: 'tiet-kiem',
    author: 'Minh Tuấn',
    featured: true,
  },
  {
    id: 2,
    title: 'Máy giặt cửa trước vs cửa trên: Nên chọn loại nào?',
    excerpt: 'So sánh chi tiết ưu nhược điểm của từng loại máy giặt để bạn có lựa chọn phù hợp nhất với không gian và nhu cầu gia đình.',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80',
    date: '08/04/2025',
    readTime: 4,
    category: 'Tư vấn',
    catValue: 'tu-van',
    author: 'Thu Hà',
    featured: false,
  },
  {
    id: 3,
    title: 'Smarthome 2025: Biến ngôi nhà thành tổ ấm thông minh',
    excerpt: 'Công nghệ IoT ngày càng phổ biến tại Việt Nam. Khám phá cách kết nối các thiết bị điện gia dụng để tạo nên ngôi nhà thông minh tiện nghi.',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80',
    date: '06/04/2025',
    readTime: 6,
    category: 'Công nghệ',
    catValue: 'cong-nghe',
    author: 'Hoàng Nam',
    featured: false,
  },
  {
    id: 4,
    title: 'Lỗi thường gặp trên tủ lạnh và cách khắc phục tại nhà',
    excerpt: 'Tủ lạnh không lạnh, chảy nước, phát tiếng ồn lạ? Đây là những nguyên nhân phổ biến và cách tự xử lý trước khi gọi thợ.',
    image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
    date: '04/04/2025',
    readTime: 3,
    category: 'Tư vấn',
    catValue: 'tu-van',
    author: 'Văn Đức',
    featured: false,
  },
  {
    id: 5,
    title: 'Flash Sale tháng 4: Giảm đến 40% toàn bộ điện gia dụng',
    excerpt: 'Green Electric tri ân khách hàng với chương trình giảm giá lớn nhất năm. Hàng ngàn sản phẩm chính hãng giảm sâu chỉ trong 72 giờ!',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
    date: '01/04/2025',
    readTime: 2,
    category: 'Khuyến mãi',
    catValue: 'khuyen-mai',
    author: 'Green Electric',
    featured: false,
  },
  {
    id: 6,
    title: 'Hướng dẫn vệ sinh máy lạnh đúng cách — tự làm tại nhà',
    excerpt: 'Vệ sinh máy lạnh định kỳ giúp tăng hiệu suất làm lạnh 30%, kéo dài tuổi thọ máy và tiết kiệm điện năng đáng kể mỗi tháng.',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80',
    date: '28/03/2025',
    readTime: 5,
    category: 'Tiết kiệm điện',
    catValue: 'tiet-kiem',
    author: 'Thanh Loan',
    featured: false,
  },
]

const featured = computed(() => allArticles.find(a => a.featured))

const filteredArticles = computed(() => {
  const nonFeatured = allArticles.filter(a => !a.featured)
  if (activeCategory.value === 'all') return nonFeatured
  return nonFeatured.filter(a => a.catValue === activeCategory.value)
})

function subscribeNewsletter() {
  if (!email.value) return
  alert(`✅ Đã đăng ký thành công với email: ${email.value}`)
  email.value = ''
}
</script>

<style scoped>
/* ── Base ── */
.news-page {
  background: #f4f6f9;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

/* ── Hero ── */
.news-hero {
  position: relative;
  background: #fff;
  padding: 60px 24px 56px;
  text-align: center;
  overflow: hidden;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.08);
}
.hero-bg-pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 10% 80%, rgba(0,0,0,0.03) 0%, transparent 45%),
    radial-gradient(circle at 90% 20%, rgba(0,0,0,0.02) 0%, transparent 40%);
  pointer-events: none;
}
.hero-content { position: relative; z-index: 1; }
.hero-badge {
  display: inline-block;
  background: #f4f6f9;
  border: 1px solid #dfe5ea;
  color: #2e8b3e;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 6px 18px;
  border-radius: 20px;
  margin-bottom: 18px;
}
.hero-content h1 {
  font-size: 22px;
  font-weight: 700;
  color: #1b5e20;
  margin: 0 0 4px;
}
.hero-content p {
  font-size: 14px;
  color: #888;
  margin: 0;
}

/* ── Container ── */
.news-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 20px 60px;
}

/* ── Filter ── */
.filter-bar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}
.filter-btn {
  padding: 8px 18px;
  border-radius: 24px;
  border: 1.5px solid #dde2e8;
  background: #fff;
  color: #555;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.filter-btn:hover { border-color: #2e8b3e; color: #2e8b3e; }
.filter-btn.active {
  background: linear-gradient(135deg, #1a5c2a, #2e8b3e);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(46,139,62,0.3);
}

/* ── Featured ── */
.featured-article {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 0;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 30px rgba(0,0,0,0.1);
  margin-bottom: 40px;
  border: 1px solid #eef0f4;
}
.featured-img {
  position: relative;
  height: 340px;
  overflow: hidden;
}
.featured-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.featured-article:hover .featured-img img { transform: scale(1.04); }
.featured-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  background: #2e8b3e;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 12px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.featured-body {
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.meta {
  display: flex;
  gap: 16px;
  margin-bottom: 14px;
}
.meta span {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}
.featured-body h2 {
  color: #1a1a1a;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.4;
  margin: 0 0 14px;
}
.featured-body p {
  color: #666;
  font-size: 14px;
  line-height: 1.75;
  margin: 0 0 24px;
}
.read-btn {
  align-self: flex-start;
  background: linear-gradient(135deg, #1a5c2a, #2e8b3e);
  color: #fff;
  border: none;
  padding: 11px 26px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 4px 12px rgba(46,139,62,0.3);
}
.read-btn:hover { opacity: 0.88; transform: translateY(-2px); }

/* ── Section Title ── */
.section-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.section-title h3 {
  color: #1a5c2a;
  font-size: 18px;
  font-weight: 800;
  white-space: nowrap;
  margin: 0;
}
.section-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, #2e8b3e33, transparent);
  border-radius: 2px;
}

/* ── Grid ── */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-bottom: 48px;
}
.article-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #eef0f4;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  transition: transform 0.25s, box-shadow 0.25s;
  animation: fadeUp 0.5s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.article-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(46,139,62,0.12);
}
.card-img {
  position: relative;
  height: 185px;
  overflow: hidden;
}
.card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}
.article-card:hover .card-img img { transform: scale(1.06); }
.card-category {
  position: absolute;
  bottom: 10px;
  left: 12px;
  background: rgba(26,92,42,0.88);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: 0.3px;
  backdrop-filter: blur(4px);
}
.card-body { padding: 18px 16px 16px; }
.card-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
}
.card-meta span { font-size: 11px; color: #aaa; }
.card-body h4 {
  color: #1a1a1a;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.45;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-body p {
  color: #777;
  font-size: 13px;
  line-height: 1.65;
  margin: 0 0 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f2f4f6;
}
.author {
  display: flex;
  align-items: center;
  gap: 8px;
}
.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a5c2a, #2e8b3e);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.author span { font-size: 12px; color: #666; font-weight: 600; }
.read-more {
  background: none;
  border: 1.5px solid #2e8b3e;
  color: #2e8b3e;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.read-more:hover {
  background: #2e8b3e;
  color: #fff;
}

/* ── Empty ── */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #aaa;
}
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state p { font-size: 15px; }

/* ── Newsletter ── */
.newsletter-box {
  background: linear-gradient(135deg, #0d3d1a, #1a5c2a);
  border-radius: 20px;
  padding: 36px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  box-shadow: 0 8px 32px rgba(26,92,42,0.3);
}
.nl-left { display: flex; align-items: center; gap: 20px; }
.nl-icon { font-size: 40px; }
.nl-left h3 { color: #fff; font-size: 18px; font-weight: 800; margin: 0 0 4px; }
.nl-left p  { color: rgba(255,255,255,0.65); font-size: 13px; margin: 0; }
.nl-form { display: flex; gap: 10px; flex-wrap: wrap; }
.nl-form input {
  padding: 12px 18px;
  border-radius: 10px;
  border: none;
  font-size: 14px;
  width: 260px;
  outline: none;
  color: #222;
}
.nl-form button {
  padding: 12px 24px;
  background: #2e8b3e;
  border: 2px solid rgba(255,255,255,0.3);
  color: #fff;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s;
}
.nl-form button:hover { background: #3aa84e; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .articles-grid { grid-template-columns: repeat(2, 1fr); }
  .featured-article { grid-template-columns: 1fr; }
  .featured-img { height: 220px; }
}
@media (max-width: 600px) {
  .articles-grid { grid-template-columns: 1fr; }
  .newsletter-box { flex-direction: column; padding: 28px 20px; }
  .nl-form input { width: 100%; }
  .nl-form { width: 100%; }
  .nl-form button { width: 100%; }
}
</style>