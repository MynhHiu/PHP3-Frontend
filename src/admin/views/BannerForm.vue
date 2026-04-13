<template>
    <div class="page-stack">

        <!-- Header -->
        <div class="page-header">
            <div class="page-header-info">
                <h2>{{ isEdit ? 'Chỉnh sửa Banner' : 'Thêm Banner Mới' }}</h2>
                <p>{{ isEdit ? `ID: ${route.params.id}` : 'Điền thông tin để tạo banner mới' }}</p>
            </div>
            <router-link to="/admin/banners" class="btn btn-outline btn-sm">← Quay lại</router-link>
        </div>

        <!-- Loading skeleton khi edit -->
        <div v-if="loadingDetail" class="table-card" style="padding:40px;text-align:center;color:var(--gray-400)">
            Đang tải...
        </div>

        <form v-else @submit.prevent="handleSubmit" class="form-card" enctype="multipart/form-data">

            <!-- Preview ảnh -->
            <div class="form-section">
                <label class="form-label">Ảnh Banner <span class="required">*</span></label>
                <div class="img-drop-zone" @dragover.prevent @drop.prevent="onDrop" @click="fileInput?.click()">
                    <img v-if="previewUrl" :src="previewUrl" class="img-preview" alt="preview" />
                    <div v-else class="img-placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
                            style="width:40px;height:40px;color:var(--gray-300)">
                            <rect x="3" y="3" width="18" height="18" rx="3" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                        <p style="margin:8px 0 4px;color:var(--gray-400)">Kéo thả hoặc click để chọn ảnh</p>
                        <p style="font-size:12px;color:var(--gray-300)">JPG, PNG, WEBP — tối đa 5MB</p>
                    </div>
                </div>
                <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
                <p v-if="errors.image" class="field-error">{{ errors.image }}</p>
            </div>

            <!-- Tiêu đề -->
            <div class="form-group">
                <label class="form-label">Tiêu đề <span class="required">*</span></label>
                <input v-model="form.title" type="text" class="input" placeholder="VD: Khuyến mãi mùa hè" />
                <p v-if="errors.title" class="field-error">{{ errors.title }}</p>
            </div>

            <!-- Mô tả -->
            <div class="form-group">
                <label class="form-label">Mô tả ngắn</label>
                <input v-model="form.description" type="text" class="input"
                    placeholder="VD: Giảm giá lên đến 50% tất cả sản phẩm" />
            </div>

            <!-- Link -->
            <div class="form-group">
                <label class="form-label">Link khi click</label>
                <input v-model="form.link" type="text" class="input" placeholder="VD: /products hoặc https://..." />
            </div>

            <!-- Loại banner -->
            <div class="form-group">
                <label class="form-label">Loại banner <span class="required">*</span></label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:4px">
                    <label :class="['banner-type-option', form.banner_type === 'main' ? 'active' : '']"
                        @click="form.banner_type = 'main'">
                        <div>
                            <strong>Banner chính</strong>
                            <p style="font-size:12px;color:var(--gray-400);margin:2px 0 0">Slider lớn bên trái trang chủ
                            </p>
                        </div>
                    </label>
                    <label :class="['banner-type-option', form.banner_type === 'side' ? 'active' : '']"
                        @click="form.banner_type = 'side'">
                        <div>
                            <strong>Banner nhỏ</strong>
                            <p style="font-size:12px;color:var(--gray-400);margin:2px 0 0">Ô nhỏ bên phải (tối đa 2 ô)
                            </p>
                        </div>
                    </label>
                </div>
                <p style="font-size:12px;color:var(--gray-400);margin-top:6px">
                    Banner nhỏ: chỉ hiển thị tối đa 2 banner (theo thứ tự hiển thị).
                </p>
            </div>
            <div v-if="sideIsFull" class="side-full-warning">
                <div>
                    <strong>Đã có đủ 2 banner nhỏ đang hiển thị!</strong>
                    <p>Vui lòng ẩn hoặc xóa bớt banner nhỏ hiện tại trước khi thêm mới.</p>
                </div>
            </div>

            <!-- Thứ tự & trạng thái -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                <div class="form-group">
                    <label class="form-label">Thứ tự hiển thị</label>
                    <input v-model.number="form.sort_order" type="number" min="0" class="input" placeholder="0" />
                    <p style="font-size:12px;color:var(--gray-400);margin-top:4px">Số nhỏ hơn → hiển thị trước</p>
                </div>
                <div class="form-group">
                    <label class="form-label">Trạng thái</label>
                    <div style="display:flex;align-items:center;gap:10px;margin-top:10px">
                        <label class="toggle-switch">
                            <input type="checkbox" v-model="form.is_active" />
                            <span class="toggle-slider"></span>
                        </label>
                        <span style="font-size:14px;color:var(--gray-600)">
                            {{ form.is_active ? 'Hiển thị trên trang chủ' : 'Đang ẩn' }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Submit -->
            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:8px">
                <router-link to="/admin/banners" class="btn btn-outline">Huỷ</router-link>
                <button type="submit" class="btn btn-primary" :disabled="submitting || sideIsFull">
                    <svg v-if="submitting" class="animate-spin" style="width:14px;height:14px" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2">
                        <path
                            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    {{ submitting ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo Banner') }}
                </button>
            </div>

        </form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { bannerApi } from '@/api'
import { useBannerStore } from '@/admin/stores/bannerStore'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const loadingDetail = ref(false)
const submitting = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const previewUrl = ref<string>('')
const selectedFile = ref<File | null>(null)
const bannerStore = useBannerStore()

const sideBannerCount = computed(() =>
    bannerStore.banners.filter(b =>
        b.banner_type === 'side' && b.is_active && b.id !== Number(route.params.id)
    ).length
)

const sideIsFull = computed(() =>
    form.banner_type === 'side' && !isEdit.value && sideBannerCount.value >= 2
)

const form = reactive({
    title: '',
    description: '',
    link: '',
    sort_order: 0,
    is_active: true,
    banner_type: 'main' as 'main' | 'side',
})

const errors = reactive<Record<string, string>>({})

// Nếu là Edit thì load dữ liệu cũ
onMounted(async () => {
    if (bannerStore.banners.length === 0) await bannerStore.fetchAll()
    if (!isEdit.value) return
    loadingDetail.value = true
    try {
        const res = await bannerApi.getOne(Number(route.params.id))
        const data = res.data
        form.title = data.title
        form.description = data.description ?? ''
        form.link = data.link ?? ''
        form.sort_order = data.sort_order
        form.is_active = data.is_active
        form.banner_type = data.banner_type ?? 'main'
        previewUrl.value = data.image_url
    } catch {
        alert('Không thể tải thông tin banner')
        router.push('/admin/banners')
    } finally {
        loadingDetail.value = false
    }
})

function onFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) setFile(file)
}

function onDrop(e: DragEvent) {
    const file = e.dataTransfer?.files?.[0]
    if (file && file.type.startsWith('image/')) setFile(file)
}

function setFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
        errors.image = 'Ảnh phải nhỏ hơn 5MB'
        return
    }
    delete errors.image
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
}

