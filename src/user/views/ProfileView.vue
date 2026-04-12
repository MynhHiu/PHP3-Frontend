<template>
  <div class="profile-page">
    <div class="breadcrumb">
      <span>Trang chủ</span>
      <span class="sep">›</span>
      <span class="active">Tài khoản của tôi</span>
    </div>

    <div class="profile-layout">
      <!-- ══ SIDEBAR ══ -->
      <aside class="sidebar">
        <div class="user-card">
          <div class="avatar-wrap">
            <img :src="avatarSrc" alt="avatar" class="avatar" />
            <label class="avatar-edit-btn" title="Thay ảnh đại diện">
              <input type="file" accept="image/*" hidden @change="handleAvatarChange" />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </label>
          </div>
          <h3>{{ authStore.user?.fullname || '—' }}</h3>
          <p>{{ authStore.user?.email }}</p>
        </div>

        <nav class="side-nav">
          <button v-for="item in navItems" :key="item.key" :class="['nav-item', { active: activeTab === item.key }]"
            @click="activeTab = item.key">
            <span class="nav-icon">{{ item.icon }}</span>
            {{ item.label }}
          </button>

          <button class="nav-item nav-logout" @click="handleLogout">
            <span class="nav-icon"></span>
            Đăng xuất
          </button>
        </nav>
      </aside>

      <!-- ══ MAIN ══ -->
      <main class="main-content">

        <!-- ── Toast thông báo ── -->
        <transition name="toast">
          <div v-if="toast.show" :class="['toast', toast.type]">
            <svg v-if="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            {{ toast.message }}
          </div>
        </transition>

        <!-- ════════════════════════════════════════
             1. THÔNG TIN CÁ NHÂN
        ════════════════════════════════════════ -->
        <section v-if="activeTab === 'info'" class="section-card">
          <div class="section-head">
            <h2>Thông tin cá nhân</h2>
            <button class="btn-edit" @click="toggleEdit">
              {{ editing ? 'Huỷ' : 'Chỉnh sửa' }}
            </button>
          </div>

          <form @submit.prevent="saveProfile" class="form-grid">
            <div class="form-group">
              <label>Họ và tên <span class="required">*</span></label>
              <input v-model="infoForm.fullname" :disabled="!editing" type="text" placeholder="Nhập họ và tên" />
            </div>
            <div class="form-group">
              <label>Số điện thoại <span class="required">*</span></label>
              <input v-model="infoForm.phone" :disabled="!editing" type="tel" placeholder="0901234567" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="infoForm.email" disabled type="email" class="disabled-field" />
            </div>
            <div class="form-group">
              <label>Ngày sinh</label>
              <input v-model="infoForm.birthday" :disabled="!editing" type="date" />
            </div>
            <!-- <div class="form-group full">
              <label>Địa chỉ</label>
              <input v-model="infoForm.address" :disabled="!editing" type="text"
                placeholder="Số nhà, đường, phường/xã..." />
            </div> -->

            <div class="form-actions full" v-if="editing">
              <button type="submit" class="btn-save" :disabled="infoLoading">
                <span v-if="infoLoading" class="btn-spin"></span>
                {{ infoLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}
              </button>
            </div>
          </form>
        </section>

        <!-- ════════════════════════════════════════
             2. MÃ GIẢM GIÁ
        ════════════════════════════════════════ -->
        <section v-if="activeTab === 'coupons'" class="section-card">
          <div class="section-head">
            <h2>Mã giảm giá của tôi</h2>
            <router-link to="/my-coupons" class="btn-goto-promo">+ Lấy thêm mã</router-link>
          </div>

          <div v-if="loadingCoup" class="coup-loading">
            <div class="mini-spin"></div> Đang tải...
          </div>

          <div v-else-if="myCoupons.length === 0" class="coup-empty">
            <div class="coup-empty-icon"></div>
            <p>Bạn chưa lưu mã nào.</p>
            <router-link to="/my-coupons" class="btn-goto-promo filled">Xem khuyến mãi ngay →</router-link>
          </div>

          <div v-else class="coup-list">
            <div v-for="c in myCoupons" :key="c.coupon_code" :class="['coup-item', c.status]">
              <div class="coup-left">
                <div class="coup-discount">{{ c.discount_display }}</div>
                <div class="coup-min" v-if="c.minordervalue > 0">
                  Đơn từ {{ Number(c.minordervalue).toLocaleString('vi-VN') }}₫
                </div>
              </div>
              <div class="coup-mid">
                <div class="coup-code">{{ c.coupon_code }}</div>
                <div class="coup-desc">{{ c.description }}</div>
                <div class="coup-expire" v-if="c.expires_at">
                  HSD: {{ new Date(c.expires_at).toLocaleDateString('vi-VN') }}
                </div>
              </div>
              <div class="coup-right">
                <span :class="['coup-status', c.status]">
                  {{ c.status === 'active' ? '✓ Còn dùng' : c.status === 'used' ? '✗ Đã dùng' : '✗ Hết hạn' }}
                </span>
                <router-link v-if="c.status === 'active'" :to="{ name: 'checkout', query: { coupon: c.coupon_code } }"
                  class="btn-use-now">Dùng ngay</router-link>
              </div>
            </div>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             3. ĐỊA CHỈ GIAO HÀNG
        ════════════════════════════════════════ -->
        <section v-if="activeTab === 'address'" class="section-card">
          <div class="section-head">
            <h2>Địa chỉ giao hàng</h2>
            <button class="btn-add" @click="openAddressModal()">+ Thêm địa chỉ</button>
          </div>

          <div v-if="addrLoading" class="coup-loading">
            <div class="mini-spin"></div> Đang tải...
          </div>

          <div v-else-if="addresses.length === 0" class="coup-empty">
            <div class="coup-empty-icon"></div>
            <p>Bạn chưa có địa chỉ giao hàng nào.</p>
            <button class="btn-add mt-12" @click="openAddressModal()">+ Thêm địa chỉ đầu tiên</button>
          </div>

          <div v-else class="address-list">
            <div v-for="addr in addresses" :key="addr.id" :class="['address-card', { 'is-default': addr.is_default }]">
              <div class="address-body">
                <div class="address-name-row">
                  <span class="addr-name">{{ addr.receiver_name }}</span>
                  <span class="addr-sep">|</span>
                  <span class="addr-phone">{{ addr.phone }}</span>
                  <span v-if="addr.is_default" class="default-badge">✓ Mặc định</span>
                </div>
                <p class="addr-detail">
                  {{ addr.detail_address }}, {{ addr.ward }}, {{ addr.district }}, {{ addr.province }}
                </p>
              </div>
              <div class="address-actions">
                <button class="btn-addr-edit" @click="openAddressModal(addr)">Sửa</button>
                <button class="btn-addr-delete" @click="deleteAddress(addr.id)">Xoá</button>
                <button v-if="!addr.is_default" class="btn-addr-default" @click="setDefaultAddress(addr.id)">Đặt mặc
                  định</button>
              </div>
            </div>
          </div>
        </section>

        <!-- ════════════════════════════════════════
             4. ĐỔI MẬT KHẨU
        ════════════════════════════════════════ -->
        <section v-if="activeTab === 'password'" class="section-card">
          <div class="section-head">
            <h2>Đổi mật khẩu</h2>
          </div>

          <div v-if="isGoogleAccount" class="google-notice">
            <span></span>
            <p>Tài khoản của bạn đăng nhập qua Google. Bạn không thể đổi mật khẩu tại đây.</p>
          </div>

          <form v-else @submit.prevent="changePassword" class="form-grid">
            <!-- Mật khẩu hiện tại -->
            <div class="form-group full">
              <label>Mật khẩu hiện tại <span class="required">*</span></label>
              <div class="input-pw-wrap">
                <input v-model="pwForm.current_password" :type="showPw.current ? 'text' : 'password'"
                  placeholder="••••••••" />
                <button type="button" class="toggle-pw" @click="showPw.current = !showPw.current">
                  <svg v-if="!showPw.current" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Mật khẩu mới -->
            <div class="form-group full">
              <label>Mật khẩu mới <span class="required">*</span></label>
              <div class="input-pw-wrap">
                <input v-model="pwForm.new_password" :type="showPw.new ? 'text' : 'password'"
                  placeholder="Tối thiểu 8 ký tự" />
                <button type="button" class="toggle-pw" @click="showPw.new = !showPw.new">
                  <svg v-if="!showPw.new" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
              </div>
              <div class="pw-strength" v-if="pwForm.new_password">
                <div class="strength-bar">
                  <div :class="['strength-fill', pwStrengthClass]" :style="{ width: pwStrengthWidth }"></div>
                </div>
                <span :class="['strength-label', pwStrengthClass]">{{ pwStrengthLabel }}</span>
              </div>
            </div>

            <!-- Xác nhận mật khẩu mới -->
            <div class="form-group full">
              <label>Xác nhận mật khẩu mới <span class="required">*</span></label>
              <div class="input-pw-wrap">
                <input v-model="pwForm.new_password_confirmation" :type="showPw.confirm ? 'text' : 'password'"
                  placeholder="Nhập lại mật khẩu mới" />
                <button type="button" class="toggle-pw" @click="showPw.confirm = !showPw.confirm">
                  <svg v-if="!showPw.confirm" width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </button>
              </div>
              <p class="pw-mismatch"
                v-if="pwForm.new_password_confirmation && pwForm.new_password !== pwForm.new_password_confirmation">
                Mật khẩu không khớp
              </p>
            </div>

            <div class="form-actions full">
              <button type="submit" class="btn-save" :disabled="pwLoading">
                <span v-if="pwLoading" class="btn-spin"></span>
                {{ pwLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu' }}
              </button>
            </div>
          </form>
        </section>

      </main>
    </div>

    <!-- ══════════════════════════════════════════
         MODAL: THÊM / SỬA ĐỊA CHỈ
    ══════════════════════════════════════════ -->
    <transition name="modal">
      <div v-if="showAddrModal" class="modal-overlay" @click.self="closeAddressModal">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ editingAddr ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới' }}</h3>
            <button class="modal-close" @click="closeAddressModal">✕</button>
          </div>

          <form @submit.prevent="submitAddress" class="form-grid modal-form">
            <div class="form-group">
              <label>Người nhận <span class="required">*</span></label>
              <input v-model="addrForm.receiver_name" type="text" placeholder="Nguyễn Văn An" required />
            </div>
            <div class="form-group">
              <label>Số điện thoại <span class="required">*</span></label>
              <input v-model="addrForm.phone" type="tel" placeholder="0901234567" required />
            </div>
            <!-- Tỉnh / Thành phố -->
            <div class="form-group">
              <label>Tỉnh / Thành phố <span class="required">*</span></label>
              <div class="ghn-select-wrap">
                <select class="ghn-select" :value="selectedProvinceId ?? ''"
                  @change="onProvinceChange(Number(($event.target as HTMLSelectElement).value))" required>
                  <option value="" disabled>
                    {{ ghn.loadingProvinces.value ? 'Đang tải...' : '-- Chọn tỉnh/thành --' }}
                  </option>
                  <option v-for="p in ghn.provinces.value" :key="p.ProvinceID" :value="p.ProvinceID">
                    {{ p.ProvinceName }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Quận / Huyện -->
            <div class="form-group">
              <label>Quận / Huyện <span class="required">*</span></label>
              <div class="ghn-select-wrap">
                <select class="ghn-select" :value="selectedDistrictId ?? ''"
                  :disabled="!selectedProvinceId || ghn.loadingDistricts.value"
                  @change="onDistrictChange(Number(($event.target as HTMLSelectElement).value))" required>
                  <option value="" disabled>
                    {{ ghn.loadingDistricts.value ? 'Đang tải...' : '-- Chọn quận/huyện --' }}
                  </option>
                  <option v-for="d in ghn.districts.value" :key="d.DistrictID" :value="d.DistrictID">
                    {{ d.DistrictName }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Phường / Xã -->
            <div class="form-group">
              <label>Phường / Xã <span class="required">*</span></label>
              <div class="ghn-select-wrap">
                <select class="ghn-select" :value="selectedWardCode"
                  :disabled="!selectedDistrictId || ghn.loadingWards.value"
                  @change="onWardChange(($event.target as HTMLSelectElement).value)" required>
                  <option value="" disabled>
                    {{ ghn.loadingWards.value ? 'Đang tải...' : '-- Chọn phường/xã --' }}
                  </option>
                  <option v-for="w in ghn.wards.value" :key="w.WardCode" :value="w.WardCode">
                    {{ w.WardName }}
                  </option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Số nhà, tên đường <span class="required">*</span></label>
              <input v-model="addrForm.detail_address" type="text" placeholder="123 Nguyễn Huệ" required />
            </div>
            <div class="form-group full checkbox-group">
              <label class="check-label">
                <input v-model="addrForm.is_default" type="checkbox" />
                Đặt làm địa chỉ mặc định
              </label>
            </div>

            <div class="form-actions full modal-actions">
              <button type="button" class="btn-cancel" @click="closeAddressModal">Huỷ</button>
              <button type="submit" class="btn-save" :disabled="addrSubmitting">
                <span v-if="addrSubmitting" class="btn-spin"></span>
                {{ addrSubmitting ? 'Đang lưu...' : (editingAddr ? 'Cập nhật' : 'Thêm địa chỉ') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/index'
import { useGhn } from '@/user/stores/useGhn'
import { useAuthStore } from '@/user/stores/authStore'

interface ShippingAddress {
  id: number
  user_id: number
  receiver_name: string
  phone: string
  province: string
  district: string
  ward: string
  detail_address: string
  is_default: boolean
}

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('info')
const navItems = [
  { key: 'info', icon: '', label: 'Thông tin cá nhân' },
  { key: 'coupons', icon: '', label: 'Mã giảm giá của tôi' },
  { key: 'address', icon: '', label: 'Địa chỉ giao hàng' },
  { key: 'password', icon: '', label: 'Đổi mật khẩu' },
]

// ── Toast ─────────────────────────────────────────────────────────────────
const toast = ref({ show: false, message: '', type: 'success' })
function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}

// ══════════════════════════════════════════════════════════════════════════
// 1. THÔNG TIN CÁ NHÂN
// ══════════════════════════════════════════════════════════════════════════
const editing = ref(false)
const infoLoading = ref(false)
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

const infoForm = ref({
  fullname: '',
  phone: '',
  email: '',
  birthday: '',
  address: '',
})

const avatarSrc = computed(() => {
  if (avatarPreview.value) return avatarPreview.value
  const u = authStore.user as any
  if (!u) return 'https://placehold.co/80x80/e8f5e9/2e7d32?text=User'
  if (u.image) return u.image
  if (u.avatar) return u.avatar
  return 'https://placehold.co/80x80/e8f5e9/2e7d32?text=' + (u.fullname?.[0] || 'U')
})

function loadInfoForm() {
  const u = authStore.user as any
  if (!u) return
  infoForm.value = {
    fullname: u.fullname || '',
    phone: u.phone || '',
    email: u.email || '',
    birthday: u.birthday ? u.birthday.split('T')[0] : '',
    address: u.address || '',
  }
}

function toggleEdit() {
  if (editing.value) {
    loadInfoForm()
    avatarPreview.value = null
    avatarFile.value = null
  }
  editing.value = !editing.value
}

function handleAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
  editing.value = true
}

async function saveProfile() {
  infoLoading.value = true
  try {
    const formData = new FormData()
    if (infoForm.value.fullname) formData.append('fullname', infoForm.value.fullname)
    if (infoForm.value.phone) formData.append('phone', infoForm.value.phone)
    if (infoForm.value.address) formData.append('address', infoForm.value.address)
    if (infoForm.value.birthday) formData.append('birthday', infoForm.value.birthday)
    if (avatarFile.value) formData.append('image', avatarFile.value)

    const res = await api.post('/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    if (authStore.user) {
      const updated = res.data.data
      authStore.user.fullname = updated.fullname
      authStore.user.phone = updated.phone
      authStore.user.address = updated.address
        ; (authStore.user as any).birthday = updated.birthday
        ; (authStore.user as any).image = updated.image
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }

    avatarFile.value = null
    avatarPreview.value = null
    editing.value = false
    showToast('Cập nhật thông tin thành công!')
  } catch (err: any) {
    const errors = err.response?.data?.errors
    if (errors) {
      const firstError = Object.values(errors)[0] as string[]
      showToast(firstError[0], 'error')
    } else {
      const msg = err.response?.data?.message || 'Cập nhật thất bại, vui lòng thử lại.'
      showToast(msg, 'error')
    }
  } finally {
    infoLoading.value = false
  }
}

// ══════════════════════════════════════════════════════════════════════════
// 2. MÃ GIẢM GIÁ
// ══════════════════════════════════════════════════════════════════════════
const myCoupons = ref<any[]>([])
const loadingCoup = ref(false)

async function fetchMyCoupons() {
  loadingCoup.value = true
  try {
    const res = await api.get('/auth/user/my-coupons')
    myCoupons.value = res.data
  } catch {
    myCoupons.value = []
  } finally {
    loadingCoup.value = false
  }
}

// ══════════════════════════════════════════════════════════════════════════
// 3. ĐỊA CHỈ GIAO HÀNG
// ══════════════════════════════════════════════════════════════════════════
const addresses = ref<ShippingAddress[]>([])
const addrLoading = ref(false)
const showAddrModal = ref(false)
const editingAddr = ref<ShippingAddress | null>(null)
const addrSubmitting = ref(false)

const emptyAddrForm = () => ({
  receiver_name: '',
  phone: '',
  province: '',
  district: '',
  ward: '',
  detail_address: '',
  is_default: false,
})

const addrForm = ref(emptyAddrForm())

// ── GHN Dropdown state ────────────────────────────────────────────────────────
const ghn = useGhn()

// ID GHN riêng cho modal (không lưu vào DB, chỉ dùng để lọc dropdown)
const selectedProvinceId = ref<number | null>(null)
const selectedDistrictId = ref<number | null>(null)
const selectedWardCode = ref<string>('')

// Khi mở modal sửa địa chỉ cũ, cần map tên → ID để prefill dropdown
// (GHN trả về ID, DB lưu tên → cần so khớp sau khi load provinces)
async function initGhnDropdowns() {
  await ghn.fetchProvinces()

  if (addrForm.value.province) {
    // tìm province theo tên
    const prov = ghn.provinces.value.find(p =>
      p.ProvinceName.toLowerCase().includes(addrForm.value.province.toLowerCase()) ||
      addrForm.value.province.toLowerCase().includes(p.ProvinceName.toLowerCase())
    )
    if (prov) {
      selectedProvinceId.value = prov.ProvinceID
      await ghn.fetchDistricts(prov.ProvinceID)

      if (addrForm.value.district) {
        const dist = ghn.districts.value.find(d =>
          d.DistrictName.toLowerCase().includes(addrForm.value.district.toLowerCase()) ||
          addrForm.value.district.toLowerCase().includes(d.DistrictName.toLowerCase())
        )
        if (dist) {
          selectedDistrictId.value = dist.DistrictID
          await ghn.fetchWards(dist.DistrictID)

          if (addrForm.value.ward) {
            const ward = ghn.wards.value.find(w =>
              w.WardName.toLowerCase().includes(addrForm.value.ward.toLowerCase()) ||
              addrForm.value.ward.toLowerCase().includes(w.WardName.toLowerCase())
            )
            if (ward) selectedWardCode.value = ward.WardCode
          }
        }
      }
    }
  }
}

async function onProvinceChange(provinceId: number) {
  selectedProvinceId.value = provinceId
  selectedDistrictId.value = null
  selectedWardCode.value = ''
  addrForm.value.province = ghn.provinces.value.find(p => p.ProvinceID === provinceId)?.ProvinceName ?? ''
  addrForm.value.district = ''
  addrForm.value.ward = ''
  await ghn.fetchDistricts(provinceId)
}

async function onDistrictChange(districtId: number) {
  selectedDistrictId.value = districtId
  selectedWardCode.value = ''
  addrForm.value.district = ghn.districts.value.find(d => d.DistrictID === districtId)?.DistrictName ?? ''
  addrForm.value.ward = ''
  await ghn.fetchWards(districtId)
}

function onWardChange(wardCode: string) {
  selectedWardCode.value = wardCode
  addrForm.value.ward = ghn.wards.value.find(w => w.WardCode === wardCode)?.WardName ?? ''
}

async function fetchAddresses() {
  addrLoading.value = true
  try {
    const res = await api.get('/profile/addresses')
    addresses.value = res.data.data
  } catch {
    addresses.value = []
  } finally {
    addrLoading.value = false
  }
}

async function openAddressModal(addr?: ShippingAddress) {
  // Reset GHN state
  selectedProvinceId.value = null
  selectedDistrictId.value = null
  selectedWardCode.value = ''
  ghn.districts.value = []
  ghn.wards.value = []

  if (addr) {
    editingAddr.value = addr
    addrForm.value = {
      receiver_name: addr.receiver_name,
      phone: addr.phone,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      detail_address: addr.detail_address,
      is_default: addr.is_default,
    }
  } else {
    editingAddr.value = null
    addrForm.value = emptyAddrForm()
  }
  showAddrModal.value = true

  // Load provinces và prefill nếu đang edit
  await initGhnDropdowns()
}

function closeAddressModal() {
  showAddrModal.value = false
  editingAddr.value = null
  addrForm.value = emptyAddrForm()
  selectedProvinceId.value = null
  selectedDistrictId.value = null
  selectedWardCode.value = ''
  ghn.districts.value = []
  ghn.wards.value = []
}

async function submitAddress() {
  addrSubmitting.value = true
  try {
    const payload = {
      ...addrForm.value,
      ghn_district_id: selectedDistrictId.value,
      ghn_ward_code: selectedWardCode.value,
    }
    if (editingAddr.value) {
      await api.put(`/profile/addresses/${editingAddr.value.id}`, payload)  // ← đổi
      showToast('Cập nhật địa chỉ thành công!')
    } else {
      await api.post('/profile/addresses', payload)  // ← đổi
      showToast('Thêm địa chỉ thành công!')
    }
    closeAddressModal()
    await fetchAddresses()
  } catch (err: any) {
    const msg = err.response?.data?.message || 'Không thể lưu địa chỉ.'
    showToast(msg, 'error')
  } finally {
    addrSubmitting.value = false
  }
}

async function deleteAddress(id: number) {
  if (!confirm('Bạn có chắc muốn xoá địa chỉ này?')) return
  try {
    await api.delete(`/profile/addresses/${id}`)
    showToast('Đã xoá địa chỉ.')
    await fetchAddresses()
  } catch {
    showToast('Không thể xoá địa chỉ.', 'error')
  }
}

async function setDefaultAddress(id: number) {
  try {
    await api.patch(`/profile/addresses/${id}/set-default`)
    showToast('Đã đặt làm địa chỉ mặc định.')
    await fetchAddresses()
  } catch {
    showToast('Không thể đặt mặc định.', 'error')
  }
}

// ══════════════════════════════════════════════════════════════════════════
// 4. ĐỔI MẬT KHẨU
// ══════════════════════════════════════════════════════════════════════════
const pwLoading = ref(false)
const pwForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
})
const showPw = ref({ current: false, new: false, confirm: false })

const isGoogleAccount = computed(() => (authStore.user as any)?.provider === 'google')

const pwStrengthClass = computed(() => {
  const pw = pwForm.value.new_password
  if (!pw) return ''
  if (pw.length < 6) return 'weak'
  if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'medium'
  return 'strong'
})
const pwStrengthWidth = computed(() =>
  ({ weak: '33%', medium: '66%', strong: '100%' }[pwStrengthClass.value] || '0%')
)
const pwStrengthLabel = computed(() =>
  ({ weak: 'Yếu', medium: 'Trung bình', strong: 'Mạnh' }[pwStrengthClass.value] || '')
)

async function changePassword() {
  if (pwForm.value.new_password !== pwForm.value.new_password_confirmation) {
    showToast('Mật khẩu xác nhận không khớp!', 'error')
    return
  }
  pwLoading.value = true
  try {
    await api.post('/profile/change-password', {
      current_password: pwForm.value.current_password,
      new_password: pwForm.value.new_password,
      new_password_confirmation: pwForm.value.new_password_confirmation,
    })
    showToast('Đổi mật khẩu thành công!')
    pwForm.value = { current_password: '', new_password: '', new_password_confirmation: '' }
  } catch (err: any) {
    const errors = err.response?.data?.errors
    if (errors) {
      const firstError = Object.values(errors)[0] as string[]
      showToast(firstError[0], 'error')
    } else {
      const msg = err.response?.data?.message || 'Đổi mật khẩu thất bại.'
      showToast(msg, 'error')
    }
  } finally {
    pwLoading.value = false
  }
}

// ── Logout ────────────────────────────────────────────────────────────────
async function handleLogout() {
  await authStore.logout()
  router.push('/')
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const res = await api.get('/profile')
    const u = res.data.data
    if (authStore.user) {
      Object.assign(authStore.user, u)
      localStorage.setItem('user', JSON.stringify(authStore.user))
    }
  } catch (_) { }

  loadInfoForm()

  const params = new URLSearchParams(window.location.search)
  const tab = params.get('tab')
  if (tab && navItems.find(n => n.key === tab)) {
    activeTab.value = tab
  }
})

watch(activeTab, (val) => {
  if (val === 'coupons') fetchMyCoupons()
  if (val === 'address') fetchAddresses()
})
</script>

<style scoped>
.profile-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 16px 60px;
  font-family: 'Segoe UI', sans-serif;
  color: #222;
}

