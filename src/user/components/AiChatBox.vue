<template>
  <div class="ai-chat-wrapper" :class="{ 'is-open': isOpen }">
    <button class="chat-toggle" @click="isOpen = !isOpen">
      <span v-if="!isOpen">🤖</span>
      <span v-else>✕</span>
    </button>

    <div class="chat-container" v-if="isOpen">
      <div class="chat-header">
        <div class="header-info">
          <span class="status-dot"></span>
          <strong>Trợ lý s1mpleElectric</strong>
        </div>
        <small>Hỗ trợ trực tuyến 24/7</small>
      </div>
      
      <div class="chat-messages" ref="msgContainer">
        <div v-for="(msg, i) in messages" :key="i" :class="['msg', msg.role]">
          <div class="msg-bubble">
            <div class="msg-text">{{ msg.content }}</div>
            
            <div v-if="msg.suggestions && msg.suggestions.length" class="chat-suggestions">
              <div 
                v-for="p in msg.suggestions" 
                :key="p.id" 
                class="suggest-card"
                @click="goToProduct(p.id)"
              >
                <img :src="resolveProductImage(p.image_url)" @error="(e) => (e.target as HTMLImageElement).src = PLACEHOLDER" />
                <div class="suggest-info">
                  <div class="s-name">{{ p.name }}</div>
                  <div class="s-price">{{ fmt(p.price || 0) }}đ</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <input 
          v-model="userInput" 
          @keyup.enter="handleSend" 
          placeholder="Hỏi về quạt, nồi cơm, máy lạnh..."
        />
        <button @click="handleSend" :disabled="!userInput.trim()">➤</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useProductUserStore } from '@/user/stores/productUserStore'
import { resolveProductImage, PLACEHOLDER } from '@/utils/productImage'

const isOpen = ref(false)
const userInput = ref('')
const msgContainer = ref<HTMLElement | null>(null)
const router = useRouter()
const productStore = useProductUserStore()

const messages = ref([
  { role: 'ai', content: 'Chào! Mình là trợ lý thông minh. Bạn cần tìm gì cho gia đình hôm nay?' }
])

const fmt = (n: number) => n.toLocaleString('vi-VN')

// --- BỘ TỪ ĐIỂN Ý ĐỊNH (INTENT) ---
const intentMap = [
  {
    keywords: ['mát', 'nóng', 'giải nhiệt', 'hè', 'nực'],
    target: 'quạt',
    reply: 'Trời nóng quá Hùng ơi! Gửi bạn các mẫu quạt giải nhiệt cực tốt của s1mpleElectric:'
  },
  {
    keywords: ['nấu', 'cơm', 'ăn', 'thổi', 'đói'],
    target: 'nồi cơm',
    reply: 'Vào bếp thôi! Đây là các mẫu nồi cơm điện giúp bạn có bữa ăn ngon nhất:'
  },
  {
    keywords: ['sinh tố', 'xay', 'ép', 'trái cây'],
    target: 'máy xay',
    reply: 'Làm ly sinh tố mát lạnh thôi nào! Tham khảo các mẫu máy xay này nhé:'
  },
  {
    keywords: ['hâm', 'nóng', 'nướng', 'vi sóng'],
    target: 'lò vi sóng',
    reply: 'Tiết kiệm thời gian với lò vi sóng đa năng. Mời bạn xem qua ạ:'
  }
]

const handleSend = () => {
  const rawText = userInput.value.trim()
  if (!rawText) return

  // Đẩy tin nhắn người dùng lên
  messages.value.push({ role: 'user', content: rawText })
  userInput.value = ''
  scrollToBottom()

  const text = rawText.toLowerCase()

  setTimeout(() => {
    // 1. Lời chào
    if (['hi', 'chào', 'hello'].some(g => text.includes(g))) {
      messages.value.push({ role: 'ai', content: 'Chào Hùng! Chúc bạn một ngày tốt lành nhé. Bạn cần tìm gì ạ?' })
      scrollToBottom()
      return
    }

    // 2. Tìm kiếm theo Ý định (Intent)
    let matchedIntent = intentMap.find(intent => 
      intent.keywords.some(kw => text.includes(kw))
    )

    // 3. Xử lý từ khóa để lọc sản phẩm
    const stopWords = ['tôi', 'muốn', 'mua', 'cần', 'tìm', 'giúp', 'cho', 'cái', 'chiếc', 'có', 'không']
    let searchKey = matchedIntent ? matchedIntent.target : text
    const keywords = searchKey.split(' ').filter(k => k.length > 1 && !stopWords.includes(k))

    // 4. Lọc sản phẩm từ Store
    const found = productStore.products.filter(p => {
      const pName = p.name.toLowerCase()
      // Khớp ít nhất 1 từ khóa quan trọng
      return keywords.some(kw => pName.includes(kw))
    }).slice(0, 3)

    // 5. Phản hồi
    if (found.length > 0) {
      messages.value.push({
        role: 'ai',
        content: matchedIntent ? matchedIntent.reply : 'Dạ, mình tìm thấy vài mẫu phù hợp với ý bạn đây:',
        suggestions: found
      })
    } else {
      messages.value.push({
        role: 'ai',
        content: `Xin lỗi Hùng, mình chưa tìm thấy sản phẩm giúp "${rawText}". Bạn thử nhập tên máy cụ thể nhé!`
      })
    }
    scrollToBottom()
  }, 500)
}

const goToProduct = (id: number) => {
  router.push(`/products/${id}`)
  isOpen.value = false
}

const scrollToBottom = () => {
  nextTick(() => {
    if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight
  })
}
</script>

<style scoped>
.ai-chat-wrapper { position: fixed; bottom: 30px; right: 30px; z-index: 9999; font-family: 'Inter', sans-serif; }
.chat-toggle { width: 60px; height: 60px; border-radius: 50%; background: #2d8c4e; color: white; border: none; font-size: 26px; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: 0.3s; }
.chat-toggle:hover { transform: scale(1.1); }
.chat-container { position: absolute; bottom: 75px; right: 0; width: 350px; height: 500px; background: white; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; border: 1px solid #edf4f0; }
.chat-header { background: #2d8c4e; color: white; padding: 15px; }
.chat-messages { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #f8faf9; }
.msg-bubble { padding: 10px 14px; border-radius: 14px; font-size: 13.5px; line-height: 1.4; max-width: 85%; }
.msg.ai .msg-bubble { background: white; align-self: flex-start; box-shadow: 0 2px 5px rgba(0,0,0,0.05); color: #333; }
.msg.user .msg-bubble { background: #2d8c4e; color: white; align-self: flex-end; }
.chat-suggestions { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.suggest-card { display: flex; align-items: center; gap: 10px; background: #f0faf4; padding: 8px; border-radius: 10px; border: 1px solid #d4e8da; cursor: pointer; }
.suggest-card:hover { border-color: #2d8c4e; transform: translateX(5px); }
.suggest-card img { width: 40px; height: 40px; object-fit: contain; background: white; }
.s-name { font-size: 12px; font-weight: 600; color: #333; }
.s-price { font-size: 11px; color: #e03131; font-weight: 700; }
.chat-input { padding: 15px; border-top: 1px solid #eee; display: flex; gap: 10px; background: white; }
.chat-input input { flex: 1; border: 1px solid #ddd; padding: 8px 15px; border-radius: 20px; outline: none; font-size: 13px; }
.chat-input button { background: #2d8c4e; border: none; color: white; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; }
</style>