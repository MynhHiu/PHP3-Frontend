<template>
  <div class="auth-page">
    <!-- Nút về trang chủ -->
    <button class="btn-home" @click="router.push('/')">
      Trang chủ
    </button>

    <div class="auth-card">

      <!-- Logo -->
      <!-- <div class="auth-logo">
        <img :src="logoImage" alt="GreenElectric" class="logo" />
      </div> -->

      <!-- Tabs -->
      <div class="auth-tabs">
        <button class="auth-tab active">Đăng nhập</button>
        <button class="auth-tab" @click="router.push('/register')">Đăng ký</button>
        <div class="auth-tab-indicator" style="left: 4px"></div>
      </div>

      <!-- Alert -->
      <transition name="alert-fade">
        <div v-if="alertMsg" :class="['auth-alert', alertType]">{{ alertMsg }}</div>
      </transition>

      <!-- ══ ĐĂNG NHẬP ══ -->
      <form v-if="tab === 'login'" class="auth-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Email</label>
          <div class="input-wrap">
            <span class="input-icon"></span>
            <input v-model="loginForm.email" type="email" placeholder="example@email.com"
              required :disabled="loading" />
          </div>
        </div>
        <div class="form-group">
          <label>Mật khẩu</label>
          <div class="input-wrap">
            <span class="input-icon"></span>
            <input v-model="loginForm.password" :type="showPwd ? 'text' : 'password'"
              placeholder="Nhập mật khẩu" required :disabled="loading" />
            <!-- <button type="button" class="toggle-pwd" @click="showPwd = !showPwd">
              {{ showPwd ? 'Ẩn' : 'Hiện' }}
            </button> -->
          </div>
        </div>
        <div class="forgot-link">
          <a href="#" @click.prevent="tab = 'forgot'">Quên mật khẩu?</a>
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Đăng nhập</span>
        </button>

        <!-- Divider -->
        <div class="divider"><span>hoặc</span></div>

        <!-- Nút đăng nhập Google -->
        <button type="button" class="btn-google" :disabled="loading" @click="handleGoogleLogin">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Đăng nhập bằng Google
        </button>

        <p class="auth-switch">
          Chưa có tài khoản?
          <a href="#" @click.prevent="router.push('/register')">Đăng ký ngay</a>
        </p>
      </form>

      <!-- ══ QUÊN MẬT KHẨU ══ -->
      <template v-if="tab === 'forgot' || tab === 'otp' || tab === 'reset'">
        <div class="auth-back-header">
          <button class="btn-back" @click="goBack">← Quay lại</button>
          <h2 class="screen-title">
            <template v-if="tab === 'forgot'">Quên mật khẩu</template>
            <template v-else-if="tab === 'otp'">Xác minh OTP</template>
            <template v-else>Đặt mật khẩu mới</template>
          </h2>
        </div>

        <transition name="alert-fade">
          <div v-if="alertMsg" :class="['auth-alert', alertType]">{{ alertMsg }}</div>
        </transition>

        <!-- Forgot -->
        <form v-if="tab === 'forgot'" class="auth-form" @submit.prevent="handleSendOtp">
          <p class="screen-desc">Nhập email đã đăng ký. Chúng tôi sẽ gửi mã OTP 6 số để xác minh danh tính.</p>
          <div class="form-group">
            <label>Email</label>
            <div class="input-wrap">
              <span class="input-icon"></span>
              <input v-model="forgotEmail" type="email" placeholder="example@email.com"
                required :disabled="loading" />
            </div>
          </div>
          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Gửi mã OTP</span>
          </button>
        </form>

        <!-- OTP -->
        <form v-else-if="tab === 'otp'" class="auth-form" @submit.prevent="handleVerifyOtp">
          <p class="screen-desc">
            Mã OTP đã được gửi đến <strong>{{ forgotEmail }}</strong>.<br/>
            Vui lòng kiểm tra hộp thư (kể cả thư mục spam).
          </p>
          <div class="otp-inputs">
            <input v-for="(_, i) in otpDigits" :key="i"
              :ref="el => { if (el) otpRefs[i] = el as HTMLInputElement }"
              v-model="otpDigits[i]" type="text" inputmode="numeric" maxlength="1"
              class="otp-input" :disabled="loading"
              @input="onOtpInput(i)" @keydown.backspace="onOtpBackspace(i)"
              @paste.prevent="onOtpPaste" />
          </div>
          <div class="otp-resend">
            <template v-if="countdown > 0">
              <span class="otp-timer">Gửi lại sau {{ countdown }}s</span>
            </template>
            <template v-else>
              <a href="#" @click.prevent="handleResendOtp" class="otp-resend-link">
                {{ resendLoading ? 'Đang gửi...' : 'Gửi lại mã OTP' }}
              </a>
            </template>
          </div>
          <button type="submit" class="btn-submit" :disabled="loading || otpValue.length < 6">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Xác minh OTP</span>
          </button>
        </form>

        <!-- Reset -->
        <form v-else-if="tab === 'reset'" class="auth-form" @submit.prevent="handleResetPassword">
          <p class="screen-desc">Tạo mật khẩu mới cho tài khoản <strong>{{ forgotEmail }}</strong>.</p>
          <div class="form-group">
            <label>Mật khẩu mới</label>
            <div class="input-wrap">
              <span class="input-icon"></span>
              <input v-model="resetForm.password" :type="showPwd ? 'text' : 'password'"
                placeholder="Tối thiểu 6 ký tự" required minlength="6" :disabled="loading" />
              <button type="button" class="toggle-pwd" @click="showPwd = !showPwd">
                {{ showPwd ? 'x' : 'o' }}
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>Xác nhận mật khẩu mới</label>
            <div class="input-wrap">
              <span class="input-icon"></span>
              <input v-model="resetForm.confirmPassword" :type="showPwd ? 'text' : 'password'"
                placeholder="Nhập lại mật khẩu mới" required :disabled="loading" />
            </div>
          </div>
          <button type="submit" class="btn-submit" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Đặt lại mật khẩu</span>
          </button>
        </form>
      </template>

    </div>

    <div class="auth-bg-circle c1"></div>
    <div class="auth-bg-circle c2"></div>
    <div class="auth-bg-circle c3"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/user/stores/authStore'
