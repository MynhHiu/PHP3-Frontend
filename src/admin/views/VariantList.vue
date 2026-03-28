<template>
  <div class="list-page">
    <!-- Top bar -->
    <div class="list-header">
      <div class="list-header-left">
        <h2>Quản lý biến thể</h2>
        <p>Tổng: <strong>{{ totalVariants }}</strong> biến thể trên <strong>{{ allProducts.length }}</strong> sản phẩm</p>
      </div>
      <div class="list-header-right">
        <router-link to="/admin/variants/assign" class="btn btn-outline">
          <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V7"/>
            <polyline points="14 3 14 7 18 7"/>
            <line x1="9" y1="13" x2="15" y2="13"/>
          </svg>
          Gán biến thể cho sản phẩm
        </router-link>
        <router-link to="/admin/variants/create" class="btn btn-primary">
          <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Tạo biến thể mới
        </router-link>
      </div>
    </div>

    <!-- Filter -->
    <div class="filter-bar">
      <input v-model="search" class="input" placeholder="Tìm theo tên biến thể..." style="max-width:300px" />
      <select v-model="filterProductId" class="input" style="max-width:220px">
        <option value="">Tất cả sản phẩm</option>
        <option v-for="p in allProducts" :key="p.id" :value="p.id">[#{{ p.id }}] {{ p.name }}</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state" style="padding:48px;justify-content:center">
      <svg class="animate-spin" style="width:20px;height:20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
      </svg>
      Đang tải...
    </div>

    <!-- Variant table grouped by product -->
    <div v-else>
      <div v-if="filteredGroups.length === 0" class="empty-table">
        <div style="font-size:32px;margin-bottom:8px"></div>
        <p>Chưa có biến thể nào</p>
        <router-link to="/admin/variants/create" class="btn btn-primary" style="margin-top:12px">
          Tạo biến thể đầu tiên
        </router-link>
      </div>

      <div v-else class="variant-groups">
        <div
          v-for="group in filteredGroups"
          :key="group.productId"
          class="variant-group-card"
        >
          <!-- Product header -->
          <div class="group-header">
            <div class="group-product-info">
              <span class="group-product-id">#{{ group.productId }}</span>
              <span class="group-product-name">{{ group.productName }}</span>
            </div>
            <div class="group-actions">
              <router-link
                :to="`/admin/products/${group.productId}/variants`"
                class="btn btn-outline btn-sm"
              >
                Quản lý SKU
              </router-link>
            </div>
          </div>

          <!-- Variant rows -->
          <table class="table-auto" style="margin-top:0;border-top:1px solid var(--gray-100)">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên biến thể (variant_name)</th>
                <th>Giá trị (option_values)</th>
                <th>Ngày tạo</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in group.variants" :key="v.id">
                <td style="font-family:monospace;color:var(--gray-400);font-size:12px">{{ v.id }}</td>
                <td>
                  <span class="badge badge-green">{{ v.variant_name }}</span>
                </td>
                <td>
                  <div class="option-chips">
                    <span v-for="opt in v.options" :key="opt.id" class="option-chip">
                      <!-- ✅ Ưu tiên hiển thị option_label, fallback sang option_values -->
                      {{ opt.option_label || opt.option_values }}
                    </span>
                    <span v-if="!v.options || v.options.length === 0" style="font-size:12px;color:var(--gray-400)">—</span>
                  </div>
                </td>
                <td style="font-size:12px;color:var(--gray-500)">
                  {{ v.created_at ? new Date(v.created_at).toLocaleDateString('vi-VN') : '—' }}
                </td>
                <td>
                  <div class="row-actions">
                    <router-link
                      :to="`/admin/variants/${v.id}/edit`"
                      class="btn-icon edit"
                    >
                      <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </router-link>
                    <button @click="confirmDelete(v)" class="btn-icon delete">
                      <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete Modal -->
    <Teleport to="body">
      <div v-if="delItem" class="modal-overlay" @click.self="delItem = null">
        <div class="modal-box">
          <div class="modal-icon">⚠️</div>
          <div class="modal-body">
            <h3>Xóa biến thể?</h3>
            <p>Xóa <strong>{{ delItem.variant_name }}</strong> và toàn bộ giá trị của nó. Thao tác không thể hoàn tác.</p>
          </div>
          <div class="modal-actions">
            <button @click="delItem = null" class="btn btn-outline">Hủy</button>
            <button @click="doDelete" :disabled="deleting" class="btn btn-danger">
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
import { productApi, variantApi } from '@/api'

const loading   = ref(false)
const deleting  = ref(false)
const search    = ref('')
const filterProductId = ref<number | ''>('')
const allProducts = ref<any[]>([])
const allGroups   = ref<Array<{ productId: number; productName: string; variants: any[] }>>([])
const delItem   = ref<any | null>(null)
const toast     = ref<{ msg: string; type: string } | null>(null)

const totalVariants = computed(() => allGroups.value.reduce((sum, g) => sum + g.variants.length, 0))

const filteredGroups = computed(() => {
  let groups = allGroups.value
  if (filterProductId.value !== '') {
    groups = groups.filter(g => g.productId === filterProductId.value)
  }
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    groups = groups.map(g => ({
      ...g,
      variants: g.variants.filter((v: any) => v.variant_name.toLowerCase().includes(q))
    })).filter(g => g.variants.length > 0)
  }
  return groups
})

