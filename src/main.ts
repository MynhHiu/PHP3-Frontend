import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'    // phải đúng path
import App from './App.vue'
import './assets/admin.css'
import './assets/user.css'

createApp(App)
  .use(createPinia())
  .use(router)                // <--- quan trọng
  .mount('#app')

import { useAuthStore } from '@/user/stores/authStore'
const authStore = useAuthStore()
authStore.init()