<template>
  <div class="contact-page">

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-num">{{ store.stats.total }}</span>
        <span class="stat-label">Tất cả</span>
      </div>
      <div class="stat-card pending">
        <span class="stat-num">{{ store.stats.pending }}</span>
        <span class="stat-label">⏳ Chờ xử lý</span>
      </div>
      <div class="stat-card replied">
        <span class="stat-num">{{ store.stats.replied }}</span>
        <span class="stat-label">✅ Đã trả lời</span>
      </div>
      <div class="stat-card closed">
        <span class="stat-num">{{ store.stats.closed }}</span>
        <span class="stat-label">🔒 Đã đóng</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <input
        v-model="store.searchQuery"
        type="text"
        placeholder="Tìm tên, email, SĐT, tiêu đề..."
        class="search-input"
        @keyup.enter="doSearch"
      />
      <select v-model="store.filterStatus" class="status-select" @change="doSearch">
        <option value="all">Tất cả</option>
        <option value="pending">Chờ xử lý</option>
        <option value="replied">Đã trả lời</option>
        <option value="closed">Đã đóng</option>
      </select>
      <button class="btn btn-primary" @click="doSearch">Tìm kiếm</button>
      <button class="btn btn-secondary" @click="doReset">Đặt lại</button>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div v-if="store.loading" class="table-loading">Đang tải dữ liệu...</div>

      <table v-else class="data-table">
        <thead>
          <tr>
            <th style="width:50px">#</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Tiêu đề</th>
            <th>Ngày gửi</th>
            <th style="width:140px">Trạng thái</th>
            <th style="width:100px">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.contacts.length === 0">
            <td colspan="7" class="empty-cell">Không có liên hệ nào.</td>
          </tr>
          <tr
            v-for="c in store.contacts"
            :key="c.id"
            :class="{ 'row-highlight': c.status === 'pending' }"
          >
            <td class="td-id">{{ c.id }}</td>
            <td class="td-name">{{ c.fullname }}</td>
            <td>{{ c.email }}</td>
            <td class="td-subject">{{ c.subject }}</td>
            <td class="td-date">{{ fmtDate(c.created_at) }}</td>
            <td>
              <span :class="['badge', c.status]">{{ statusLabel(c.status) }}</span>
            </td>
            <td>
              <div class="action-btns">
                <button class="btn-icon view" title="Xem & Trả lời" @click="openModal(c)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button class="btn-icon delete" title="Xóa" @click="doDelete(c.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="store.lastPage > 1">
      <button :disabled="store.currentPage <= 1" @click="changePage(store.currentPage - 1)">‹ Trước</button>
      <span>{{ store.currentPage }} / {{ store.lastPage }}</span>
      <button :disabled="store.currentPage >= store.lastPage" @click="changePage(store.currentPage + 1)">Sau ›</button>
    </div>

    <!-- Modal chi tiết & trả lời -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-box">
          <button class="modal-close" @click="closeModal">✕</button>
          <h3 class="modal-title">Chi tiết liên hệ #{{ store.selected?.id }}</h3>

          <div v-if="store.selected" class="modal-body">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-lbl">Họ tên</span>
                <span>{{ store.selected.fullname }}</span>
              </div>
              <div class="info-item">
                <span class="info-lbl">Email</span>
                <a :href="'mailto:' + store.selected.email">{{ store.selected.email }}</a>
              </div>
              <div class="info-item" v-if="store.selected.phone">
                <span class="info-lbl">Điện thoại</span>
                <span>{{ store.selected.phone }}</span>
              </div>
              <div class="info-item">
                <span class="info-lbl">Ngày gửi</span>
                <span>{{ fmtDate(store.selected.created_at) }}</span>
              </div>
              <div class="info-item" style="grid-column: span 2">
                <span class="info-lbl">Tiêu đề</span>
                <span>{{ store.selected.subject }}</span>
              </div>
              <div class="info-item">
                <span class="info-lbl">Trạng thái</span>
                <span :class="['badge', store.selected.status]">{{ statusLabel(store.selected.status) }}</span>
              </div>
            </div>

            <!-- Nội dung gốc -->
            <div class="msg-box original">
              <div class="msg-label">📩 Nội dung liên hệ</div>
              <p>{{ store.selected.message }}</p>
            </div>

            <!-- Phản hồi trước (nếu đã có) -->
            <div class="msg-box replied-prev" v-if="store.selected.reply_message">
              <div class="msg-label">✉️ Đã trả lời lúc {{ fmtDate(store.selected.replied_at!) }}</div>
              <p>{{ store.selected.reply_message }}</p>
            </div>

            <!-- Form trả lời -->
            <div class="reply-section">
              <label class="msg-label">
                ✍️ Soạn phản hồi – sẽ gửi email tới <strong>{{ store.selected.email }}</strong>
              </label>
              <textarea
                v-model="replyText"
                rows="5"
                class="reply-textarea"
                placeholder="Nhập nội dung phản hồi..."
              />
              <p v-if="replyErr" class="field-error">{{ replyErr }}</p>
              <div class="modal-actions">
                <button class="btn btn-secondary" @click="closeModal">Đóng</button>
                <button
                  class="btn btn-primary"
                  :disabled="store.replyLoading"
                  @click="doReply"
                >
                  {{ store.replyLoading ? 'Đang gửi...' : '📧 Gửi phản hồi' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast" :class="['toast', toastType]">{{ toast }}</div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useContactStore, type Contact } from '../../user/stores/contactStore'

const store = useContactStore()
const showModal = ref(false)
const replyText = ref('')
const replyErr  = ref('')
const toast     = ref('')
const toastType = ref<'success' | 'error'>('success')

onMounted(() => {
  store.fetchContacts()
  store.fetchStats()
})

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleString('vi-VN')
}

function statusLabel(s: string) {
  const map: Record<string, string> = { pending: '⏳ Chờ xử lý', replied: '✅ Đã trả lời', closed: '🔒 Đã đóng' }
  return map[s] ?? s
}

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.value = msg
  toastType.value = type
  setTimeout(() => { toast.value = '' }, 3500)
}

function openModal(c: Contact) {
  store.selected = c
  replyText.value = c.reply_message ?? ''
  replyErr.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  replyText.value = ''
  replyErr.value = ''
}

async function doReply() {
  if (!replyText.value.trim()) { replyErr.value = 'Vui lòng nhập nội dung.'; return }
  if (replyText.value.trim().length < 5) { replyErr.value = 'Nội dung quá ngắn (ít nhất 5 ký tự).'; return }
  replyErr.value = ''
  const ok = await store.replyContact(store.selected!.id, replyText.value.trim())
  if (ok) {
    showToast(`✅ Đã gửi phản hồi tới ${store.selected?.email}!`)
    closeModal()
  } else {
    showToast(store.error ?? 'Gửi thất bại.', 'error')
  }
}

async function doDelete(id: number) {
  if (!confirm('Xóa liên hệ này?')) return
  const ok = await store.deleteContact(id)
  ok ? showToast('Đã xóa liên hệ.') : showToast(store.error ?? 'Xóa thất bại.', 'error')
}

function doSearch()           { store.fetchContacts(1) }
function doReset()            { store.resetFilters(); store.fetchContacts(1) }
function changePage(p: number){ store.fetchContacts(p) }
</script>

<style scoped>
.contact-page { padding: 24px; display: flex; flex-direction: column; gap: 18px; }

.stats-row { display: flex; gap: 14px; flex-wrap: wrap; }
.stat-card { flex: 1; min-width: 120px; background: #f0f4ff; border-radius: 10px; padding: 14px 20px; text-align: center; }
.stat-card.pending { background: #fff8e1; }
.stat-card.replied { background: #e8f5e9; }
.stat-card.closed  { background: #f3e5f5; }
.stat-num   { display: block; font-size: 26px; font-weight: 700; color: #1a1a2e; }
.stat-label { font-size: 12px; color: #666; }

.filter-bar { display: flex; gap: 10px; flex-wrap: wrap; }
.search-input  { flex: 1; min-width: 200px; padding: 8px 14px; border: 1px solid #ddd; border-radius: 7px; font-size: 14px; outline: none; }
.search-input:focus { border-color: #1a73e8; }
.status-select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 7px; font-size: 14px; background: #fff; }

.btn { padding: 8px 18px; border: none; border-radius: 7px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background .15s; }
.btn-primary   { background: #1a73e8; color: #fff; }
.btn-primary:hover   { background: #1558b0; }
.btn-primary:disabled { opacity: .55; cursor: not-allowed; }
.btn-secondary { background: #eee; color: #333; }
.btn-secondary:hover { background: #ddd; }

.table-card { background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,.07); overflow: hidden; }
.table-loading { padding: 40px; text-align: center; color: #888; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th { background: #f5f7ff; padding: 12px 14px; text-align: left; font-weight: 600; color: #555; border-bottom: 2px solid #eee; }
.data-table td { padding: 11px 14px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.row-highlight td { background: #fffbf0; }
.empty-cell { text-align: center; color: #aaa; padding: 40px !important; }
.td-id { color: #999; font-size: 12px; }
.td-name { font-weight: 600; }
.td-subject { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.td-date { font-size: 13px; color: #666; white-space: nowrap; }

.badge { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
.badge.pending { background: #fff3e0; color: #e65100; }
.badge.replied { background: #e8f5e9; color: #2e7d32; }
.badge.closed  { background: #ede7f6; color: #4527a0; }

.action-btns { display: flex; gap: 6px; }
.btn-icon { width: 32px; height: 32px; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.btn-icon svg { width: 15px; height: 15px; }
.btn-icon.view   { background: #e3f2fd; color: #1565c0; }
.btn-icon.view:hover   { background: #bbdefb; }
.btn-icon.delete { background: #fce4ec; color: #c62828; }
.btn-icon.delete:hover { background: #ffcdd2; }

.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; }
.pagination button { padding: 6px 18px; border: 1px solid #ddd; border-radius: 7px; background: #fff; cursor: pointer; }
.pagination button:disabled { opacity: .4; cursor: not-allowed; }
.pagination span { font-size: 14px; color: #555; }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 16px; }
.modal-box { background: #fff; border-radius: 12px; padding: 28px; width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto; position: relative; }
.modal-close { position: absolute; top: 14px; right: 16px; background: none; border: none; font-size: 18px; cursor: pointer; color: #888; }
.modal-close:hover { color: #333; }
.modal-title { font-size: 18px; font-weight: 700; margin: 0 0 18px; color: #1a1a2e; }
.modal-body { display: flex; flex-direction: column; gap: 14px; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.info-item { display: flex; flex-direction: column; gap: 2px; font-size: 14px; }
.info-lbl  { font-size: 11px; color: #888; text-transform: uppercase; font-weight: 600; }
.info-item a { color: #1a73e8; text-decoration: none; }

.msg-box { border-radius: 8px; padding: 14px 16px; }
.msg-box.original     { background: #f5f5f5; border-left: 4px solid #bbb; }
.msg-box.replied-prev { background: #e8f5e9; border-left: 4px solid #43a047; }
.msg-label { font-size: 12px; font-weight: 700; color: #555; margin-bottom: 6px; }
.msg-box p { margin: 0; font-size: 14px; line-height: 1.7; white-space: pre-wrap; color: #333; }

.reply-section { display: flex; flex-direction: column; gap: 8px; }
.reply-textarea { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit; box-sizing: border-box; }
.reply-textarea:focus { outline: none; border-color: #1a73e8; }
.field-error { color: #c62828; font-size: 13px; margin: 0; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }

.modal-enter-active, .modal-leave-active { transition: opacity .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.toast { position: fixed; bottom: 28px; right: 28px; padding: 12px 22px; border-radius: 8px; font-size: 14px; font-weight: 500; z-index: 3000; box-shadow: 0 4px 16px rgba(0,0,0,.15); }
.toast.success { background: #1b5e20; color: #fff; }
.toast.error   { background: #b71c1c; color: #fff; }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(12px); }
</style>