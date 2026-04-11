<template>
  <div class="auth-page">
    <!-- Nút về trang chủ -->
    <button class="btn-home" @click="router.push('/')">
      Trang chủ
    </button>

    <div class="auth-card">

      <!-- Tabs -->
      <div class="auth-tabs">
        <button class="auth-tab" @click="router.push('/login')">Đăng nhập</button>
        <button class="auth-tab active">Đăng ký</button>
        <div class="auth-tab-indicator" style="left: 50%"></div>
      </div>

      <!-- Alert -->
      <transition name="alert-fade">
        <div v-if="alertMsg" :class="['auth-alert', alertType]">{{ alertMsg }}</div>
      </transition>

      <!-- ══ ĐĂNG KÝ ══ -->
      <form class="auth-form" @submit.prevent="handleRegister">

        <!-- Hàng 1: Họ tên + SĐT -->
        <div class="form-row">
          <div class="form-group">
            <label>Họ và tên</label>
            <div class="input-wrap">
              <input v-model="regForm.fullname" type="text" placeholder="Nguyễn Văn A" required :disabled="loading" />
            </div>
          </div>
          <div class="form-group">
            <label>Số điện thoại</label>
            <div class="input-wrap" :class="{ 'has-error': phoneTouched && !isPhoneValid }">
              <input
                v-model="regForm.phone"
                type="tel"
                placeholder="0901234567"
                required
                :disabled="loading"
                maxlength="10"
                @input="phoneTouched = true; regForm.phone = regForm.phone.replace(/\D/g, '')"
              />
            </div>
            <span v-if="phoneTouched && !isPhoneValid && regForm.phone" class="field-error">
              Số điện thoại không hợp lệ
            </span>
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label>Email</label>
          <div class="input-wrap">
            <input v-model="regForm.email" type="email" placeholder="example@email.com" required :disabled="loading" />
          </div>
        </div>


        <!-- Hàng 2: Mật khẩu + Xác nhận -->
        <div class="form-row">
          <div class="form-group">
            <label>Mật khẩu</label>
            <div class="input-wrap" :class="{ 'has-error': pwdTouched && !isPwdValid }">
              <input
                v-model="regForm.password"
                :type="showPwd ? 'text' : 'password'"
                placeholder="Tối thiểu 8 ký tự"
                required
                :disabled="loading"
                @input="pwdTouched = true"
              />
              <button type="button" class="toggle-pwd" @click="showPwd = !showPwd" tabindex="-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>

            <!-- Password Strength Bar -->
            <div v-if="regForm.password" class="pwd-strength">
              <div class="pwd-strength-track">
                <div
                  class="pwd-strength-fill"
                  :class="pwdStrength.cls"
                  :style="{ width: pwdStrength.pct + '%' }"
                ></div>
              </div>
            </div>

            <!-- Lỗi mật khẩu (chỉ hiện khi không hợp lệ) -->
            <span v-if="pwdTouched && regForm.password && !isPwdValid" class="field-error">
              Mật khẩu cần có ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt.
            </span>
          </div>

          <div class="form-group">
            <label>Xác nhận mật khẩu</label>
            <div class="input-wrap" :class="{ 'has-error': confirmTouched && !isConfirmMatch }">
              <input
                v-model="regForm.confirmPassword"
                :type="showConfirm ? 'text' : 'password'"
                placeholder="Nhập lại mật khẩu"
                required
                :disabled="loading"
                @input="confirmTouched = true"
              />
              <button type="button" class="toggle-pwd" @click="showConfirm = !showConfirm" tabindex="-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
            <span v-if="confirmTouched && !isConfirmMatch && regForm.confirmPassword" class="field-error">
              Mật khẩu không khớp
            </span>
          </div>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading || !canSubmit">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Tạo tài khoản</span>
        </button>

        <!-- Divider -->
        <div class="divider"><span>hoặc</span></div>

        <!-- Nút đăng ký Google -->
        <button type="button" class="btn-google" :disabled="loading" @click="handleGoogleRegister">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Đăng ký bằng Google
        </button>

        <p class="auth-switch">
          Đã có tài khoản?
          <a href="#" @click.prevent="router.push('/login')">Đăng nhập</a>
        </p>
      </form>

    </div>

    <div class="auth-bg-circle c1"></div>
    <div class="auth-bg-circle c2"></div>
    <div class="auth-bg-circle c3"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/user/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const showPwd = ref(false)
const showConfirm = ref(false)
const alertMsg = ref('')
const alertType = ref<'error' | 'success'>('error')
const phoneTouched = ref(false)
const pwdTouched = ref(false)
const confirmTouched = ref(false)

const regForm = reactive({
  fullname: '', email: '', phone: '',
  password: '', confirmPassword: '',
})

