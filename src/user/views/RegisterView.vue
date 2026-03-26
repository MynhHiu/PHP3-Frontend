    <template>
  <div class="auth-page">
    <div class="auth-card">

      <!-- Logo -->
      <div class="auth-logo">
        <img :src="logoImage" alt="GreenElectric" class="logo" />
      </div>

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
        <div class="form-group">
          <label>Họ và tên</label>
          <div class="input-wrap">
            <span class="input-icon"></span>
            <input v-model="regForm.fullname" type="text" placeholder="Nguyễn Văn A"
              required :disabled="loading" />
          </div>
        </div>
        <div class="form-group">
          <label>Email</label>
          <div class="input-wrap">
            <span class="input-icon"></span>
            <input v-model="regForm.email" type="email" placeholder="example@email.com"
              required :disabled="loading" />
          </div>
        </div>
        <div class="form-group">
          <label>Số điện thoại</label>
          <div class="input-wrap">
            <span class="input-icon"></span>
            <input v-model="regForm.phone" type="tel" placeholder="0901234567"
              required :disabled="loading" />
          </div>
        </div>
        <div class="form-group">
          <label>Địa chỉ <span class="optional">(tùy chọn)</span></label>
          <div class="input-wrap">
            <span class="input-icon"></span>
            <input v-model="regForm.address" type="text" placeholder="123 Đường ABC, TP. HCM"
              :disabled="loading" />
          </div>
        </div>
        <div class="form-group">
          <label>Mật khẩu</label>
          <div class="input-wrap">
            <span class="input-icon"></span>
            <input v-model="regForm.password" :type="showPwd ? 'text' : 'password'"
              placeholder="Tối thiểu 6 ký tự" required minlength="6" :disabled="loading" />
            <button type="button" class="toggle-pwd" @click="showPwd = !showPwd">
              {{ showPwd ? 'Ẩn' : 'hiện' }}
            </button>
          </div>
        </div>
        <div class="form-group">
          <label>Xác nhận mật khẩu</label>
          <div class="input-wrap">
            <span class="input-icon"></span>
            <input v-model="regForm.confirmPassword" :type="showPwd ? 'text' : 'password'"
              placeholder="Nhập lại mật khẩu" required :disabled="loading" />
          </div>
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Tạo tài khoản</span>
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
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/user/stores/authStore'
import logoImage from '@/assets/image/image-removebg-preview.png'

const authStore = useAuthStore()
const router    = useRouter()
const route     = useRoute()

const loading   = ref(false)
const showPwd   = ref(false)
const alertMsg  = ref('')
const alertType = ref<'error' | 'success'>('error')

const regForm = reactive({
  fullname: '', email: '', phone: '',
  address: '', password: '', confirmPassword: '',
})

function showAlert(msg: string, type: 'error' | 'success' = 'error') {
  alertMsg.value = msg; alertType.value = type
  if (type === 'success') setTimeout(() => { alertMsg.value = '' }, 3500)
}

async function handleRegister() {
  if (regForm.password !== regForm.confirmPassword) {
    showAlert('Mật khẩu xác nhận không khớp!'); return
  }
  loading.value = true; alertMsg.value = ''
  try {
    await authStore.register({
      fullname: regForm.fullname,
      email:    regForm.email,
      phone:    regForm.phone,
      password: regForm.password,
      address:  regForm.address || undefined,
    })
    // Đăng xuất ngay sau khi đăng ký xong
    await authStore.logout()
    showAlert('Đăng ký thành công! Vui lòng đăng nhập.', 'success')
    setTimeout(() => router.push('/login'), 1500)
  } catch (err: any) {
    showAlert(err.userMessage || 'Đăng ký thất bại. Vui lòng thử lại.')
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

.auth-alert { padding: 10px 14px; border-radius: 8px; font-size: 13.5px; font-weight: 500; margin-bottom: 16px; }
.auth-alert.error   { background: #fdecea; color: #c62828; border: 1px solid #ffcdd2; }
.auth-alert.success { background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9; }
.alert-fade-enter-active, .alert-fade-leave-active { transition: opacity .25s, transform .25s; }
.alert-fade-enter-from, .alert-fade-leave-to { opacity: 0; transform: translateY(-6px); }

.auth-form { display: flex; flex-direction: column; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 13px; font-weight: 600; color: #444; }
.optional { font-weight: 400; color: #aaa; }

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
}
</style>