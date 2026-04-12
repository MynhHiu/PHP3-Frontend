<template>
  <div class="contact-page">
    <!-- Hero Banner -->
    <div class="contact-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <span class="hero-label">Hỗ trợ khách hàng</span>
        <h1 class="hero-title">Liên hệ với chúng tôi</h1>
        <p class="hero-sub">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7</p>
      </div>
    </div>

    <div class="contact-wrapper">
      <!-- Info Cards -->
      <div class="info-section">
        <div class="info-card">
          <div class="info-icon">📍</div>
          <h3>Địa chỉ</h3>
          <p>515 Hà Huy Tập Buôn Ma Thuột<br/>Dak Lak, Việt Nam</p>
        </div>
        <div class="info-card">
          <div class="info-icon">📞</div>
          <h3>Điện thoại</h3>
          <p>03 74 653 150</p>
          <span class="info-note">Thứ 2 – Thứ 7, 8:00–17:00</span>
        </div>
        <div class="info-card">
          <div class="info-icon">✉️</div>
          <h3>Email</h3>
          <p>anhnttpk04082@gmail.com</p>
          <span class="info-note">Phản hồi trong 24 giờ</span>
        </div>
      </div>

      <!-- Form Section -->
      <div class="form-section">
        <div class="form-card">
          <div class="form-header">
            <h2>Gửi tin nhắn cho chúng tôi</h2>
            <p>Điền thông tin bên dưới, chúng tôi sẽ liên hệ lại sớm nhất</p>
          </div>

          <form @submit.prevent="handleSubmit" class="contact-form">
            <div class="form-row">
              <div class="form-group">
                <label>Họ và tên <span class="required">*</span></label>
                <div class="input-wrap">
                  <span class="input-icon">👤</span>
                  <input
                    v-model="form.fullname"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </div>
              </div>
              <div class="form-group">
                <label>Email <span class="required">*</span></label>
                <div class="input-wrap">
                  <span class="input-icon">📧</span>
                  <input
                    v-model="form.email"
                    type="email"
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Số điện thoại</label>
                <div class="input-wrap">
                  <span class="input-icon">📱</span>
                  <input
                    v-model="form.phone"
                    type="tel"
                    placeholder="0xxx xxx xxx"
                  />
                </div>
              </div>
              <div class="form-group">
                <label>Tiêu đề <span class="required">*</span></label>
                <div class="input-wrap">
                  <span class="input-icon">📝</span>
                  <input
                    v-model="form.subject"
                    type="text"
                    placeholder="Chủ đề bạn muốn hỏi"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="form-group full">
              <label>Nội dung <span class="required">*</span></label>
              <textarea
                v-model="form.message"
                rows="5"
                placeholder="Nhập nội dung tin nhắn của bạn tại đây..."
                required
              ></textarea>
            </div>

            <!-- Alerts -->
            <transition name="fade">
              <div v-if="successMsg" class="alert alert-success">
                <span>✅</span> {{ successMsg }}
              </div>
            </transition>
            <transition name="fade">
              <div v-if="errorMsg" class="alert alert-error">
                <span>❌</span> {{ errorMsg }}
              </div>
            </transition>

            <button type="submit" class="submit-btn" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              <span v-else>Gửi liên hệ →</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { contactApi } from '@/api/index'

const form = ref({ fullname: '', email: '', phone: '', subject: '', message: '' })
const loading    = ref(false)
const successMsg = ref('')
const errorMsg   = ref('')

async function handleSubmit() {
  loading.value    = true
  successMsg.value = ''
  errorMsg.value   = ''
  try {
    await contactApi.send(form.value)
    successMsg.value = 'Gửi liên hệ thành công! Chúng tôi sẽ phản hồi trong 24 giờ.'
    form.value = { fullname: '', email: '', phone: '', subject: '', message: '' }
  } catch (err: any) {
    errorMsg.value = err.userMessage || 'Có lỗi xảy ra, vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ── Page ── */
.contact-page {
  background: #f5f6fa;
  min-height: 100vh;
  font-family: 'Segoe UI', sans-serif;
}

/* ── Hero ── */
.contact-hero {
  position: relative;
  background: linear-gradient(135deg, #1a5c2a 0%, #2e8b3e 50%, #1a5c2a 100%);
  padding: 64px 24px;
  text-align: center;
  overflow: hidden;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%);
  pointer-events: none;
}
.hero-content { position: relative; z-index: 1; }
.hero-label {
  display: inline-block;
  background: rgba(255,255,255,0.15);
  color: #a8f0b8;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 6px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
  border: 1px solid rgba(255,255,255,0.2);
}
.hero-title {
  color: #fff;
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 800;
  margin: 0 0 12px;
  letter-spacing: -0.5px;
}
.hero-sub {
  color: rgba(255,255,255,0.75);
  font-size: 16px;
  margin: 0;
}

/* ── Wrapper ── */
.contact-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 60px;
}

/* ── Info Cards ── */
.info-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}
.info-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  border: 1px solid #eef0f4;
  transition: transform 0.2s, box-shadow 0.2s;
}
.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(46,139,62,0.12);
}
.info-icon {
  font-size: 32px;
  margin-bottom: 12px;
}
.info-card h3 {
  color: #1a5c2a;
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.info-card p {
  color: #444;
  font-size: 14px;
  margin: 0 0 4px;
  line-height: 1.6;
}
.info-note {
  font-size: 12px;
  color: #999;
}

/* ── Form Card ── */
.form-card {
  background: #fff;
  border-radius: 20px;
  padding: 40px 44px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  border: 1px solid #eef0f4;
}
.form-header {
  margin-bottom: 32px;
  border-bottom: 2px solid #f0f4f0;
  padding-bottom: 24px;
}
.form-header h2 {
  color: #1a5c2a;
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 8px;
}
.form-header p {
  color: #777;
  font-size: 14px;
  margin: 0;
}

/* ── Form Fields ── */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-group.full { margin-bottom: 20px; }

label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  letter-spacing: 0.2px;
}
.required { color: #e53935; }

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.input-icon {
  position: absolute;
  left: 14px;
  font-size: 15px;
  pointer-events: none;
  z-index: 1;
}
.input-wrap input {
  width: 100%;
  padding: 12px 14px 12px 42px;
  border: 1.5px solid #e0e4e8;
  border-radius: 10px;
  font-size: 14px;
  color: #222;
  background: #fafbfc;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  outline: none;
  box-sizing: border-box;
}
.input-wrap input:focus {
  border-color: #2e8b3e;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(46,139,62,0.1);
}
.input-wrap input::placeholder { color: #bbb; }

textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #e0e4e8;
  border-radius: 10px;
  font-size: 14px;
  color: #222;
  background: #fafbfc;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}
textarea:focus {
  border-color: #2e8b3e;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(46,139,62,0.1);
}
textarea::placeholder { color: #bbb; }

/* ── Alerts ── */
.alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
}
.alert-success {
  background: #f0faf3;
  color: #1a5c2a;
  border: 1px solid #a8f0b8;
}
.alert-error {
  background: #fff5f5;
  color: #c62828;
  border: 1px solid #ffcdd2;
}

/* ── Submit Button ── */
.submit-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #1a5c2a, #2e8b3e);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.3px;
  transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 14px rgba(46,139,62,0.35);
}
.submit-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(46,139,62,0.45);
}
.submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
}

/* ── Spinner ── */
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Fade transition ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Responsive ── */
@media (max-width: 768px) {
  .info-section { grid-template-columns: 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .form-card { padding: 28px 20px; }
}
</style>