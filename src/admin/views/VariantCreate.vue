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
      <!-- LEFT -->
      <div class="form-col">

        <!-- Tên biến thể -->
        <div class="section-card">
          <h3>Thông tin biến thể</h3>
          <div class="form-inner">
            <div class="field">
              <label class="label">Tên biến thể <span class="req">*</span></label>
              <input
                v-model="form.variant_name"
                class="input"
                placeholder="VD: Màu sắc, Kích cỡ, Dung tích..."
                required
                autofocus
              />
              <!-- <p class="field-note">Ví dụ: Màu sắc, Kích thước, Chất liệu...</p> -->
            </div>
          </div>
        </div>

        Giá trị của biến thể
        <div class="section-card">
          <h3>
            Giá trị của biến thể
            <!-- <span class="option-count-badge">{{ validOptions.length }}</span> -->
          </h3>
          <!-- <p class="section-desc">
            Nhập các giá trị cho
            <strong>{{ form.variant_name || 'biến thể' }}</strong>.
            Nhấn <kbd>Enter</kbd> để thêm nhanh.
          </p> -->

          <div class="options-list">
            <div v-for="(opt, i) in options" :key="i" class="option-row">
              <input
                v-model="opt.option_label"
                class="input"
                :placeholder="placeholderFor(i)"
                @keydown.enter.prevent="onEnterOption(i)"
                :ref="el => { if (el) optionRefs[i] = el as HTMLInputElement }"
              />
              <button
                v-if="options.length > 1"
                type="button"
                @click="removeOption(i)"
                class="btn-icon delete"
                title="Xóa"
              >
                <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                </svg>
              </button>
            </div>
          </div>

          <button type="button" @click="addOption" class="btn btn-outline btn-sm" style="margin-top:10px">
            + Thêm giá trị
          </button>
        </div>
      </div>

      <!-- RIGHT -->
      <!-- <div class="form-col"> -->
        <!-- <div class="section-card"> -->
          <!-- <h3>Xem trước</h3>
          <div v-if="form.variant_name" class="preview-block">
            <p class="preview-label">Tên biến thể</p>
            <span class="badge badge-green">{{ form.variant_name }}</span>

            <p class="preview-label" style="margin-top:14px">Các giá trị</p>
            <div class="option-chips">
              <span v-for="(opt, i) in validOptions" :key="i" class="option-chip">
                {{ opt.option_label }}
              </span>
              <span v-if="validOptions.length === 0" class="preview-empty">Chưa có giá trị</span>
            </div>

            <p class="preview-label" style="margin-top:14px">Tóm tắt</p>
            <p class="preview-text">
              Biến thể <strong>{{ form.variant_name }}</strong>
              có <strong>{{ validOptions.length }}</strong> giá trị
            </p>
          </div> -->
          <!-- <div v-else class="empty-preview">
            <div style="font-size:28px;margin-bottom:8px">🏷️</div>
            <p>Nhập tên biến thể để xem trước</p>
          </div> -->
        <!-- </div> -->

        <!-- <div class="section-card tips-card">
          <h3>💡 Gợi ý</h3>
          <ul class="tips-list">
            <li>Nhấn <kbd>Enter</kbd> ở ô giá trị để thêm dòng kế tiếp</li>
            <li><em>Màu sắc</em> → Đỏ, Xanh, Trắng, Đen, Vàng</li>
            <li><em>Kích cỡ</em> → S, M, L, XL, XXL</li>
            <li><em>Dung tích</em> → 250ml, 500ml, 1L, 2L</li>
            <li>Sau khi tạo, vào <strong>Gán biến thể</strong> để gắn vào sản phẩm</li>
          </ul>
        </div> -->
      <!-- </div> -->
    </div>

    <!-- Footer -->
    <div class="form-footer" style="margin-top:16px">
      <router-link to="/admin/variants" class="btn btn-outline">← Quay lại</router-link>
      <button
        type="button"
        @click="submit"
        :disabled="submitting || !form.variant_name.trim()"
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
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { variantApi, productApi } from '@/api'

const route      = useRoute()
const router     = useRouter()
const isEdit     = computed(() => !!route.params.id)
const submitting = ref(false)
const toast      = ref<{ msg: string; type: string } | null>(null)
const optionRefs = ref<HTMLInputElement[]>([])

// Chỉ cần tên biến thể — không cần product_id
const form = reactive({ variant_name: '' })

// Giá trị: chỉ nhập text label
const options = reactive<Array<{ id?: number; option_label: string }>>([
  { option_label: '' }
])

const validOptions = computed(() => options.filter(o => o.option_label.trim()))

// Placeholder thông minh theo tên biến thể
const EXAMPLES: Record<string, string[]> = {
  'màu':  ['Đỏ', 'Xanh lam', 'Trắng', 'Đen', 'Vàng', 'Hồng'],
  'kích': ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  'size': ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  'dung': ['250ml', '500ml', '1L', '2L', '5L'],
  'chất': ['Cotton', 'Polyester', 'Linen', 'Silk', 'Denim'],
  'kiểu': ['Cổ tròn', 'Cổ V', 'Cổ polo', 'Không cổ'],
}

