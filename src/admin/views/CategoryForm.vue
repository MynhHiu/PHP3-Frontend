<template>
  <div class="form-page-sm">
    <div class="form-back-header">
      <router-link to="/admin/categories" class="btn-back">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </router-link>
      <div class="fh-info">
        <h2>{{ isEdit ? 'Sửa danh mục' : 'Thêm danh mục mới' }}</h2>
        <p>Admin / Danh mục / {{ isEdit ? 'Chỉnh sửa' : 'Thêm mới' }}</p>
      </div>
    </div>

    <form @submit.prevent="submit" class="form-col">
      <div class="section-card">
        <h3>Thông tin danh mục</h3>
        <div class="form-inner">
          <div class="form-col">
            <div class="field">
              <label class="label">Tên danh mục <span class="req">*</span></label>
              <input v-model="form.name" @input="autoSlug" class="input" placeholder="VD: Quạt điện, quạt trần" required />
            </div>
            <!-- <div class="field">
              <label class="label">Slug</label>
              <input v-model="form.slug" class="input font-mono" placeholder="quat-dien-quat-tran" />
            </div> -->
          </div>

          <!-- <div class="form-row-2"> -->
            <div class="field">
              <label class="label">Danh mục cha</label>
              <select v-model="form.parent_id" class="input">
                <option :value="null">— Không có (gốc) —</option>
                <option v-for="c in parentOptions" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <!-- <div class="field">
              <label class="label">Thứ tự hiển thị</label>
              <input v-model.number="form.sort_order" type="number" min="0" class="input" />
            </div> -->
          <!-- </div> -->

          <div class="field">
            <label class="label">Mô tả</label>
            <textarea v-model="form.description" class="input" rows="3" placeholder="Mô tả ngắn về danh mục..."></textarea>
          </div>

          <div class="toggle-row" @click="form.is_active = !form.is_active">
            <div :class="['toggle-track', form.is_active && 'on']">
              <div class="toggle-thumb"></div>
            </div>
            <div>
              <p class="toggle-label">Hiển thị danh mục</p>
              <p class="toggle-sub">Bật để hiện trên website</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Image -->
        <!-- <div class="section-card">
          <h3>Ảnh đại diện</h3>
          <div class="upload-zone" @click="($refs.imgRef as HTMLInputElement).click()"
            @dragover.prevent @drop.prevent="onDrop">
            <template v-if="preview">
              <img :src="preview" class="cat-img-preview" />
              <p class="cat-img-change">Click để thay ảnh</p>
            </template>
            <template v-else>
              <svg style="width:32px;height:32px;color:var(--gray-300);margin:0 auto 8px;display:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
            </svg>
            <p style="font-size:13px;font-weight:500;color:var(--gray-600)">Kéo thả hoặc <span style="color:var(--brand);text-decoration:underline">chọn ảnh</span></p>
            <p style="font-size:11px;color:var(--gray-400);margin-top:4px">PNG, JPG tối đa 2MB</p>
          </template>
        </div>
        <input ref="imgRef" type="file" accept="image/*" class="hidden" @change="onFileChange" />
      </div> -->

      <div class="form-footer">
        <router-link to="/admin/categories" class="btn btn-outline">← Quay lại</router-link>
        <button type="submit" :disabled="submitting" class="btn btn-primary btn-min">
          <svg v-if="submitting" class="animate-spin" style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
          </svg>
          {{ submitting ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo danh mục') }}
        </button>
      </div>
    </form>

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
import { useCategoryStore } from '@/admin/stores/categoryStore'

const route    = useRoute()
const router   = useRouter()
const store    = useCategoryStore()

const isEdit     = computed(() => !!route.params.id)
const submitting = ref(false)
const toast      = ref<{ msg: string; type: string } | null>(null)
const imgRef     = ref<HTMLInputElement>()
const imgFile    = ref<File | null>(null)
const preview    = ref<string | null>(null)

const form = ref({
  name: '', slug: '', description: '',
  parent_id: null as number | null,
  sort_order: 0, is_active: true,
})

const parentOptions = computed(() =>
  store.categories.filter(c => !c.parent_id && c.id !== Number(route.params.id))
)

function autoSlug() {
  form.value.slug = form.value.name
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) { imgFile.value = f; preview.value = URL.createObjectURL(f) }
}
function onDrop(e: DragEvent) {
  const f = e.dataTransfer?.files[0]
  if (f?.type.startsWith('image/')) { imgFile.value = f; preview.value = URL.createObjectURL(f) }
}

async function submit() {
  submitting.value = true
  try {
    const fd = new FormData()
    Object.entries(form.value).forEach(([k, v]) => {
      if (v !== null) fd.append(k, String(v))
    })
    if (imgFile.value) fd.append('image', imgFile.value)

    if (isEdit.value) {
      await store.update(Number(route.params.id), fd)
      showToast('Cập nhật danh mục thành công!', 'success')
    } else {
      await store.create(fd)
      showToast('Tạo danh mục thành công!', 'success')
    }
    setTimeout(() => router.push('/admin/categories'), 1200)
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
  await store.fetchAll()
  if (isEdit.value) {
    const c = store.getById(Number(route.params.id))
    if (c) {
      Object.assign(form.value, c)
      if (c.image) {
        const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'
        preview.value = `${base}/storage/${c.image}`
      }
    }
  }
})
</script>
