<template>
  <div class="form-page">
    <!-- Header -->
    <div class="form-back-header">
      <router-link to="/admin/variants" class="btn-back">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </router-link>
      <div class="fh-info">
        <h2>{{ isEdit ? 'Sửa biến thể' : 'Tạo biến thể mới' }}</h2>
        <p>Admin / Biến thể / {{ isEdit ? 'Chỉnh sửa' : 'Tạo mới' }}</p>
      </div>
    </div>

    <div class="variant-layout">
      <!-- LEFT: Thông tin biến thể -->
      <div class="form-col">
        <div class="section-card">
          <h3>Thông tin biến thể</h3>
          <div class="form-inner">
            <!-- Tên biến thể — variant_name VARCHAR(255) -->
            <!-- <div class="field">
              <label class="label">
                Tên biến thể <span class="req">*</span>
                <span class="hint">— Bảng: product_variants.variant_name</span>
              </label>
              <input
                v-model="form.variant_name"
                class="input"
                placeholder="VD: Màu sắc, Kích cỡ, Dung tích..."
                required
              />
            </div> -->

            <!-- Sản phẩm liên kết — product_id INT(11) -->
            <div class="field">
              <label class="label">
                Sản phẩm <span class="req">*</span>
                <!-- <span class="hint">— Bảng: product_variants.product_id</span> -->
              </label>
              <select v-model="form.product_id" class="input" required>
                <option value="">-- Chọn sản phẩm --</option>
                <option v-for="p in products" :key="p.id" :value="p.id">
                  [{{ p.id }}] {{ p.name }}
                </option>
              </select>
              <p class="field-note">Biến thể sẽ được gắn với sản phẩm này.</p>
            </div>
          </div>
        </div>

        <!-- Giá trị tùy chọn -->
        <div class="section-card">
          <!-- <h3>
            Giá trị tùy chọn
            <span class="sub">— Bảng: variant_options.option_values (INT)</span>
          </h3> -->
          <!-- <p class="section-desc">
            Mỗi giá trị được lưu dưới dạng <strong>số nguyên</strong> trong cột
            <code>option_values</code>. Bạn nhập số ID hoặc mã giá trị.
          </p> -->

          <div class="options-list">
            <div
              v-for="(opt, i) in options"
              :key="i"
              class="option-row"
            >
              <!-- option_values INT(11) -->
              <div class="field" style="flex:1">
                <label class="label">Giá trị số</label>
                <input
                  v-model.number="opt.option_values"
                  type="number"
                  class="input font-mono"
                  placeholder="1, 2, 3..."
                  min="0"
                />
              </div>
              <!-- Label hiển thị (frontend only, không lưu DB) -->
              <div class="field" style="flex:2">
                <label class="label">Tên hiển thị</label>
                <input
                  v-model="opt.option_label"
                  class="input"
                  placeholder="VD: Đỏ, Xanh, Size M..."
                />
              </div>
              <button
                v-if="options.length > 1"
                type="button"
                @click="removeOption(i)"
                class="btn-icon delete"
                style="margin-top:22px"
              >
                <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                </svg>
              </button>
            </div>
          </div>

          <button type="button" @click="addOption" class="btn btn-outline btn-sm" style="margin-top:12px">
            + Thêm giá trị
          </button>
        </div>
      </div>

      <!-- RIGHT: Xem trước & hướng dẫn -->
      <div class="form-col">
        <div class="section-card">
          <h3>Xem trước</h3>
          <div v-if="form.variant_name" class="preview-block">
            <p class="preview-label">Tên biến thể:</p>
            <span class="badge badge-green">{{ form.variant_name }}</span>

            <p class="preview-label" style="margin-top:12px">Giá trị:</p>
            <div class="option-chips">
              <span
                v-for="(opt, i) in options.filter(o => o.option_values !== null)"
                :key="i"
                class="option-chip"
              >
                {{ opt.option_label || opt.option_values }}
                <span class="chip-id">#{{ opt.option_values }}</span>
              </span>
            </div>
          </div>
          <div v-else class="empty-table" style="padding:24px">
            <p style="font-size:13px;color:var(--gray-400)">Nhập tên biến thể để xem trước</p>
          </div>
        </div>

        <!-- Hướng dẫn cột DB -->
        <!-- <div class="section-card">
          <h3>Cấu trúc database</h3>
          <div class="db-table-info">
            <p class="db-table-name">📋 product_variants</p>
            <table class="db-cols-table">
              <tr><td class="col-name">id</td><td class="col-type">INT AUTO_INCREMENT PK</td></tr>
              <tr><td class="col-name">variant_name</td><td class="col-type">VARCHAR(255) NOT NULL</td></tr>
              <tr><td class="col-name">product_id</td><td class="col-type">INT(11) FK → products.id</td></tr>
              <tr><td class="col-name">created_at</td><td class="col-type">DATETIME</td></tr>
            </table>
            <p class="db-table-name" style="margin-top:12px">📋 variant_options</p>
            <table class="db-cols-table">
              <tr><td class="col-name">id</td><td class="col-type">INT AUTO_INCREMENT PK</td></tr>
              <tr><td class="col-name">product_variant_id</td><td class="col-type">INT FK → product_variants.id</td></tr>
              <tr class="col-highlight"><td class="col-name">option_values</td><td class="col-type">INT(11) NOT NULL ⚠️</td></tr>
              <tr><td class="col-name">created_at</td><td class="col-type">DATETIME</td></tr>
            </table>
          </div>
        </div> -->
      </div>
    </div>

    <!-- Footer actions -->
    <div class="form-footer" style="margin-top:16px">
      <router-link to="/admin/variants" class="btn btn-outline">← Quay lại</router-link>
      <button
        type="button"
        @click="submit"
        :disabled="submitting || !form.variant_name || !form.product_id"
        class="btn btn-primary btn-min"
      >
        <svg v-if="submitting" class="animate-spin" style="width:16px;height:16px" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
        </svg>
        {{ submitting ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo biến thể') }}
      </button>
    </div>

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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { variantApi, productApi } from '@/api'

const route      = useRoute()
const router     = useRouter()
const isEdit     = computed(() => !!route.params.id)
const submitting = ref(false)
const products   = ref<any[]>([])
const toast      = ref<{ msg: string; type: string } | null>(null)

// Form khớp với bảng product_variants
const form = reactive({
  variant_name: '',   // VARCHAR(255)
  product_id: '' as number | string,  // INT(11) FK → products.id
})

// Danh sách giá trị tùy chọn (variant_options)
const options = reactive<Array<{
  option_values: number | null   // INT(11) — trường trong DB
  option_label: string           // Frontend only
}>>([{ option_values: null as any, option_label: '' }])

function addOption() {
  options.push({ option_values: null as any, option_label: '' })
}
function removeOption(i: number) {
  options.splice(i, 1)
}

async function submit() {
  if (!form.variant_name || !form.product_id) return
  submitting.value = true
  try {
    if (isEdit.value) {
      // Cập nhật variant_name
      await variantApi.updateVariant(Number(route.params.id), {
        variant_name: form.variant_name,
      })
      showToast('Cập nhật biến thể thành công!', 'success')
    } else {
      // Tạo biến thể mới
      const res = await variantApi.createVariant(Number(form.product_id), {
        variant_name: form.variant_name,
        product_id: Number(form.product_id),
      })
      const newVariant = res.data.data ?? res.data

      // Tạo các giá trị tùy chọn
      const validOptions = options.filter(o => o.option_values !== null && !isNaN(o.option_values))
      for (const opt of validOptions) {
        await variantApi.createOption(newVariant.id, {
          product_variant_id: newVariant.id,
          option_values: Number(opt.option_values),  // INT(11)
        })
      }
      showToast('Tạo biến thể thành công!', 'success')
    }
    setTimeout(() => router.push('/admin/variants'), 1200)
  } catch (err: any) {
    showToast(err.userMessage || 'Lưu thất bại', 'error')
  } finally {
    submitting.value = false
  }
}

function showToast(msg: string, type: string) {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3500)
}

onMounted(async () => {
  // Lấy danh sách sản phẩm
  try {
    const res = await productApi.getAll()
    products.value = res.data.data ?? res.data
  } catch {}

  // Nếu đang edit
  if (isEdit.value) {
    try {
      // TODO: load variant by id nếu API có endpoint /admin/variants/:id
    } catch {}
  }
})
</script>

<style scoped>
.preview-label { font-size: 12px; color: var(--gray-500); margin-bottom: 6px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
.preview-block { padding: 8px 0; }
.option-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.option-chip { display: flex; align-items: center; gap: 4px; background: var(--gray-100); border-radius: 6px; padding: 4px 10px; font-size: 13px; }
.chip-id { font-size: 10px; color: var(--gray-400); font-family: monospace; }
.db-table-info { font-size: 12px; }
.db-table-name { font-weight: 600; color: var(--gray-700); margin-bottom: 6px; }
.db-cols-table { width: 100%; border-collapse: collapse; }
.db-cols-table tr td { padding: 4px 8px; border-bottom: 1px solid var(--gray-100); }
.col-name { font-family: monospace; font-weight: 600; color: var(--brand); }
.col-type { color: var(--gray-500); font-size: 11px; }
.col-highlight td { background: #fef3cd; }
.section-desc { font-size: 12px; color: var(--gray-500); margin-bottom: 12px; }
.hint { font-size: 10px; font-weight: 400; color: var(--gray-400); font-family: monospace; }
.field-note { font-size: 11px; color: var(--gray-400); margin-top: 4px; }
.option-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 8px; }
.options-list { display: flex; flex-direction: column; }
.variant-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 768px) { .variant-layout { grid-template-columns: 1fr; } }
</style>