// ── Password validation checks ─────────────────────────────────────
const checks = computed(() => ({
  minLen: regForm.password.length >= 8,
  upper:  /[A-Z]/.test(regForm.password),
  lower:  /[a-z]/.test(regForm.password),
  number: /[0-9]/.test(regForm.password),
  symbol: /[^A-Za-z0-9]/.test(regForm.password),
}))

const isPwdValid = computed(() =>
  checks.value.minLen &&
  checks.value.upper &&
  checks.value.lower &&
  checks.value.number &&
  checks.value.symbol
)

const isConfirmMatch = computed(() =>
  regForm.password === regForm.confirmPassword
)

// ── Phone validation ──────────────────────────────────────────────────
const isPhoneValid = computed(() =>
  /^(03|05|07|08|09)\d{8}$/.test(regForm.phone)
)

// Chỉ cho submit khi điện thoại hợp lệ, mật khẩu hợp lệ và khớp
const canSubmit = computed(() =>
  isPhoneValid.value && isPwdValid.value && isConfirmMatch.value
)

// ── Password Strength ──────────────────────────────────────────────
const pwdStrength = computed(() => {
  const score = Object.values(checks.value).filter(Boolean).length
  if (score <= 1) return { pct: 15, cls: 'weak',   label: 'Rất yếu' }
  if (score === 2) return { pct: 35, cls: 'weak',   label: 'Yếu' }
  if (score === 3) return { pct: 55, cls: 'fair',   label: 'Trung bình' }
  if (score === 4) return { pct: 78, cls: 'good',   label: 'Tốt' }
  return              { pct: 100, cls: 'strong', label: 'Rất mạnh' }
})

function showAlert(msg: string, type: 'error' | 'success' = 'error') {
  alertMsg.value = msg; alertType.value = type
  if (type === 'success') setTimeout(() => { alertMsg.value = '' }, 3500)
}

async function handleRegister() {
  phoneTouched.value = true
  pwdTouched.value = true
  confirmTouched.value = true

  if (!isPhoneValid.value) {
    showAlert('Số điện thoại không hợp lệ.'); return
  }
  if (!isPwdValid.value) {
    showAlert('Mật khẩu chưa đủ mạnh. Vui lòng kiểm tra các yêu cầu bên dưới.'); return
  }
  if (!isConfirmMatch.value) {
    showAlert('Mật khẩu xác nhận không khớp!'); return
  }

  loading.value = true; alertMsg.value = ''
  try {
    await authStore.register({
      fullname: regForm.fullname,
      email: regForm.email,
      phone: regForm.phone,
      password: regForm.password,
      password_confirmation: regForm.confirmPassword,
    })
    await authStore.logout()
    showAlert('Đăng ký thành công! Vui lòng đăng nhập.', 'success')
    setTimeout(() => router.push('/login'), 1500)
  } catch (err: any) {
    // Hiển thị lỗi từ backend (bao gồm cả lỗi password phức tạp)
    const backendErrors = err.response?.data?.errors
    if (backendErrors) {
      const firstError = Object.values(backendErrors)[0] as string[]
      showAlert(firstError[0] || 'Đăng ký thất bại.')
    } else {
      showAlert(err.response?.data?.message || err.userMessage || 'Đăng ký thất bại. Vui lòng thử lại.')
    }
  } finally { loading.value = false }
}

async function handleGoogleRegister() {
  await authStore.loginWithGoogle()
}
</script>

<style scoped>
.auth-page {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #e0f2f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  position: relative;
  font-family: 'Segoe UI', sans-serif;
}

.auth-bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: .12;
  pointer-events: none;
}