function validate(): boolean {
    Object.keys(errors).forEach(k => delete errors[k])
    if (!form.title.trim()) { errors.title = 'Tiêu đề không được để trống' }
    if (!isEdit.value && !selectedFile.value) { errors.image = 'Vui lòng chọn ảnh banner' }
    return Object.keys(errors).length === 0
}

async function handleSubmit() {
    if (!validate()) return

    submitting.value = true
    try {
        const fd = new FormData()
        fd.append('title', form.title)
        fd.append('description', form.description)
        fd.append('link', form.link)
        fd.append('sort_order', String(form.sort_order))
        fd.append('is_active', form.is_active ? '1' : '0')
        fd.append('banner_type', form.banner_type)
        if (selectedFile.value) fd.append('image', selectedFile.value)

        if (isEdit.value) {
            await bannerApi.update(Number(route.params.id), fd)
        } else {
            await bannerApi.create(fd)
        }

        router.push('/admin/banners')
    } catch (err: any) {
        alert(err.userMessage || 'Lỗi khi lưu banner')
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.form-card {
    background: #fff;
    border: 1px solid var(--gray-100);
    border-radius: 12px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--gray-700);
}

.required {
    color: var(--red-500);
}

.field-error {
    font-size: 12px;
    color: var(--red-500);
    margin: 2px 0 0;
}

.img-drop-zone {
    border: 2px dashed var(--gray-200);
    border-radius: 10px;
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    overflow: hidden;
    transition: border-color .2s;
}

.img-drop-zone:hover {
    border-color: var(--primary);
}

.img-preview {
    width: 100%;
    max-height: 220px;
    object-fit: cover;
    display: block;
}

.img-placeholder {
    text-align: center;
    padding: 24px;
}

/* Toggle switch */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
}

.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    inset: 0;
    background: var(--gray-200);
    border-radius: 24px;
    cursor: pointer;
    transition: .2s;
}

.toggle-slider::before {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    left: 3px;
    top: 3px;
    background: white;
    border-radius: 50%;
    transition: .2s;
}

input:checked+.toggle-slider {
    background: var(--primary);
}

input:checked+.toggle-slider::before {
    transform: translateX(20px);
}

/* Banner type selector */
.banner-type-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border: 2px solid var(--gray-100);
    border-radius: 10px;
    cursor: pointer;
    transition: all .15s;
    background: var(--gray-50);
}

.banner-type-option:hover {
    border-color: #a8d5b5;
    background: #f0faf4;
}

.banner-type-option.active {
    border-color: var(--primary);
    background: #e8f5ee;
}

.banner-type-option strong {
    font-size: 13.5px;
    color: var(--gray-700);
}

.side-full-warning {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 13px;
  color: #c53030;
}
.side-full-warning span { font-size: 20px; flex-shrink: 0; }
.side-full-warning strong { display: block; font-size: 13.5px; margin-bottom: 4px; }
.side-full-warning p { margin: 0; font-size: 12px; color: #e53e3e; }
</style>