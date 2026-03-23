import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'    // phải đúng path
import App from './App.vue'
import './assets/admin.css'

createApp(App)
  .use(createPinia())
  .use(router)                // <--- quan trọng
  .mount('#app')