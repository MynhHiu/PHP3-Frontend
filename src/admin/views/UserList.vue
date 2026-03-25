<template>
  <div class="page-stack">
    <div class="page-header">
      <div class="page-header-info">
        <h2>Quản lý người dùng</h2>
        <p>Tổng {{ store.meta.total }} người dùng</p>
      </div>
      <button @click="openForm(null)" class="btn btn-primary">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Thêm người dùng
      </button>
    </div>

    <div class="filter-bar">
      <input v-model="filters.search" @input="debouncedFetch" placeholder="Tìm tên, email, SĐT..." class="input" />
      <select v-model="filters.role" @change="doFetch" class="input" style="width:160px">
        <option value="">Tất cả vai trò</option>
        <option value="0">Khách hàng</option>
        <option value="1">Admin</option>
      </select>
      <select v-model="filters.status" @change="doFetch" class="input" style="width:160px">
        <option value="">Tất cả trạng thái</option>
        <option value="1">Hoạt động</option>
        <option value="0">Bị khóa</option>
      </select>
      <button v-if="hasFilter" @click="clearFilter" class="btn btn-outline btn-sm" style="color:var(--red-500);border-color:var(--red-100)">✕ Xóa lọc</button>
    </div>

    <div class="table-card">
      <div v-if="store.loading" class="loading-state">
        <svg class="animate-spin" style="width:20px;height:20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Đang tải...
      </div>

      <div v-else-if="store.error" class="error-state">
        <div class="icon-lg">⚠️</div>
        <p class="e-title">Không kết nối được API</p>
        <p class="e-sub">{{ store.error }}</p>
        <button @click="doFetch" class="btn btn-outline btn-sm" style="margin-top:12px">🔄 Thử lại</button>
      </div>

      <div v-else-if="store.users.length === 0" class="empty-table">
        <div class="icon-lg">👤</div>
        <p>Chưa có người dùng nào</p>
        <button @click="openForm(null)" class="btn btn-primary btn-sm">+ Thêm người dùng đầu tiên</button>
      </div>

      <table v-else class="table-auto">
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Email</th>
            <th>Điện thoại</th>
            <th>Ngày sinh</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in store.users" :key="u.id">
            <td>
              <div class="user-cell">
                <div class="user-avatar-sm">
                  <img v-if="u.image" :src="avatarUrl(u.image)" />
                  <span v-else>{{ u.fullname.charAt(0).toUpperCase() }}</span>
                </div>
                <div>
                  <p style="font-weight:600;color:var(--gray-800);font-size:13px">{{ u.fullname }}</p>
                  <p style="font-size:11px;color:var(--gray-400)">#{{ u.id }}</p>
                </div>
              </div>
            </td>
            <td style="font-size:13px;color:var(--gray-600)">{{ u.email }}</td>
            <td style="font-size:13px;color:var(--gray-600)">{{ u.phone || '—' }}</td>
            <td style="font-size:12px;color:var(--gray-500)">{{ fmtDate(u.brithday) }}</td>
            <td>
              <span :class="u.role === 1 ? 'badge badge-green' : 'badge badge-gray'">
                {{ u.role === 1 ? 'Admin' : 'Khách hàng' }}
              </span>
            </td>
            <td>
              <button @click="toggleStatus(u)" :class="['status-toggle', u.status === 1 ? 'active' : 'locked']">
                <span class="st-dot"></span>
                {{ u.status === 1 ? 'Hoạt động' : 'Bị khóa' }}
              </button>
            </td>
            <td>
              <div class="row-actions">
                <button @click="openForm(u)" class="btn-icon edit" title="Sửa">
                  <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button @click="confirmDel(u)" class="btn-icon delete" title="Xóa">
                  <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="store.meta.last_page > 1" class="pagination">
        <span>Trang {{ store.meta.current_page }} / {{ store.meta.last_page }}</span>
        <div class="page-btns">
          <button v-for="pg in store.meta.last_page" :key="pg" @click="goPage(pg)"
            :class="['page-btn', store.meta.current_page === pg && 'active']">{{ pg }}</button>
        </div>
      </div>
    </div>

    <!-- Form modal -->
    <Teleport to="body">
      <div v-if="showForm" class="modal-overlay" @click.self="showForm = false">
        <div class="modal-box" style="max-width:520px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
            <h3 style="font-size:15px;font-weight:700;color:var(--gray-800)">
              {{ editUser ? 'Sửa người dùng' : 'Thêm người dùng mới' }}
            </h3>
            <button @click="showForm = false" style="background:none;border:none;cursor:pointer;color:var(--gray-400);font-size:22px">×</button>
          </div>

          <!-- Avatar upload -->
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
            <div class="user-avatar-lg">
              <img v-if="avatarPreview" :src="avatarPreview" />
              <span v-else>{{ form.fullname ? form.fullname.charAt(0).toUpperCase() : '?' }}</span>
            </div>
            <div>
              <button @click="($refs.avatarInput as HTMLInputElement).click()" class="btn btn-outline btn-sm">Chọn ảnh đại diện</button>
              <p style="font-size:11px;color:var(--gray-400);margin-top:4px">JPG, PNG tối đa 2MB</p>
              <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
            </div>
          </div>

          <div class="form-inner">
            <div class="form-row-2">
              <div class="field">
                <label class="label">Họ tên <span class="req">*</span></label>
                <input v-model="form.fullname" class="input" placeholder="Nguyễn Văn A" required />
              </div>
              <div class="field">
                <label class="label">Email <span class="req">*</span></label>
                <input v-model="form.email" class="input" type="email" placeholder="email@example.com" required />
              </div>
            </div>
            <div class="form-row-2">
              <div class="field">
                <label class="label">Số điện thoại</label>
                <input v-model="form.phone" class="input" placeholder="0901234567" />
              </div>
              <div class="field">
                <label class="label">Ngày sinh</label>
                <input v-model="form.brithday" class="input" type="date" />
              </div>
            </div>
            <div class="field">
              <label class="label">Địa chỉ</label>
              <input v-model="form.address" class="input" placeholder="123 Đường ABC, TP.HCM" />
            </div>
            <div class="form-row-2">
              <div class="field">
                <label class="label">Vai trò</label>
                <select v-model.number="form.role" class="input">
                  <option :value="0">Khách hàng</option>
                  <option :value="1">Admin</option>
                </select>
              </div>
              <div class="field">
                <label class="label">Trạng thái</label>
                <select v-model.number="form.status" class="input">
                  <option :value="1">Hoạt động</option>
                  <option :value="0">Khóa tài khoản</option>
                </select>
              </div>
            </div>
            <div v-if="!editUser" class="field">
              <label class="label">Mật khẩu <span class="req">*</span></label>
              <input v-model="form.password" class="input" type="password" placeholder="Tối thiểu 8 ký tự" />
            </div>
          </div>

          <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:20px">
            <button @click="showForm = false" class="btn btn-outline">Hủy</button>
            <button @click="saveUser" :disabled="submitting" class="btn btn-primary btn-min">
              <svg v-if="submitting" class="animate-spin" style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
              </svg>
              {{ submitting ? 'Đang lưu...' : (editUser ? 'Cập nhật' : 'Tạo tài khoản') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete modal -->
    <Teleport to="body">
      <div v-if="delTarget" class="modal-overlay" @click.self="delTarget = null">
        <div class="modal-box">
          <div class="modal-icon">🗑️</div>
          <div class="modal-body">
            <h3>Xóa người dùng?</h3>
            <p>Bạn sắp xóa tài khoản <strong>{{ delTarget.fullname }}</strong>. Không thể hoàn tác.</p>
          </div>
          <div class="modal-actions">
            <button @click="delTarget = null" class="btn btn-outline">Hủy</button>
            <button @click="doDel" :disabled="deleting" class="btn btn-danger">
              {{ deleting ? 'Đang xóa...' : 'Xóa' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/admin/stores/userStore'
import type { User } from '@/admin/stores/userStore'

const store   = useUserStore()
const filters = ref({ search: '', role: '', status: '' })
const hasFilter = computed(() => filters.value.search || filters.value.role || filters.value.status)

const showForm    = ref(false)
const editUser    = ref<User | null>(null)
const submitting  = ref(false)
const delTarget   = ref<User | null>(null)
const deleting    = ref(false)
const avatarPreview = ref<string | null>(null)
const avatarFile    = ref<File | null>(null)

const form = ref({ fullname: '', email: '', phone: '', address: '', brithday: '', role: 0, status: 1, password: '' })

const BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'
const avatarUrl = (img: string) => img.startsWith('http') ? img : `${BASE}/storage/${img}`
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '—'

let timer: ReturnType<typeof setTimeout>
function debouncedFetch() { clearTimeout(timer); timer = setTimeout(doFetch, 350) }
function doFetch() { store.fetchAll({ ...filters.value, page: 1 }) }
function goPage(p: number) { store.fetchAll({ ...filters.value, page: p }) }
function clearFilter() { filters.value = { search: '', role: '', status: '' }; doFetch() }

function openForm(u: User | null) {
  editUser.value = u
  avatarPreview.value = null; avatarFile.value = null
  if (u) {
    form.value = { fullname: u.fullname, email: u.email, phone: u.phone, address: u.address || '', brithday: u.brithday?.slice(0, 10) || '', role: u.role, status: u.status, password: '' }
    if (u.image) avatarPreview.value = avatarUrl(u.image)
  } else {
    form.value = { fullname: '', email: '', phone: '', address: '', brithday: '', role: 0, status: 1, password: '' }
  }
  showForm.value = true
}

function onAvatarChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) { avatarFile.value = f; avatarPreview.value = URL.createObjectURL(f) }
}

async function saveUser() {
  submitting.value = true
  try {
    const fd = new FormData()
    Object.entries(form.value).forEach(([k, v]) => { if (v !== '' && v !== null) fd.append(k, String(v)) })
    if (avatarFile.value) fd.append('image', avatarFile.value)
    if (editUser.value) await store.update(editUser.value.id, fd)
    else await store.create(fd)
    showForm.value = false
  } catch (e: any) { alert(e.userMessage || 'Lưu thất bại') }
  finally { submitting.value = false }
}

function confirmDel(u: User) { delTarget.value = u }
async function doDel() {
  if (!delTarget.value) return
  deleting.value = true
  try { await store.remove(delTarget.value.id) }
  finally { deleting.value = false; delTarget.value = null }
}

async function toggleStatus(u: User) { await store.toggleStatus(u.id) }

onMounted(() => store.fetchAll())
</script>
