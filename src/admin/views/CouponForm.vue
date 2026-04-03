<template>
  <div class="form-page">
    <div class="form-back-header">
      <router-link to="/admin/coupons" class="btn-back">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </router-link>
      <div class="fh-info">
        <h2>{{ isEdit ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá mới' }}</h2>
        <p>Admin / Mã giảm giá / {{ isEdit ? 'Chỉnh sửa' : 'Thêm mới' }}</p>
      </div>
    </div>

    <div v-if="loadingData" class="loading-state">
      <svg class="animate-spin" style="width:20px;height:20px" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2">
        <path
          d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
      Đang tải...
    </div>

    <form v-else @submit.prevent="submit">
      <div class="form-grid" style="grid-template-columns:1fr;max-width:640px">
        <div class="form-col">

          <div class="section-card">
            <h3>Thông tin mã giảm giá</h3>
            <div class="form-inner">

              <div class="field">
                <label class="label">Mã giảm giá <span class="req">*</span></label>
                <input v-model="form.coupon_code" class="input" placeholder="VD: SUMMER2026"
                  style="font-family:monospace;text-transform:uppercase;letter-spacing:1px;max-width:260px"
                  @input="form.coupon_code = (form.coupon_code as string).toUpperCase()" :disabled="isEdit" />
                <p style="font-size:11px;color:var(--gray-400);margin-top:4px">
                  Chỉ dùng chữ hoa, số, dấu gạch ngang. Không thể đổi sau khi tạo.
                </p>
              </div>

              <div class="form-row-2">
                <div class="field">
                  <label class="label">Loại giảm <span class="req">*</span></label>
                  <select v-model="discountType" class="input">
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (₫)</option>
                  </select>
                </div>
                <div class="field">
                  <label class="label">
                    Giá trị <span class="req">*</span>
                    <span style="font-weight:400;color:var(--gray-400)">{{ discountType === 'percent' ? '(%)' : '(₫)'
                    }}</span>
                  </label>
                  <input v-model.number="discountValue" class="input" type="number" min="0"
                    :max="discountType === 'percent' ? 100 : undefined"
                    :placeholder="discountType === 'percent' ? 'VD: 20' : 'VD: 50000'" />
                </div>
              </div>

              <div class="field">
                <label class="label">Đơn hàng tối thiểu (₫)</label>
                <input v-model.number="form.minordervalue" class="input" type="number" min="0"
                  placeholder="0 = không giới hạn" style="max-width:260px" />
              </div>

              <div class="field">
                <label class="label">Thời hạn hết hạn</label>
                <input v-model="form.expires_at" class="input" type="datetime-local" style="max-width:260px"
                  :min="minExpiresAt" />
                <p style="font-size:11px;color:var(--gray-400);margin-top:4px">
                  Để trống nếu mã không có thời hạn.
                </p>
              </div>

              <div class="field">
                <label class="label">Mô tả <span class="req">*</span></label>
                <textarea v-model="form.description" class="input" rows="3"
                  placeholder="VD: Giảm 20% cho đơn từ 200k - áp dụng tháng 6/2026"></textarea>
              </div>

            </div>
          </div>

          <!-- Preview -->
          <div v-if="discountValue > 0" class="section-card" style="background:var(--gray-50)">
            <h3>Xem trước</h3>
            <p style="font-size:13px;color:var(--gray-700);margin-top:8px">
              Mã <strong style="color:var(--brand)">{{ form.coupon_code || '...' }}</strong>
              giảm <strong>{{ discountType === 'percent' ? discountValue + '%' : fmtMoney(discountValue) }}</strong>
              <span v-if="form.minordervalue > 0"> cho đơn từ {{ fmtMoney(form.minordervalue) }}</span>
            </p>
            <p style="font-size:12px;color:var(--gray-400);margin-top:4px">
              Lưu DB: <code
                style="background:var(--gray-100);padding:2px 6px;border-radius:4px">{{ computedDiscount }}</code>
            </p>
          </div>

          <div class="form-actions">
            <router-link to="/admin/coupons" class="btn btn-outline">Hủy</router-link>
            <button type="submit" :disabled="submitting" class="btn btn-primary btn-min">
              <svg v-if="submitting" class="animate-spin" style="width:14px;height:14px" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
              </svg>
              {{ submitting ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo mã') }}
            </button>
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
import { useCouponStore } from '@/admin/stores/couponStore'

const route = useRoute()
const router = useRouter()
const store = useCouponStore()

const isEdit = computed(() => !!route.params.code)
const loadingData = ref(false)
const submitting = ref(false)
const toast = ref<{ msg: string; type: string } | null>(null)

const discountType = ref<'percent' | 'fixed'>('percent')
const discountValue = ref(0)

const form = ref({
  coupon_code: '',
  description: '',
  minordervalue: 0,
  expires_at: '' as string | null,
})

const minExpiresAt = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

const computedDiscount = computed(() =>
  discountType.value === 'percent'
    ? discountValue.value + '%'
    : String(discountValue.value)
)

const fmtMoney = (v?: number | null) =>
  v ? v.toLocaleString('vi-VN') + '₫' : '0₫'

function showToast(msg: string, type: string) {
  toast.value = { msg, type }
  setTimeout(() => (toast.value = null), 3000)
}

function parseDiscount(discount: string) {
  if (String(discount).endsWith('%')) {
    discountType.value = 'percent'
    discountValue.value = parseFloat(discount)
  } else {
    discountType.value = 'fixed'
    discountValue.value = parseFloat(discount)
  }
}

async function submit() {
  if (!form.value.coupon_code.trim()) return showToast('Vui lòng nhập mã giảm giá', 'error')
  if (!discountValue.value) return showToast('Vui lòng nhập giá trị giảm', 'error')
  if (!form.value.description.trim()) return showToast('Vui lòng nhập mô tả', 'error')
  if (discountType.value === 'percent' && discountValue.value > 100)
    return showToast('Phần trăm giảm không được vượt quá 100%', 'error')

  const payload = {
    coupon_code: form.value.coupon_code.toUpperCase().trim(),
    discount: computedDiscount.value,
    description: form.value.description.trim(),
    minordervalue: form.value.minordervalue || 0,
    expires_at: form.value.expires_at || null,
  }

  submitting.value = true
  try {
    if (isEdit.value) {
      await store.update(String(route.params.code), payload)
      showToast('Cập nhật mã giảm giá thành công!', 'success')
    } else {
      await store.create(payload)
      showToast('Tạo mã giảm giá thành công!', 'success')
    }
    setTimeout(() => router.push('/admin/coupons'), 800)
  } catch (e: any) {
    showToast(e.userMessage || 'Lưu thất bại', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    loadingData.value = true
    try {
      await store.fetchAll()
      const c = store.getByCode(String(route.params.code))
      if (c) {
        form.value.coupon_code = c.coupon_code
        form.value.description = c.description
        form.value.minordervalue = c.minordervalue
        form.value.expires_at = c.expires_at
          ? new Date(c.expires_at).toISOString().slice(0, 16)
          : null
        parseDiscount(c.discount)
      }
    } finally {
      loadingData.value = false
    }
  }
})
</script>