import { authApi } from '@/api/index'
import logoImage from '@/assets/image/image-removebg-preview.png'

type Tab = 'login' | 'forgot' | 'otp' | 'reset'

const authStore = useAuthStore()
const router    = useRouter()
const route     = useRoute()

const tab     = ref<Tab>('login')
const loading = ref(false)
const showPwd = ref(false)
const alertMsg  = ref('')
const alertType = ref<'error' | 'success'>('error')

const loginForm   = reactive({ email: '', password: '' })
const forgotEmail = ref('')
const resetForm   = reactive({ password: '', confirmPassword: '' })

// OTP
const otpDigits     = reactive(['', '', '', '', '', ''])
const otpRefs       = ref<HTMLInputElement[]>([])
const otpValue      = computed(() => otpDigits.join(''))
const countdown     = ref(0)
const resendLoading = ref(false)
let countdownTimer: ReturnType<typeof setInterval> | null = null

function showAlert(msg: string, type: 'error' | 'success' = 'error') {
  alertMsg.value = msg; alertType.value = type
  if (type === 'success') setTimeout(() => { alertMsg.value = '' }, 3500)
}

function startCountdown(seconds: number) {
  countdown.value = seconds
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0 && countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
  }, 1000)
}

onUnmounted(() => { if (countdownTimer) clearInterval(countdownTimer) })

function onOtpInput(i: number) {
  const val = otpDigits[i]
  if (val && i < 5) otpRefs.value[i + 1]?.focus()
}
function onOtpBackspace(i: number) {
  if (!otpDigits[i] && i > 0) { otpDigits[i - 1] = ''; otpRefs.value[i - 1]?.focus() }
}
function onOtpPaste(e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text') ?? ''
  const digits = text.replace(/\D/g, '').slice(0, 6).split('')
  digits.forEach((d, i) => { otpDigits[i] = d })
  otpRefs.value[Math.min(digits.length, 5)]?.focus()
}

function goBack() {
  if (tab.value === 'forgot') tab.value = 'login'
  else if (tab.value === 'otp') tab.value = 'forgot'
  else if (tab.value === 'reset') tab.value = 'otp'
}

function redirectAfterAuth() {
  const redirect = route.query.redirect as string
  router.push(redirect && redirect !== '/login' ? redirect : '/')
}

async function handleLogin() {
  loading.value = true; alertMsg.value = ''
  try {
    await authStore.login(loginForm.email, loginForm.password)
    showAlert('Đăng nhập thành công!', 'success')
    setTimeout(redirectAfterAuth, 800)
  } catch (err: any) {
    showAlert(err.userMessage || 'Email hoặc mật khẩu không đúng.')
  } finally { loading.value = false }
}

async function handleGoogleLogin() {
  await authStore.loginWithGoogle()
}

async function handleSendOtp() {
  loading.value = true; alertMsg.value = ''
  try {
    await authApi.sendOtp(forgotEmail.value)
    showAlert('Mã OTP đã gửi! Kiểm tra email của bạn.', 'success')
    otpDigits.forEach((_, i) => { otpDigits[i] = '' })
    startCountdown(120)
    tab.value = 'otp'
  } catch (err: any) {
    showAlert(err.userMessage || 'Không thể gửi OTP. Kiểm tra lại email.')
  } finally { loading.value = false }
}

