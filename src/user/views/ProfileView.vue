<template>
  <div class="profile-page">
    <div class="breadcrumb">
      <span>Trang chủ</span>
      <span class="sep">›</span>
      <span class="active">Tài khoản của tôi</span>
    </div>

    <div class="profile-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="user-card">
          <div class="avatar-wrap">
            <img :src="user.avatar" alt="avatar" class="avatar" />
            <label class="avatar-edit-btn" title="Thay ảnh">
              <input type="file" accept="image/*" hidden @change="handleAvatarChange" />
              ✏️
            </label>
          </div>
          <h3>{{ user.fullName }}</h3>
          <p>{{ user.email }}</p>
        </div>

        <nav class="side-nav">
          <button
            v-for="item in navItems"
            :key="item.key"
            :class="['nav-item', { active: activeTab === item.key }]"
            @click="activeTab = item.key"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </nav>
      </aside>

      <!-- Main -->
      <main class="main-content">
        <!-- Thông tin cá nhân -->
        <section v-if="activeTab === 'info'" class="section-card">
          <div class="section-head">
            <h2>👤 Thông tin cá nhân</h2>
            <button class="btn-edit" @click="editing = !editing">
              {{ editing ? '✕ Huỷ' : '✏️ Chỉnh sửa' }}
            </button>
          </div>

          <form @submit.prevent="saveProfile" class="form-grid">
            <div class="form-group">
              <label>Họ và tên <span class="required">*</span></label>
              <input v-model="form.fullName" :disabled="!editing" type="text" placeholder="Nhập họ và tên" />
            </div>
            <div class="form-group">
              <label>Số điện thoại <span class="required">*</span></label>
              <input v-model="form.phone" :disabled="!editing" type="tel" placeholder="0901234567" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" :disabled="true" type="email" class="disabled-field" />
            </div>
            <div class="form-group">
              <label>Ngày sinh</label>
              <input v-model="form.birthday" :disabled="!editing" type="date" />
            </div>
            <div class="form-group full">
              <label>Địa chỉ</label>
              <input v-model="form.address" :disabled="!editing" type="text" placeholder="Số nhà, đường, phường/xã..." />
            </div>
            <div class="form-group full">
              <label>Giới tính</label>
              <div class="radio-group">
                <label v-for="g in genders" :key="g.value" class="radio-label">
                  <input v-model="form.gender" :disabled="!editing" type="radio" :value="g.value" />
                  {{ g.label }}
                </label>
              </div>
            </div>
            <div class="form-actions full" v-if="editing">
              <button type="submit" class="btn-save">💾 Lưu thay đổi</button>
            </div>
          </form>
        </section>

        <!-- Đổi mật khẩu -->
        <section v-if="activeTab === 'password'" class="section-card">
          <div class="section-head">
            <h2>🔒 Đổi mật khẩu</h2>
          </div>
          <form @submit.prevent="changePassword" class="form-grid">
            <div class="form-group full">
              <label>Mật khẩu hiện tại <span class="required">*</span></label>
              <div class="input-pw-wrap">
                <input v-model="pwForm.current" :type="showPw.current ? 'text' : 'password'" placeholder="••••••••" />
                <button type="button" class="toggle-pw" @click="showPw.current = !showPw.current">
                  {{ showPw.current ? '🙈' : '👁' }}
                </button>
              </div>
            </div>
            <div class="form-group full">
              <label>Mật khẩu mới <span class="required">*</span></label>
              <div class="input-pw-wrap">
                <input v-model="pwForm.new" :type="showPw.new ? 'text' : 'password'" placeholder="Tối thiểu 8 ký tự" />
                <button type="button" class="toggle-pw" @click="showPw.new = !showPw.new">
                  {{ showPw.new ? '🙈' : '👁' }}
                </button>
              </div>
              <div class="pw-strength" v-if="pwForm.new">
                <div class="strength-bar">
                  <div :class="['strength-fill', pwStrengthClass]" :style="{ width: pwStrengthWidth }"></div>
                </div>
                <span :class="['strength-label', pwStrengthClass]">{{ pwStrengthLabel }}</span>
              </div>
            </div>
            <div class="form-group full">
              <label>Xác nhận mật khẩu mới <span class="required">*</span></label>
              <div class="input-pw-wrap">
                <input v-model="pwForm.confirm" :type="showPw.confirm ? 'text' : 'password'" placeholder="Nhập lại mật khẩu mới" />
                <button type="button" class="toggle-pw" @click="showPw.confirm = !showPw.confirm">
                  {{ showPw.confirm ? '🙈' : '👁' }}
                </button>
              </div>
              <p class="pw-mismatch" v-if="pwForm.confirm && pwForm.new !== pwForm.confirm">
                ⚠️ Mật khẩu không khớp
              </p>
            </div>
            <div class="form-actions full">
              <button type="submit" class="btn-save">🔐 Cập nhật mật khẩu</button>
            </div>
          </form>
        </section>

        <!-- Địa chỉ -->
        <section v-if="activeTab === 'address'" class="section-card">
          <div class="section-head">
            <h2>📍 Địa chỉ giao hàng</h2>
            <button class="btn-add" @click="showAddAddress = true">+ Thêm địa chỉ</button>
          </div>

          <div class="address-list">
            <div v-for="addr in addresses" :key="addr.id" class="address-card">
              <div class="address-body">
                <div class="address-name-row">
                  <span class="addr-name">{{ addr.name }}</span>
                  <span class="addr-phone">{{ addr.phone }}</span>
                  <span v-if="addr.isDefault" class="default-badge">Mặc định</span>
                </div>
                <p class="addr-detail">{{ addr.detail }}</p>
              </div>
              <div class="address-actions">
                <button class="btn-addr-edit">Sửa</button>
                <button class="btn-addr-delete" @click="deleteAddress(addr.id)">Xoá</button>
                <button v-if="!addr.isDefault" class="btn-addr-default" @click="setDefault(addr.id)">
                  Đặt mặc định
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Đơn hàng của tôi -->
        <section v-if="activeTab === 'orders'" class="section-card">
          <div class="section-head">
            <h2>📦 Đơn hàng của tôi</h2>
          </div>
          <div class="quick-order-stats">
            <div v-for="stat in orderStats" :key="stat.label" class="stat-card" @click="$router.push('/order-history')">
              <span class="stat-icon">{{ stat.icon }}</span>
              <span class="stat-count">{{ stat.count }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
          <button class="btn-view-all" @click="$router.push('/order-history')">
            Xem tất cả đơn hàng →
          </button>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref('info')
const editing = ref(false)
const showAddAddress = ref(false)

const user = ref({
  fullName: 'Nguyễn Văn An',
  email: 'nguyenvanan@email.com',
  avatar: 'https://placehold.co/80x80/e8f5e9/2e7d32?text=NVA',
  phone: '0901234567'
})

const navItems = [
  { key: 'info', icon: '👤', label: 'Thông tin cá nhân' },
  { key: 'orders', icon: '📦', label: 'Đơn hàng của tôi' },
  { key: 'address', icon: '📍', label: 'Địa chỉ giao hàng' },
  { key: 'password', icon: '🔒', label: 'Đổi mật khẩu' },
]

const genders = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
]