function placeholderFor(index: number): string {
  const name = form.variant_name.toLowerCase()
  for (const [key, vals] of Object.entries(EXAMPLES)) {
    if (name.includes(key)) return `VD: ${vals[index % vals.length]}`
  }
  return `VD: Giá trị ${index + 1}`
}

function addOption() {
  options.push({ option_label: '' })
  nextTick(() => optionRefs.value[options.length - 1]?.focus())
}

function removeOption(i: number) {
  options.splice(i, 1)
}

function onEnterOption(i: number) {
  if (i === options.length - 1) {
    addOption()
  } else {
    optionRefs.value[i + 1]?.focus()
  }
}

async function submit() {
  if (!form.variant_name.trim()) return
  submitting.value = true
  try {
    if (isEdit.value) {
      await variantApi.updateVariant(Number(route.params.id), {
        variant_name: form.variant_name.trim(),
      })
      // Thêm option mới (chưa có id trong DB)
      const newOpts = options.filter(o => o.option_label.trim() && !o.id)
      for (let i = 0; i < newOpts.length; i++) {
        await variantApi.createOption(Number(route.params.id), {
          product_variant_id: Number(route.params.id),
          option_values: i + 1,
        })
      }
      showToast('Cập nhật biến thể thành công!', 'success')
    } else {
      // Tạo biến thể không gắn sản phẩm (product_id = 0 hoặc null)
      // Việc gán sản phẩm thực hiện ở trang Gán biến thể
      const res = await variantApi.createVariant(0, {
        variant_name: form.variant_name.trim(),
        product_id: 0,
      })
      const newVariant = res.data.data ?? res.data

      // Tạo các giá trị (option_values = số thứ tự INT)
      const toCreate = options.filter(o => o.option_label.trim())
      for (let i = 0; i < toCreate.length; i++) {
        await variantApi.createOption(newVariant.id, {
          product_variant_id: newVariant.id,
          option_values: i + 1,
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
  if (!isEdit.value) return
  try {
    const pRes = await productApi.getAll()
    const allProducts = pRes.data.data ?? pRes.data
    for (const p of allProducts) {
      try {
        const vRes = await variantApi.getVariants(p.id)
        const variants = vRes.data.data ?? vRes.data
        const found = variants.find((v: any) => v.id === Number(route.params.id))
        if (found) {
          form.variant_name = found.variant_name
          if (found.options?.length) {
            options.splice(0, options.length)
            for (const opt of found.options) {
              options.push({ id: opt.id, option_label: opt.option_label || String(opt.option_values) })
            }
          }
          break
        }
      } catch {}
    }
  } catch {}
})
</script>

<style scoped>
.variant-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 768px) { .variant-layout { grid-template-columns: 1fr; } }

.field-note { font-size: 11px; color: var(--gray-400); margin-top: 4px; }
.section-desc { font-size: 13px; color: var(--gray-500); margin-bottom: 12px; line-height: 1.5; }
.section-desc kbd, .tips-list kbd {
  background: var(--gray-100); border: 1px solid var(--gray-300);
  border-radius: 4px; padding: 1px 5px; font-size: 11px; font-family: monospace;
}

.option-count-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--brand); color: white; font-size: 11px; font-weight: 700;
  border-radius: 10px; min-width: 20px; height: 20px; padding: 0 6px;
  margin-left: 6px; vertical-align: middle;
}

.options-list { display: flex; flex-direction: column; gap: 8px; }
.option-row   { display: flex; gap: 8px; align-items: center; }
.option-row .input { flex: 1; }

.preview-block  { padding: 4px 0; }
.preview-label  { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gray-400); margin-bottom: 6px; }
.preview-text   { font-size: 13px; color: var(--gray-600); margin: 0; }
.preview-empty  { font-size: 12px; color: var(--gray-400); }
.option-chips   { display: flex; flex-wrap: wrap; gap: 6px; }
.option-chip    { display: inline-flex; align-items: center; background: var(--gray-100); border: 1px solid var(--gray-200); border-radius: 20px; padding: 4px 12px; font-size: 13px; color: var(--gray-700); }
.empty-preview  { text-align: center; padding: 28px 16px; color: var(--gray-400); font-size: 13px; }

.tips-card { margin-top: 0; }
.tips-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.tips-list li { font-size: 13px; color: var(--gray-600); padding-left: 16px; position: relative; line-height: 1.5; }
.tips-list li::before { content: '•'; position: absolute; left: 0; color: var(--brand); font-weight: 700; }
.tips-list em     { color: var(--brand); font-style: normal; font-weight: 600; }
.tips-list strong { color: var(--gray-700); }
</style>