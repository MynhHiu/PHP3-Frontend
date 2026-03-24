<template>
  <div class="form-page-sm">
    <!-- Header -->
    <div class="form-back-header">
      <router-link to="/admin/brands" class="btn-back">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </router-link>
      <div class="fh-info">
        <h2>{{ isEdit ? 'Sửa thương hiệu' : 'Thêm thương hiệu mới' }}</h2>
        <p>Admin / Thương hiệu / {{ isEdit ? 'Chỉnh sửa' : 'Thêm mới' }}</p>
      </div>
    </div>

    <form @submit.prevent="submit" class="form-col">

      <!-- Thông tin -->
      <div class="section-card">
        <h3>Thông tin thương hiệu</h3>
        <div class="form-inner">

          <div class="form-row-2">
            <div class="field">
              <label class="label">Tên thương hiệu <span class="req">*</span></label>
              <input v-model="form.name" @input="autoSlug" class="input" placeholder="VD: Panasonic, Philips..." required />
            </div>
            <!-- <div class="field">
              <label class="label">Slug</label>
              <input v-model="form.slug" class="input font-mono" placeholder="panasonic" />
              <p class="slug-hint">/thuong-hieu/<span>{{ form.slug || 'slug' }}</span></p>
            </div> -->
          </div>

          <!-- <div class="form-row-2">
            <div class="field">
              <label class="label">Quốc gia xuất xứ</label>
              <input v-model="form.country" class="input" placeholder="VD: Nhật Bản, Hàn Quốc..." />
            </div>
            <div class="field">
              <label class="label">Thứ tự hiển thị</label>
              <input v-model.number="form.sort_order" type="number" min="0" class="input" />
            </div>
          </div> -->

          <!-- <div class="field">
            <label class="label">Website</label>
            <div class="website-input">
              <span class="website-prefix">
                <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
              </span>
              <input v-model="form.website" class="input" style="padding-left:36px" placeholder="https://www.panasonic.com" type="url" />
            </div>
          </div> -->

          <!-- <div class="field">
            <label class="label">Mô tả</label>
            <textarea v-model="form.description" class="input" rows="3" placeholder="Giới thiệu ngắn về thương hiệu..."></textarea>
          </div> -->

          <!-- <div class="toggle-row" @click="form.is_active = !form.is_active">
            <div :class="['toggle-track', form.is_active && 'on']">
              <div class="toggle-thumb"></div>
            </div>
            <div>
              <p class="toggle-label">Hiển thị thương hiệu</p>
              <p class="toggle-sub">Bật để hiện trên website</p>
            </div>
          </div> -->
        </div>
      </div>

      <!-- Logo -->
      <!-- <div class="section-card">
        <h3>Logo thương hiệu</h3>
        <div class="upload-zone" @click="($refs.logoRef as HTMLInputElement).click()"
          @dragover.prevent @drop.prevent="onDrop">
          <template v-if="preview">
            <img :src="preview" class="brand-logo-preview" />
            <p class="cat-img-change">Click để thay logo</p>
          </template>
          <template v-else>
            <svg style="width:32px;height:32px;color:var(--gray-300);margin:0 auto 8px;display:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p style="font-size:13px;font-weight:500;color:var(--gray-600)">Kéo thả hoặc <span style="color:var(--brand);text-decoration:underline">chọn logo</span></p>
            <p style="font-size:11px;color:var(--gray-400);margin-top:4px">PNG, JPG, SVG tối đa 2MB · Nên dùng ảnh nền trắng/trong suốt</p>
          </template>
        </div>
        <input ref="logoRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />
      </div> -->

      <!-- Actions -->
      <div class="form-footer">
        <router-link to="/admin/brands" class="btn btn-outline">← Quay lại</router-link>
        <button type="submit" :disabled="submitting" class="btn btn-primary btn-min">
          <svg v-if="submitting" class="animate-spin" style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
          </svg>
          {{ submitting ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo thương hiệu') }}
        </button>
      </div>
    </form>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="slide-up">
        <div v-if="toast" :class="['toast', toast.type]">
          {{ toast.type === 'success' ? '✓' : '✕' }} {{ toast.msg }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBrandStore } from '@/admin/stores/brandStore'
import { brandApi } from '@/api'

const route    = useRoute()
const router   = useRouter()
const store    = useBrandStore()

const isEdit     = computed(() => !!route.params.id)
const submitting = ref(false)
const toast      = ref<{ msg: string; type: string } | null>(null)
const logoRef    = ref<HTMLInputElement>()
const logoFile   = ref<File | null>(null)
const preview    = ref<string | null>(null)

const form = ref({
  name: '', slug: '', description: '',
  website: '', country: '',
  sort_order: 0, is_active: true,
})

function autoSlug() {
  form.value.slug = form.value.name
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) { logoFile.value = f; preview.value = URL.createObjectURL(f) }
}
function onDrop(e: DragEvent) {
  const f = e.dataTransfer?.files[0]
  if (f?.type.startsWith('image/')) { logoFile.value = f; preview.value = URL.createObjectURL(f) }
}

function buildFd(): FormData {
  const fd = new FormData()
  Object.entries(form.value).forEach(([k, v]) => {
    if (v !== null && v !== undefined) fd.append(k, String(v))
  })
  if (logoFile.value) fd.append('logo', logoFile.value)
  return fd
}

async function submit() {
  submitting.value = true
  try {
    const fd = buildFd()
    const id = Number(route.params.id)

    if (isEdit.value) {
      // Dùng store nếu có update, không thì gọi API trực tiếp
      if (typeof (store as any).update === 'function') {
        await (store as any).update(id, fd)
      } else {
        await brandApi.update(id, fd)
      }
      showToast('Cập nhật thương hiệu thành công!', 'success')
    } else {
      if (typeof (store as any).create === 'function') {
        await (store as any).create(fd)
      } else {
        await brandApi.create(fd)
      }
      showToast('Tạo thương hiệu thành công!', 'success')
    }
    setTimeout(() => router.push('/admin/brands'), 1200)
  } catch (err: any) {
    showToast(err.userMessage || 'Lưu thất bại, kiểm tra lại API', 'error')
  } finally {
    submitting.value = false
  }
}

function showToast(msg: string, type: string) {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3500)
}

onMounted(async () => {
  if (isEdit.value) {
    await store.fetchAll()
    const id = Number(route.params.id)
    // Hỗ trợ cả store có getById lẫn không có
    const b = typeof (store as any).getById === 'function'
      ? (store as any).getById(id)
      : store.brands.find(x => x.id === id)
    if (b) {
      Object.assign(form.value, {
        name:        b.name        ?? '',
        slug:        b.slug        ?? '',
        description: b.description ?? '',
        website:     b.website     ?? '',
        country:     b.country     ?? '',
        sort_order:  b.sort_order  ?? 0,
        is_active:   b.is_active   ?? true,
      })
      if (b.logo) {
        const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'
        preview.value = `${base}/storage/${b.logo}`
      }
    }
  }
})
</script>