async function handleResendOtp() {
  resendLoading.value = true; alertMsg.value = ''
  try {
    await authApi.sendOtp(forgotEmail.value)
    showAlert('Đã gửi lại mã OTP mới!', 'success')
    otpDigits.forEach((_, i) => { otpDigits[i] = '' })
    startCountdown(120)
    otpRefs.value[0]?.focus()
  } catch (err: any) {
    showAlert(err.userMessage || 'Gửi lại thất bại. Thử lại sau.')
  } finally { resendLoading.value = false }
}

async function handleVerifyOtp() {
  if (otpValue.value.length < 6) { showAlert('Vui lòng nhập đủ 6 chữ số OTP.'); return }
  loading.value = true; alertMsg.value = ''
  try {
    await authApi.verifyOtp(forgotEmail.value, otpValue.value)
    showAlert('Xác minh thành công!', 'success')
    setTimeout(() => { tab.value = 'reset' }, 800)
  } catch (err: any) {
    showAlert(err.userMessage || 'Mã OTP không đúng hoặc đã hết hạn.')
  } finally { loading.value = false }
}

async function handleResetPassword() {
  if (resetForm.password !== resetForm.confirmPassword) { showAlert('Mật khẩu xác nhận không khớp!'); return }
  loading.value = true; alertMsg.value = ''
  try {
    await authApi.resetPassword(forgotEmail.value, otpValue.value, resetForm.password, resetForm.confirmPassword)
    showAlert('Đặt lại mật khẩu thành công! Chuyển về đăng nhập...', 'success')
    setTimeout(() => { loginForm.email = forgotEmail.value; loginForm.password = ''; tab.value = 'login' }, 1500)
  } catch (err: any) {
    showAlert(err.userMessage || 'Đặt lại mật khẩu thất bại. Thử lại.')
  } finally { loading.value = false }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 50%, #e0f2f1 100%);
  display: flex; align-items: center; justify-content: center;
  padding: 24px 16px; position: relative; overflow: hidden;
  font-family: 'Segoe UI', sans-serif;
}
.auth-bg-circle { position: absolute; border-radius: 50%; opacity: .12; pointer-events: none; }
.c1 { width: 420px; height: 420px; background: #2e7d32; top: -120px; right: -100px; }
.c2 { width: 280px; height: 280px; background: #388e3c; bottom: -80px; left: -80px; }
.c3 { width: 160px; height: 160px; background: #1b5e20; top: 40%; left: 10%; }

/* Nút về trang chủ */
.btn-home {
  position: fixed; top: 18px; left: 18px; z-index: 10;
  display: flex; align-items: center; gap: 6px;
  background: #fff; border: 1.5px solid #c8e6c9; color: #2e7d32;
  font-size: 13px; font-weight: 600; padding: 7px 14px; border-radius: 20px;
  cursor: pointer; box-shadow: 0 2px 8px rgba(46,125,50,.12);
  transition: background .15s, box-shadow .15s;
}
.btn-home:hover { background: #f1f8e9; box-shadow: 0 4px 14px rgba(46,125,50,.18); }

.auth-card {
  background: #fff; border-radius: 16px; padding: 36px 40px 32px;
  width: 100%; max-width: 440px;
  box-shadow: 0 8px 40px rgba(46,125,50,.13); position: relative; z-index: 1;
}
.auth-logo { display: flex; justify-content: center; margin-bottom: 8px; }
.logo { max-width: 70px; height: auto; }

.auth-tabs {
  display: flex; background: #f5f5f5; border-radius: 10px;
  padding: 4px; position: relative; margin-bottom: 20px;
}
.auth-tab {
  flex: 1; padding: 9px; border: none; background: transparent;
  font-size: 14px; font-weight: 600; color: #888; cursor: pointer;
  border-radius: 8px; position: relative; z-index: 1; transition: color .25s;
}
.auth-tab.active { color: #2e7d32; }
.auth-tab-indicator {
  position: absolute; top: 4px; width: calc(50% - 4px); height: calc(100% - 8px);
  background: #fff; border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08); transition: left .25s cubic-bezier(.4,0,.2,1);
}

.auth-back-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.btn-back {
  background: #f1f8e9; border: 1px solid #c8e6c9; color: #2e7d32;
  font-size: 13px; font-weight: 600; padding: 6px 12px; border-radius: 8px;
  cursor: pointer; transition: background .15s; white-space: nowrap;
}
.btn-back:hover { background: #dcedc8; }
.screen-title { margin: 0; font-size: 18px; font-weight: 700; color: #2e7d32; }
.screen-desc { font-size: 13.5px; color: #666; line-height: 1.6; margin-bottom: 18px; }

.auth-alert { padding: 10px 14px; border-radius: 8px; font-size: 13.5px; font-weight: 500; margin-bottom: 16px; }
.auth-alert.error   { background: #fdecea; color: #c62828; border: 1px solid #ffcdd2; }
.auth-alert.success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
.alert-fade-enter-active, .alert-fade-leave-active { transition: opacity .25s, transform .25s; }
.alert-fade-enter-from, .alert-fade-leave-to { opacity: 0; transform: translateY(-6px); }

.auth-form { display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 13px; font-weight: 600; color: #444; }

.input-wrap {
  display: flex; align-items: center; border: 1.5px solid #e0e0e0;
  border-radius: 8px; overflow: hidden; transition: border-color .2s, box-shadow .2s; background: #fafafa;
}
.input-wrap:focus-within { border-color: #2e7d32; box-shadow: 0 0 0 3px rgba(46,125,50,.1); background: #fff; }
.input-icon { padding: 0 10px 0 12px; font-size: 15px; color: #aaa; user-select: none; }
.input-wrap input {
  flex: 1; padding: 10px 8px 10px 0; border: none; outline: none;
  font-size: 14px; color: #222; background: transparent;
}
.input-wrap input::placeholder { color: #bbb; }
.input-wrap input:disabled { opacity: .6; cursor: not-allowed; }
.toggle-pwd { background: none; border: none; padding: 0 12px; font-size: 15px; cursor: pointer; color: #aaa; }
.toggle-pwd:hover { color: #2e7d32; }

.forgot-link { text-align: right; margin-top: -6px; }
.forgot-link a { font-size: 13px; color: #2e7d32; font-weight: 600; text-decoration: none; }
.forgot-link a:hover { text-decoration: underline; }

/* Divider */
.divider {
  display: flex; align-items: center; gap: 10px;
  color: #bbb; font-size: 12px; font-weight: 500; margin: 2px 0;
}
.divider::before, .divider::after {
  content: ''; flex: 1; height: 1px; background: #e8e8e8;
}

/* Nút Google */
.btn-google {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; padding: 11px; border: 1.5px solid #e0e0e0;
  border-radius: 8px; background: #fff; font-size: 14px; font-weight: 600;
  color: #444; cursor: pointer; transition: background .15s, border-color .15s, box-shadow .15s;
  min-height: 46px;
}
.btn-google:hover:not(:disabled) { background: #f8f8f8; border-color: #bbb; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.btn-google:disabled { opacity: .6; cursor: not-allowed; }

.otp-inputs { display: flex; gap: 10px; justify-content: center; margin: 4px 0 8px; }
.otp-input {
  width: 48px; height: 56px; text-align: center; font-size: 22px; font-weight: 700;
  color: #2e7d32; border: 2px solid #e0e0e0; border-radius: 10px; outline: none;
  background: #fafafa; transition: border-color .2s, box-shadow .2s; caret-color: #2e7d32;
}
.otp-input:focus { border-color: #2e7d32; box-shadow: 0 0 0 3px rgba(46,125,50,.12); background: #fff; }
.otp-input:disabled { opacity: .5; cursor: not-allowed; }
.otp-resend { text-align: center; font-size: 13px; margin-top: 4px; }
.otp-timer { color: #999; }
.otp-resend-link { color: #2e7d32; font-weight: 600; text-decoration: none; cursor: pointer; }
.otp-resend-link:hover { text-decoration: underline; }

.btn-submit {
  margin-top: 4px; padding: 12px; background: #2e7d32; color: #fff;
  border: none; border-radius: 8px; font-size: 15px; font-weight: 700;
  cursor: pointer; transition: background .2s, transform .1s;
  display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 46px;
}
.btn-submit:hover:not(:disabled) { background: #1b5e20; }
.btn-submit:active:not(:disabled) { transform: scale(.98); }
.btn-submit:disabled { background: #a5d6a7; cursor: not-allowed; }

.spinner {
  width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,.4);
  border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.auth-switch { text-align: center; font-size: 13px; color: #888; margin-top: 2px; }
.auth-switch a { color: #2e7d32; font-weight: 600; text-decoration: none; }
.auth-switch a:hover { text-decoration: underline; }

@media (max-width: 480px) {
  .auth-card { padding: 28px 20px 24px; }
  .otp-input { width: 40px; height: 48px; font-size: 18px; }
  .otp-inputs { gap: 7px; }
  .btn-home { top: 12px; left: 12px; }
}
</style>