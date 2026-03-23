<template>
  <div class="form-page">
    <!-- Header -->
    <div class="form-back-header">
      <router-link to="/admin/products" class="btn-back">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </router-link>
      <div class="fh-info">
        <h2>{{ isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới' }}</h2>
        <p>Admin / Sản phẩm / {{ isEdit ? 'Chỉnh sửa' : 'Thêm mới' }}</p>
      </div>
    </div>

    <form @submit.prevent="submit">
      <div class="form-grid">

        <!-- Left -->
        <div class="form-col">
          <div class="section-card">
            <h3>Thông tin cơ bản</h3>
            <div class="form-inner">
              <div class="field">
                <label class="label">Tên sản phẩm <span class="req">*</span></label>
                <input v-model="form.name" @input="autoSlug" class="input" placeholder="VD: Nồi cơm điện Panasonic 1.8L" required />
              </div>
              <div class="form-row-2">
                <div class="field">
                  <label class="label">SKU</label>
                  <input v-model="form.sku" class="input" placeholder="Tự động nếu để trống" />
                </div>
                <div class="field">
                  <label class="label">Thương hiệu</label>
                  <input v-model="form.brand" class="input" placeholder="VD: Panasonic, Philips" />
                </div>
              </div>
              <div class="field">
                <label class="label">Mô tả sản phẩm</label>
                <textarea v-model="form.description" class="input" rows="4" placeholder="Mô tả chi tiết sản phẩm..."></textarea>
              </div>
            </div>
          </div>

          <!-- Images -->
          <div class="section-card">
            <h3>Hình ảnh <span class="sub">({{ previewImages.length }}/8)</span></h3>
            <div class="upload-zone" @click="($refs.fileInput as HTMLInputElement).click()"
              @dragover.prevent @drop.prevent="onDrop">
              <svg style="width:32px;height:32px;color:var(--gray-300);margin:0 auto 8px;display:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p style="font-size:13px;font-weight:500;color:var(--gray-600)">Kéo thả hoặc <span style="color:var(--brand);text-decoration:underline">chọn file</span></p>
              <p style="font-size:11px;color:var(--gray-400);margin-top:4px">PNG, JPG tối đa 5MB · Tối đa 8 ảnh</p>
            </div>
            <input ref="fileInput" type="file" multiple accept="image/*" class="hidden" @change="onFileChange" />

            <div v-if="previewImages.length" class="img-grid">
              <div v-for="(img, i) in previewImages" :key="i" class="img-thumb">
                <img :src="img" />
                <button type="button" @click="removeImg(i)" class="img-remove">×</button>
                <span v-if="i === 0" class="img-main-badge">Ảnh chính</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right -->
        <div class="form-col">
          <div class="section-card">
            <h3>Phân loại</h3>
            <div class="form-inner">
              <div class="field">
                <label class="label">Danh mục <span class="req">*</span></label>
                <select v-model="form.category_id" class="input" required>
                  <option value="">-- Chọn danh mục --</option>
                  <optgroup v-if="catStore.rootCategories.length" label="Danh mục gốc">
                    <option v-for="c in catStore.rootCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </optgroup>
                  <optgroup v-if="catStore.childCategories.length" label="Danh mục con">
                    <option v-for="c in catStore.childCategories" :key="c.id" :value="c.id">↳ {{ c.name }}</option>
                  </optgroup>
                </select>
              </div>
              <div class="field">
                <label class="label">Trạng thái</label>
                <select v-model="form.status" class="input">
                  <option value="active">Đang bán</option>
                  <option value="draft">Nháp</option>
                  <option value="hidden">Ẩn</option>
                </select>
              </div>
              <div class="toggle-row" @click="form.is_featured = !form.is_featured">
                <div :class="['toggle-track', form.is_featured && 'on']">
                  <div class="toggle-thumb"></div>
                </div>
                <span class="toggle-label">Sản phẩm nổi bật</span>
              </div>
            </div>
          </div>

          <div class="section-card">
            <h3>Giá & Kho hàng</h3>
            <div class="form-inner">
              <div class="field">
                <label class="label">Giá bán <span class="req">*</span></label>
                <div class="price-input">
                  <input v-model.number="form.price" type="number" min="0" step="1000" class="input" required />
                  <span class="price-suffix">₫</span>
                </div>
              </div>
              <div class="field">
                <label class="label">Giá gốc</label>
                <div class="price-input">
                  <input v-model.number="form.original_price" type="number" min="0" step="1000" class="input" />
                  <span class="price-suffix">₫</span>
                </div>
                <p v-if="discount" class="discount-hint">🏷️ Giảm {{ discount }}%</p>
              </div>
              <div class="field">
                <label class="label">Tồn kho <span class="req">*</span></label>
                <input v-model.number="form.stock" type="number" min="0" class="input" required />
              </div>
            </div>
          </div>

          <div class="section-card">
            <h3>SEO</h3>
            <div class="field">
              <label class="label">Slug URL</label>
              <input v-model="form.slug" class="input font-mono" placeholder="tu-dong-tao" />
              <p class="slug-hint">/san-pham/<span>{{ form.slug || 'slug' }}</span></p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-col-full">
          <div class="form-footer">
            <router-link to="/admin/products" class="btn btn-outline">← Quay lại</router-link>
            <div class="form-footer-right">
              <button type="button" @click="saveAsDraft" class="btn btn-outline">Lưu nháp</button>
              <button type="submit" :disabled="submitting" class="btn btn-primary btn-min">
                <svg v-if="submitting" class="animate-spin" style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                </svg>
                {{ submitting ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo sản phẩm') }}
              </button>
            </div>
          </div>
        </div>
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
import { useProductStore }  from '@/admin/stores/productStore'
import { useCategoryStore } from '@/admin/stores/categoryStore'

const route     = useRoute()
const router    = useRouter()
const store     = useProductStore()
const catStore  = useCategoryStore()

const isEdit     = computed(() => !!route.params.id)
const submitting = ref(false)
const toast      = ref<{ msg: string; type: string } | null>(null)
const fileInput  = ref<HTMLInputElement>()
const selectedFiles  = ref<File[]>([])
const previewImages  = ref<string[]>([])

const form = ref({
  name: '', slug: '', sku: '', brand: '', description: '',
  price: 0, original_price: 0, stock: 0,
  category_id: '' as number | string,
  status: 'active' as 'active' | 'draft' | 'hidden',
  is_featured: false,
})

const discount = computed(() => {
  if (form.value.original_price > form.value.price && form.value.price > 0)
    return Math.round((1 - form.value.price / form.value.original_price) * 100)
  return null
})

function autoSlug() {
  form.value.slug = form.value.name
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
}

function onFileChange(e: Event) {
  addFiles(Array.from((e.target as HTMLInputElement).files || []))
}
function onDrop(e: DragEvent) {
  addFiles(Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/')))
}
function addFiles(files: File[]) {
  files.slice(0, 8 - selectedFiles.value.length).forEach(f => {
    selectedFiles.value.push(f)
    previewImages.value.push(URL.createObjectURL(f))
  })
}
function removeImg(i: number) {
  selectedFiles.value.splice(i, 1)
  previewImages.value.splice(i, 1)
}

function buildFormData(): FormData {
  const fd = new FormData()
  Object.entries(form.value).forEach(([k, v]) => {
    if (v !== null && v !== '') fd.append(k, String(v))
  })
  selectedFiles.value.forEach(f => fd.append('images[]', f))
  return fd
}

async function submit() {
  submitting.value = true
  try {
    if (isEdit.value) {
      await store.update(Number(route.params.id), buildFormData())
      showToast('Cập nhật sản phẩm thành công!', 'success')
    } else {
      await store.create(buildFormData())
      showToast('Tạo sản phẩm thành công!', 'success')
    }
    setTimeout(() => router.push('/admin/products'), 1200)
  } catch (err: any) {
    showToast(err.userMessage || 'Lưu thất bại, kiểm tra lại API', 'error')
  } finally {
    submitting.value = false
  }
}

function saveAsDraft() { form.value.status = 'draft'; submit() }
function showToast(msg: string, type: string) {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3500)
}

onMounted(async () => {
  await catStore.fetchAll()
  if (isEdit.value) {
    const existing = store.getById(Number(route.params.id))
    if (existing) {
      Object.assign(form.value, existing)
      if (existing.images) {
        const base = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'
        previewImages.value = existing.images.map((img: string) => `${base}/storage/${img}`)
      }
    }
  }
})
</script>