const form = ref({
  fullName: 'Nguyễn Văn An',
  phone: '0901234567',
  email: 'nguyenvanan@email.com',
  birthday: '1995-06-15',
  address: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
  gender: 'male'
})

const pwForm = ref({ current: '', new: '', confirm: '' })
const showPw = ref({ current: false, new: false, confirm: false })

const pwStrengthClass = computed(() => {
  const pw = pwForm.value.new
  if (!pw) return ''
  if (pw.length < 6) return 'weak'
  if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'medium'
  return 'strong'
})
const pwStrengthWidth = computed(() => ({ weak: '33%', medium: '66%', strong: '100%' }[pwStrengthClass.value] || '0%'))
const pwStrengthLabel = computed(() => ({ weak: 'Yếu', medium: 'Trung bình', strong: 'Mạnh' }[pwStrengthClass.value] || ''))

const addresses = ref([
  {
    id: 1, isDefault: true,
    name: 'Nguyễn Văn An', phone: '0901234567',
    detail: '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM'
  },
  {
    id: 2, isDefault: false,
    name: 'Nguyễn Văn An', phone: '0912345678',
    detail: '456 Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM'
  }
])

const orderStats = [
  { icon: '⏳', count: 1, label: 'Chờ xác nhận' },
  { icon: '🚚', count: 2, label: 'Đang giao' },
  { icon: '✅', count: 12, label: 'Đã giao' },
  { icon: '❌', count: 1, label: 'Đã huỷ' },
]