.c1 { width: 420px; height: 420px; background: #2e7d32; top: -120px; right: -100px; }
.c2 { width: 280px; height: 280px; background: #388e3c; bottom: -80px; left: -80px; }
.c3 { width: 160px; height: 160px; background: #1b5e20; top: 40%; left: 10%; }

/* Nút về trang chủ */
.btn-home {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1.5px solid #c8e6c9;
  color: #2e7d32;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(46, 125, 50, .12);
  transition: background .15s, box-shadow .15s;
}
.btn-home:hover { background: #f1f8e9; box-shadow: 0 4px 14px rgba(46, 125, 50, .18); }

.auth-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px 32px 20px;
  width: 100%;
  max-width: 540px;
  box-shadow: 0 8px 40px rgba(46, 125, 50, .13);
  position: relative;
  z-index: 1;
}

.auth-tabs {
  display: flex;
  background: #f5f5f5;
  border-radius: 10px;
  padding: 4px;
  position: relative;
  margin-bottom: 16px;
}

.auth-tab {
  flex: 1;
  padding: 8px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #888;
  cursor: pointer;
  border-radius: 8px;
  position: relative;
  z-index: 1;
  transition: color .25s;
}
.auth-tab.active { color: #2e7d32; }

.auth-tab-indicator {
  position: absolute;
  top: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
  transition: left .25s cubic-bezier(.4, 0, .2, 1);
}

.auth-alert {
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 12px;
}
.auth-alert.error   { background: #fdecea; color: #c62828; border: 1px solid #ffcdd2; }
.auth-alert.success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }

.alert-fade-enter-active, .alert-fade-leave-active { transition: opacity .25s, transform .25s; }
.alert-fade-enter-from, .alert-fade-leave-to { opacity: 0; transform: translateY(-6px); }

.auth-form { display: flex; flex-direction: column; gap: 10px; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.form-group { display: flex; flex-direction: column; gap: 4px; }

.form-group label { font-size: 12px; font-weight: 600; color: #444; }

.optional { font-weight: 400; color: #aaa; }

.input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color .2s, box-shadow .2s;
  background: #fafafa;
}
.input-wrap:focus-within {
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, .1);
  background: #fff;
}
.input-wrap.has-error {
  border-color: #e53935;
  box-shadow: 0 0 0 3px rgba(229, 57, 53, .08);
}

.input-wrap input {
  flex: 1;
  padding: 9px 10px;
  border: none;
  outline: none;
  font-size: 13px;
  color: #222;
  background: transparent;
}
.input-wrap input::placeholder { color: #bbb; }
.input-wrap input:disabled { opacity: .6; cursor: not-allowed; }
/* Ẩn icon mắt mặc định của trình duyệt */
.input-wrap input::-ms-reveal,
.input-wrap input::-ms-clear { display: none; }
.input-wrap input::-webkit-credentials-auto-fill-button { display: none !important; }

.toggle-pwd {
  background: none;
  border: none;
  padding: 0 10px;
  cursor: pointer;
  color: #aaa;
  display: flex;
  align-items: center;
}
.toggle-pwd:hover { color: #2e7d32; }

/* ── Password Strength ──────────────────────────────────────────── */
.pwd-strength {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.pwd-strength-track {
  flex: 1;
  height: 6px;
  background: #e8e8e8;
  border-radius: 99px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,.06);
}

.pwd-strength-fill {
  height: 100%;
  border-radius: 99px;
  transition: width .4s cubic-bezier(.4,0,.2,1), background-color .4s ease;
}

.pwd-strength-label {
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: .3px;
}

/* Strength colors */
.weak   { background: linear-gradient(90deg,#ef5350,#e53935); color: #e53935; }
.fair   { background: linear-gradient(90deg,#ffa726,#fb8c00); color: #fb8c00; }
.good   { background: linear-gradient(90deg,#66bb6a,#43a047); color: #43a047; }
.strong { background: linear-gradient(90deg,#2e7d32,#1b5e20); color: #2e7d32; }

/* ── Field error ────────────────────────────────────────────────── */
.field-error {
  font-size: 11px;
  color: #e53935;
  margin-top: 3px;
  line-height: 1.4;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #bbb;
  font-size: 12px;
  font-weight: 500;
  margin: 2px 0;
}
.divider::before, .divider::after {
  content: ''; flex: 1; height: 1px; background: #e8e8e8;
}

/* Nút Google */
.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 10px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  cursor: pointer;
  transition: background .15s, border-color .15s, box-shadow .15s;
  min-height: 42px;
}
.btn-google:hover:not(:disabled) {
  background: #f8f8f8;
  border-color: #bbb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}
.btn-google:disabled { opacity: .6; cursor: not-allowed; }

.btn-submit {
  padding: 11px;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background .2s, transform .1s, opacity .2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
}
.btn-submit:hover:not(:disabled) { background: #1b5e20; }
.btn-submit:active:not(:disabled) { transform: scale(.98); }
.btn-submit:disabled { background: #a5d6a7; cursor: not-allowed; opacity: .7; }

.spinner {
  width: 17px;
  height: 17px;
  border: 2.5px solid rgba(255, 255, 255, .4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.auth-switch { text-align: center; font-size: 13px; color: #888; margin-top: 0; }
.auth-switch a { color: #2e7d32; font-weight: 600; text-decoration: none; }
.auth-switch a:hover { text-decoration: underline; }

/* Màn hình nhỏ */
@media (max-width: 560px) {
  .auth-page { height: auto; min-height: 100vh; overflow: auto; padding: 60px 16px 24px; }
  .auth-card { padding: 20px 18px 18px; max-width: 100%; }
  .form-row { grid-template-columns: 1fr; }
  .btn-home { top: 12px; left: 12px; }
}
</style>