.breadcrumb {
  font-size: 13px;
  color: #888;
  margin-bottom: 16px;
}

.breadcrumb .sep {
  margin: 0 6px;
}

.breadcrumb .active {
  color: #2e7d32;
  font-weight: 500;
}

.profile-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
  align-items: start;
}

/* ── Sidebar ── */
.sidebar {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  position: sticky;
  top: 80px;
}

.user-card {
  background: linear-gradient(135deg, #2e7d32, #43a047);
  color: #fff;
  padding: 24px 16px;
  text-align: center;
}

.avatar-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 12px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, .4);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #fff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .25);
  border: 2px solid #e8f5e9;
  transition: background .2s, transform .15s;
}

.avatar-edit-btn:hover {
  background: #e8f5e9;
  transform: scale(1.1);
}

.user-card h3 {
  font-size: 15px;
  font-weight: 700;
  margin: 0 0 4px;
}

.user-card p {
  font-size: 12px;
  opacity: .8;
  margin: 0;
  word-break: break-all;
}

.side-nav {
  padding: 8px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 18px;
  background: none;
  border: none;
  border-left: 3px solid transparent;
  text-align: left;
  font-size: 14px;
  color: #444;
  cursor: pointer;
  transition: all .2s;
}

.nav-item:hover {
  background: #f1f8f2;
  color: #2e7d32;
}