function showToast(msg: string, type: string) {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3500)
}

function confirmDelete(v: any) { delItem.value = v }

async function doDelete() {
  if (!delItem.value) return
  deleting.value = true
  try {
    await variantApi.deleteVariant(delItem.value.id)
    // Remove from groups
    for (const g of allGroups.value) {
      g.variants = g.variants.filter((v: any) => v.id !== delItem.value!.id)
    }
    delItem.value = null
    showToast('Đã xóa biến thể', 'success')
  } catch (e: any) {
    showToast(e.userMessage || 'Xóa thất bại', 'error')
  } finally { deleting.value = false }
}

onMounted(async () => {
  loading.value = true
  try {
    const pRes = await productApi.getAll()
    allProducts.value = pRes.data.data ?? pRes.data

    // Load variants cho từng sản phẩm
    const groups: typeof allGroups.value = []
    for (const p of allProducts.value) {
      try {
        const vRes = await variantApi.getVariants(p.id)
        const variants = vRes.data.data ?? vRes.data
        if (variants.length > 0) {
          groups.push({ productId: p.id, productName: p.name, variants })
        }
      } catch {}
    }
    allGroups.value = groups
  } catch {} finally { loading.value = false }
})
</script>

<style scoped>
.list-page { padding: 0; }
.list-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.list-header-left h2 { font-size: 20px; font-weight: 700; color: var(--gray-800); margin: 0 0 4px; }
.list-header-left p { font-size: 13px; color: var(--gray-500); margin: 0; }
.list-header-right { display: flex; gap: 10px; }
.filter-bar { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }

.variant-groups { display: flex; flex-direction: column; gap: 16px; }
.variant-group-card { background: white; border: 1px solid var(--gray-200); border-radius: 12px; overflow: hidden; }
.group-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--gray-50); border-bottom: 1px solid var(--gray-200); }
.group-product-info { display: flex; align-items: center; gap: 8px; }
.group-product-id { font-family: monospace; font-size: 11px; color: var(--gray-400); background: var(--gray-200); padding: 2px 6px; border-radius: 4px; }
.group-product-name { font-size: 14px; font-weight: 600; color: var(--gray-700); }
.group-actions { display: flex; gap: 8px; }

.option-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.option-chip {
  display: inline-flex;
  align-items: center;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: 20px;
  padding: 2px 10px;
  font-size: 12px;
  color: var(--gray-700);
  font-weight: 500;
}

.loading-state { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gray-500); }
.empty-table { text-align: center; padding: 48px; color: var(--gray-500); font-size: 14px; }
</style>