const handleAvatarChange = (e: any) => {
  const file = e.target.files[0]
  if (file) user.value.avatar = URL.createObjectURL(file)
}
const saveProfile = () => {
  editing.value = false
  user.value.fullName = form.value.fullName
  alert('Cập nhật thông tin thành công!')
}
const changePassword = () => {
  if (pwForm.value.new !== pwForm.value.confirm) return alert('Mật khẩu không khớp!')
  alert('Đổi mật khẩu thành công!')
  pwForm.value = { current: '', new: '', confirm: '' }
}
const deleteAddress = (id: number) => {
  if (confirm('Xoá địa chỉ này?')) addresses.value = addresses.value.filter(a => a.id !== id)
}
const setDefault = (id: number) => {
  addresses.value.forEach(a => a.isDefault = a.id === id)
}
</script>

<style scoped>
.profile-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 16px 60px;
  font-family: 'Segoe UI', sans-serif;
  color: #222;
}

.breadcrumb { font-size: 13px; color: #888; margin-bottom: 16px; }
.breadcrumb .sep { margin: 0 6px; }
.breadcrumb .active { color: #2e7d32; font-weight: 500; }

.profile-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 20px;
  align-items: start;
}

/* Sidebar */
.sidebar {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
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
.avatar-wrap { position: relative; display: inline-block; margin-bottom: 12px; }
.avatar {
  width: 80px; height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255,255,255,.4);
}
.avatar-edit-btn {
  position: absolute;
  bottom: 0; right: 0;
  background: #fff;
  border-radius: 50%;
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0,0,0,.2);
}
.user-card h3 { font-size: 15px; font-weight: 700; margin: 0 0 4px; }
.user-card p { font-size: 12px; opacity: .8; margin: 0; }