.nav-item.active {
  background: #e8f5e9;
  color: #2e7d32;
  font-weight: 600;
  border-left-color: #2e7d32;
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.nav-logout {
  color: #e53935;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
}

.nav-logout:hover {
  background: #fef2f2;
  color: #c62828;
}

/* ── Main ── */
.main-content {
  min-width: 0;
  position: relative;
}

.section-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 24px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 2px solid #e8f5e9;
}

.section-head h2 {
  font-size: 17px;
  font-weight: 700;
  color: #1b5e20;
  margin: 0;
}

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 28px;
  left: 28px;
  right: auto;
  padding: 14px 22px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  z-index: 9999;
  box-shadow: 0 8px 28px rgba(0, 0, 0, .18);
  max-width: 340px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.toast.success {
  background: #1a5c2e;
}

.toast.error {
  background: #dc2626;
}

.toast-enter-active,
.toast-leave-active {
  transition: all .3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

/* ── Buttons ── */
.btn-edit {
  padding: 7px 16px;
  border: 1.5px solid #2e7d32;
  color: #2e7d32;
  background: #fff;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: all .2s;
}

.btn-edit:hover {
  background: #2e7d32;
  color: #fff;
}

.btn-add {
  padding: 7px 16px;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: background .2s;
}

.btn-add:hover {
  background: #1b5e20;
}

.btn-add.mt-12 {
  margin-top: 12px;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 28px;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
}

.btn-save:hover:not(:disabled) {
  background: #1b5e20;
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.btn-cancel {
  padding: 11px 20px;
  border: 1.5px solid #bbb;
  color: #555;
  background: #fff;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all .2s;
}

.btn-cancel:hover {
  border-color: #888;
  background: #f5f5f5;
}

.btn-spin {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, .4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

/* ── Form ── */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
}

.required {
  color: #e53935;
}

.form-group input:not([type="checkbox"]) {
  padding: 10px 13px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  outline: none;
  transition: border .2s;
  background: #fff;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:not([type="checkbox"]):focus {
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, .1);
}

.form-group input:disabled {
  background: #f9f9f9;
  color: #999;
  cursor: not-allowed;
}

.disabled-field {
  background: #f5f5f5 !important;
}

.form-actions {
  display: flex;
  gap: 10px;
}

.checkbox-group {
  padding-top: 4px;
}

.check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #444;
  cursor: pointer;
}

