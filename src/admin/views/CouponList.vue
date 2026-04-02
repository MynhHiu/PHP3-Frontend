<template>
  <div class="page-stack">
    <div class="page-header">
      <div class="page-header-info">
        <h2>Mã giảm giá</h2>
        <p>Tổng {{ store.coupons.length }} mã</p>
      </div>
      <router-link to="/admin/coupons/create" class="btn btn-primary">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Thêm mã giảm giá
      </router-link>
    </div>

    <div class="filter-bar">
      <input v-model="search" @input="debouncedFilter" placeholder="Tìm mã hoặc mô tả..." class="input" />
      <button v-if="search" @click="search = ''" class="btn btn-outline btn-sm" style="color:var(--red-500);border-color:var(--red-100)">✕ Xóa lọc</button>
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
        <button @click="store.fetchAll()" class="btn btn-outline btn-sm" style="margin-top:12px">🔄 Thử lại</button>
      </div>

      <div v-else-if="filtered.length === 0" class="empty-table">
        <div class="icon-lg">🏷️</div>
        <p>Chưa có mã giảm giá nào</p>
        <router-link to="/admin/coupons/create" class="btn btn-primary btn-sm">+ Thêm mã đầu tiên</router-link>
      </div>

      <table v-else class="table-auto">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Giảm giá</th>
            <th>Đơn tối thiểu</th>
            <th>Đã dùng</th>
            <th>Mô tả</th>
            <th>Ngày tạo</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.coupon_code">
            <td>
              <span style="font-family:monospace;font-weight:700;font-size:13px;color:var(--brand);background:var(--brand-50,#eff6ff);padding:3px 8px;border-radius:5px;letter-spacing:0.5px">
                {{ c.coupon_code }}
              </span>
            </td>
            <td>
              <span :class="String(c.discount).includes('%') ? 'badge badge-green' : 'badge badge-blue'">
                {{ c.discount }}
              </span>
            </td>
            <td style="font-size:13px;color:var(--gray-500)">
              {{ c.minordervalue > 0 ? fmtMoney(c.minordervalue) : '—' }}
            </td>
            <td style="font-size:13px;color:var(--gray-600)">
              {{ c.usages_count ?? 0 }} lượt
            </td>
            <td style="font-size:13px;color:var(--gray-600);max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              {{ c.description }}
            </td>
            <td style="font-size:12px;color:var(--gray-400)">
              {{ fmtDate(c.created_at) }}
            </td>
            <td>
              <div class="row-actions">
                <button @click="router.push('/admin/coupons/' + c.coupon_code + '/edit')" class="btn-icon edit" title="Sửa">
                  <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button @click="confirmDel(c)" class="btn-icon delete" title="Xóa">
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
    </div>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="delTarget" class="modal-overlay" @click.self="delTarget = null">
        <div class="modal-box">
          <div class="modal-icon">🗑️</div>
          <div class="modal-body">
            <h3>Xóa mã giảm giá?</h3>
            <p>Bạn sắp xóa mã <strong>{{ delTarget.coupon_code }}</strong>. Không thể hoàn tác.</p>
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
import { useRouter } from 'vue-router'
import { useCouponStore } from '@/admin/stores/couponStore'
import type { Coupon } from '@/admin/stores/couponStore'

const store  = useCouponStore()
const router = useRouter()
const search = ref('')

const filtered = computed(() => {
  if (!search.value) return store.coupons
  const q = search.value.toLowerCase()
  return store.coupons.filter(c =>
    c.coupon_code.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q)
  )
})

const delTarget = ref<Coupon | null>(null)
const deleting  = ref(false)
const toast     = ref<{ msg: string; type: string } | null>(null)

const fmtMoney = (v?: number | null) =>
  v ? v.toLocaleString('vi-VN') + '₫' : '0₫'
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('vi-VN') : '—'

let timer: ReturnType<typeof setTimeout>
function debouncedFilter() { clearTimeout(timer); timer = setTimeout(() => {}, 200) }

function showToast(msg: string, type: string) {
  toast.value = { msg, type }
  setTimeout(() => (toast.value = null), 3000)
}

function confirmDel(c: Coupon) { delTarget.value = c }

async function doDel() {
  if (!delTarget.value) return
  deleting.value = true
  try {
    await store.remove(delTarget.value.coupon_code)
    showToast('Xóa mã giảm giá thành công!', 'success')
  } catch (e: any) {
    showToast(e.userMessage || 'Xóa thất bại', 'error')
  } finally {
    deleting.value = false
    delTarget.value = null
  }
}

onMounted(() => store.fetchAll())
</script>