.side-nav { padding: 8px 0; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 18px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #444;
  cursor: pointer;
  transition: all .2s;
  border-left: 3px solid transparent;
}
.nav-item:hover { background: #f1f8f2; color: #2e7d32; }
.nav-item.active { background: #e8f5e9; color: #2e7d32; font-weight: 600; border-left-color: #2e7d32; }
.nav-icon { font-size: 16px; width: 20px; text-align: center; }

/* Main */
.main-content { min-width: 0; }

.section-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
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
.section-head h2 { font-size: 17px; font-weight: 700; color: #1b5e20; margin: 0; }

.btn-edit {
  padding: 7px 16px;
  border: 1.5px solid #2e7d32;
  color: #2e7d32;
  background: #fff;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: all .2s;
}
.btn-edit:hover { background: #2e7d32; color: #fff; }
.btn-add {
  padding: 7px 16px;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
  font-weight: 500;
  transition: background .2s;
}
.btn-add:hover { background: #1b5e20; }

/* Form */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: 1 / -1; }

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
}
.required { color: #e53935; }

.form-group input:not([type="radio"]) {
  padding: 10px 13px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  color: #333;
  outline: none;
  transition: border .2s;
  background: #fff;
  font-family: inherit;
}
.form-group input:not([type="radio"]):focus { border-color: #2e7d32; box-shadow: 0 0 0 3px rgba(46,125,50,.1); }
.form-group input:disabled { background: #f9f9f9; color: #999; cursor: not-allowed; }
.disabled-field { background: #f5f5f5 !important; }

.radio-group { display: flex; gap: 20px; padding-top: 4px; }
.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #444;
  cursor: pointer;
}
.radio-label input[type="radio"] { accent-color: #2e7d32; width: 16px; height: 16px; }

.form-actions { display: flex; justify-content: flex-start; }
.btn-save {
  padding: 11px 28px;
  background: #2e7d32;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background .2s, transform .1s;
}
.btn-save:hover { background: #1b5e20; transform: translateY(-1px); }

/* Password */
.input-pw-wrap {
  position: relative;
}
.input-pw-wrap input {
  width: 100%;
  padding: 10px 42px 10px 13px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border .2s;
  box-sizing: border-box;
  font-family: inherit;
}
.input-pw-wrap input:focus { border-color: #2e7d32; box-shadow: 0 0 0 3px rgba(46,125,50,.1); }
.toggle-pw {
  position: absolute;
  right: 10px; top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}
.pw-strength { margin-top: 8px; }
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
.strength-fill.weak { background: #e53935; }
.strength-fill.medium { background: #f57c00; }
.strength-fill.strong { background: #2e7d32; }
.strength-label { font-size: 12px; font-weight: 600; }
.strength-label.weak { color: #e53935; }
.strength-label.medium { color: #f57c00; }
.strength-label.strong { color: #2e7d32; }
.pw-mismatch { font-size: 12px; color: #e53935; margin-top: 5px; }

/* Address */
.address-list { display: flex; flex-direction: column; gap: 12px; }
.address-card {
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  transition: border-color .2s;
}
.address-card:hover { border-color: #2e7d32; }
.address-body { flex: 1; }
.address-name-row { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; flex-wrap: wrap; }
.addr-name { font-weight: 700; font-size: 14px; }
.addr-phone { font-size: 13px; color: #555; }
.default-badge {
  background: #e8f5e9;
  color: #2e7d32;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid #a5d6a7;
}
.addr-detail { font-size: 13px; color: #666; }
.address-actions { display: flex; gap: 6px; flex-shrink: 0; }
.btn-addr-edit, .btn-addr-delete, .btn-addr-default {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid;
  transition: all .15s;
  white-space: nowrap;
}
.btn-addr-edit { border-color: #2e7d32; color: #2e7d32; background: #fff; }
.btn-addr-edit:hover { background: #2e7d32; color: #fff; }
.btn-addr-delete { border-color: #e53935; color: #e53935; background: #fff; }
.btn-addr-delete:hover { background: #e53935; color: #fff; }
.btn-addr-default { border-color: #888; color: #555; background: #fff; }
.btn-addr-default:hover { border-color: #2e7d32; color: #2e7d32; }

/* Order stats */
.quick-order-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all .2s;
  text-align: center;
}
.stat-card:hover { border-color: #2e7d32; background: #f1f8f2; transform: translateY(-2px); }
.stat-icon { font-size: 26px; margin-bottom: 8px; }
.stat-count { font-size: 24px; font-weight: 800; color: #2e7d32; }
.stat-label { font-size: 12px; color: #777; margin-top: 3px; }

.btn-view-all {
  display: block;
  width: 100%;
  padding: 12px;
  background: #f1f8f2;
  border: 1.5px solid #2e7d32;
  color: #2e7d32;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
}
.btn-view-all:hover { background: #2e7d32; color: #fff; }

@media (max-width: 768px) {
  .profile-layout { grid-template-columns: 1fr; }
  .sidebar { position: static; }
  .form-grid { grid-template-columns: 1fr; }
  .quick-order-stats { grid-template-columns: repeat(2, 1fr); }
}
</style>