.check-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #2e7d32;
}

/* ── Password ── */
.input-pw-wrap {
  position: relative;
}

.input-pw-wrap input {
  padding-right: 42px !important;
}

.toggle-pw {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  padding: 0;
}

.toggle-pw:hover {
  color: #2e7d32;
}

.pw-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  background: #eee;
  border-radius: 2px;
  margin-bottom: 4px;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: width .3s;
}

.strength-fill.weak {
  background: #e53935;
}

.strength-fill.medium {
  background: #f57c00;
}

.strength-fill.strong {
  background: #2e7d32;
}

.strength-label {
  font-size: 12px;
  font-weight: 600;
}

.strength-label.weak {
  color: #e53935;
}

.strength-label.medium {
  color: #f57c00;
}

.strength-label.strong {
  color: #2e7d32;
}

.pw-mismatch {
  font-size: 12px;
  color: #e53935;
  margin-top: 5px;
}

.google-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fff8e1;
  border: 1px solid #ffe082;
  border-radius: 8px;
  color: #795548;
  font-size: 14px;
}

.google-notice span {
  font-size: 24px;
}

/* ── Address ── */
.address-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.address-card {
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  transition: border-color .2s;
}

.address-card:hover {
  border-color: #2e7d32;
}

.address-card.is-default {
  border-color: #a5d6a7;
  background: #f9fdf9;
}

