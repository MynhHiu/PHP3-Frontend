<template>
  <div class="callback-page">
    <div class="callback-card">
      <template v-if="status === 'loading'">
        <div class="spinner-large"></div>
        <p class="callback-text">Đang xác thực với Google...</p>
      </template>

      <template v-else-if="status === 'success'">
        <div class="icon-success">✅</div>
        <h2>Đăng nhập thành công!</h2>
        <p class="callback-text">Chào mừng, <strong>{{ userName }}</strong>!</p>
        <p class="callback-subtext">Đang chuyển hướng...</p>
      </template>

      <template v-else-if="status === 'error'">
        <div class="icon-error">❌</div>
        <h2>Xác thực thất bại</h2>
        <p class="callback-text">{{ errorMessage }}</p>
        <RouterLink to="/login" class="btn-back">Quay lại đăng nhập</RouterLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/user/stores/authStore'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

const status       = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')
const userName     = ref('')

onMounted(() => {
  const token    = route.query.token as string
  const userRaw  = route.query.user  as string
  const error    = route.query.error as string

  if (error) {
    status.value       = 'error'
    errorMessage.value = decodeURIComponent(error)
    return
  }

  if (!token || !userRaw) {
    status.value       = 'error'
    errorMessage.value = 'Không nhận được thông tin xác thực. Vui lòng thử lại.'
    return
  }

  try {
    const userData = JSON.parse(decodeURIComponent(userRaw))
    authStore.handleGoogleCallback(token, userData)
    userName.value = userData.fullname
    status.value   = 'success'

    setTimeout(() => {
      router.push('/')
    }, 1500)
  } catch {
    status.value       = 'error'
    errorMessage.value = 'Dữ liệu xác thực không hợp lệ.'
  }
})
</script>

<style scoped>
.callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.callback-card {
  background: #fff;
  border-radius: 16px;
  padding: 50px 40px;
  text-align: center;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.1);
  min-width: 320px;
}

.callback-card h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a202c;
  margin: 16px 0 8px;
}

.callback-text {
  color: #4a5568;
  font-size: 15px;
  margin-bottom: 8px;
}

.callback-subtext {
  color: #a0aec0;
  font-size: 13px;
}

.spinner-large {
  width: 56px;
  height: 56px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.icon-success,
.icon-error {
  font-size: 52px;
  margin-bottom: 12px;
}

.btn-back {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 28px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}
.btn-back:hover {
  opacity: 0.9;
}
</style>