.address-body {
  flex: 1;
}

.address-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
  flex-wrap: wrap;
}

.addr-name {
  font-weight: 700;
  font-size: 14px;
}

.addr-sep {
  color: #ccc;
}

.addr-phone {
  font-size: 13px;
  color: #555;
}

.default-badge {
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid #a5d6a7;
}

.addr-detail {
  font-size: 13px;
  color: #666;
  margin: 0;
}

.address-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn-addr-edit,
.btn-addr-delete,
.btn-addr-default {
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid;
  transition: all .15s;
  white-space: nowrap;
}

.btn-addr-edit {
  border-color: #2e7d32;
  color: #2e7d32;
  background: #fff;
}

.btn-addr-edit:hover {
  background: #2e7d32;
  color: #fff;
}

.btn-addr-delete {
  border-color: #e53935;
  color: #e53935;
  background: #fff;
}

.btn-addr-delete:hover {
  background: #e53935;
  color: #fff;
}

.btn-addr-default {
  border-color: #aaa;
  color: #666;
  background: #fff;
}

.btn-addr-default:hover {
  border-color: #2e7d32;
  color: #2e7d32;
}

/* ── Coupon ── */
.btn-goto-promo {
  padding: 7px 16px;
  border: 1.5px solid #2e7d32;
  border-radius: 20px;
  color: #2e7d32;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: all .2s;
}

.btn-goto-promo:hover,
.btn-goto-promo.filled {
  background: #2e7d32;
  color: #fff;
}

.btn-goto-promo.filled {
  display: inline-block;
  margin-top: 12px;
  padding: 10px 24px;
}

.coup-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px;
  color: #888;
  font-size: 14px;
}

.mini-spin {
  width: 20px;
  height: 20px;
  border: 2px solid #e8f5e9;
  border-top-color: #2e7d32;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

.coup-empty {
  text-align: center;
  padding: 40px;
  color: #aaa;
}

.coup-empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.coup-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.coup-item {
  display: flex;
  align-items: center;
  border: 1.5px solid #e8f5e9;
  border-radius: 10px;
  overflow: hidden;
}

.coup-item.expired,
.coup-item.used {
  opacity: .6;
}

.coup-left {
  background: linear-gradient(160deg, #2e7d32, #1b5e20);
  color: #fff;
  padding: 14px;
  min-width: 110px;
  text-align: center;
}

.coup-item.expired .coup-left,
.coup-item.used .coup-left {
  background: #9e9e9e;
}

.coup-discount {
  font-size: 15px;
  font-weight: 800;
}

.coup-min {
  font-size: 9px;
  opacity: .85;
  margin-top: 4px;
}

.coup-mid {
  flex: 1;
  padding: 12px 14px;
  border-left: 1px dashed #e0e0e0;
  border-right: 1px dashed #e0e0e0;
}

.coup-code {
  font-size: 15px;
  font-weight: 800;
  color: #1b5e20;
  font-family: monospace;
  letter-spacing: 1.5px;
}

.coup-item.expired .coup-code,
.coup-item.used .coup-code {
  color: #9e9e9e;
}

.coup-desc {
  font-size: 12px;
  color: #666;
  margin-top: 2px;
}

.coup-expire {
  font-size: 11px;
  color: #e53935;
  margin-top: 4px;
}

.coup-right {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 110px;
}

.coup-status {
  font-size: 11px;
  font-weight: 700;
}

.coup-status.active {
  color: #2e7d32;
}

.coup-status.expired,
.coup-status.used {
  color: #9e9e9e;
}

.btn-use-now {
  padding: 6px 14px;
  background: #2e7d32;
  color: #fff;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}

.btn-use-now:hover {
  background: #1b5e20;
}

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-box {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, .2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1b5e20;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #888;
}

.modal-close:hover {
  color: #333;
}

.modal-form {
  padding: 20px 24px;
}

.modal-actions {
  justify-content: flex-end;
}

.modal-enter-active,
.modal-leave-active {
  transition: all .25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(.96);
}

/* ── GHN Dropdown ── */
.ghn-select-wrap {
  position: relative;
}

.ghn-select {
  width: 100%;
  padding: 10px 36px 10px 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%232e7d32' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") no-repeat right 12px center;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
  color: #222;
}

.ghn-select:focus {
  border-color: #2e7d32;
  box-shadow: 0 0 0 3px rgba(46, 125, 50, .08);
}

.ghn-select:disabled {
  background-color: #f5f5f5;
  color: #aaa;
  cursor: not-allowed;
}

/* ── Spinner ── */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    position: static;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .address-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .address-actions {
    width: 100%;
  }

  .coup-item {
    flex-direction: column;
  }

  .coup-mid {
    border: none;
    border-top: 1px dashed #e0e0e0;
    border-bottom: 1px dashed #e0e0e0;
    width: 100%;
  }

  .coup-right {
    width: 100%;
  }
}
</style>