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
        <h2>Gán biến thể vào sản phẩm</h2>
        <p>Admin / Biến thể / Chọn biến thể cho sản phẩm</p>
      </div>
    </div>

    <div class="variant-layout">
      <!-- Chọn sản phẩm & biến thể -->
      <div class="form-col">
        <div class="section-card">
          <h3>Chọn sản phẩm</h3>

          <div class="field">
            <label class="label">Tìm sản phẩm</label>
            <input
              v-model="productSearch"
              class="input"
              placeholder="Nhập tên sản phẩm..."
              @input="filterProducts"
            />
          </div>

          <div v-if="loadingProducts" class="loading-state">
            <svg class="animate-spin" style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
            </svg>
            Đang tải...
          </div>

          <div class="product-list">
            <div
              v-for="p in filteredProducts"
              :key="p.id"
              @click="selectProduct(p)"
              :class="['product-row', selectedProduct?.id === p.id && 'selected']"
            >
              <div class="product-row-info">
                <span class="product-id">#{{ p.id }}</span>
                <span class="product-name">{{ p.name }}</span>
                <span v-if="p.categories_id" class="badge badge-gray">cat:{{ p.categories_id }}</span>
              </div>
              <svg v-if="selectedProduct?.id === p.id" style="width:16px;height:16px;color:var(--brand);flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div v-if="filteredProducts.length === 0 && !loadingProducts" class="empty-table" style="padding:16px">
              <p style="font-size:13px;color:var(--gray-400)">Không tìm thấy sản phẩm</p>
            </div>
          </div>
        </div>

        <!-- Biến thể hiện có -->
        <div v-if="selectedProduct" class="section-card">
          <h3>Biến thể hiện có</h3>
          <div v-if="loadingVariants" class="loading-state">
            <svg class="animate-spin" style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
            </svg>
            Đang tải biến thể...
          </div>
          <div v-else-if="currentVariants.length === 0" class="empty-table" style="padding:16px">
            <p style="font-size:13px;color:var(--gray-400)">Sản phẩm này chưa có biến thể nào.</p>
          </div>
          <div v-else class="current-variants">
            <div v-for="v in currentVariants" :key="v.id" class="current-variant-row">
              <div class="variant-title-row">
                <span class="variant-title">{{ v.variant_name }}</span>
                <button @click="removeVariantFromProduct(v)" class="btn-icon delete" title="Gỡ biến thể">
                  <svg style="width:12px;height:12px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  </svg>
                </button>
              </div>
              <div class="option-chips" style="margin-top:6px">
                <span v-for="opt in v.options" :key="opt.id" class="option-chip">
                  <span class="chip-int">#{{ opt.option_values }}</span>
                  {{ opt.option_label || '' }}
                </span>
                <span v-if="!v.options || v.options.length === 0" style="font-size:12px;color:var(--gray-400)">
                  (chưa có giá trị)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
import { ref, onMounted } from 'vue'
import { productApi, variantApi } from '@/api'

const allProducts      = ref<any[]>([])
const filteredProducts = ref<any[]>([])
const productSearch    = ref('')
const selectedProduct  = ref<any>(null)
const loadingProducts  = ref(false)
const loadingVariants  = ref(false)
const currentVariants  = ref<any[]>([])
const toast            = ref<{ msg: string; type: string } | null>(null)

function showToast(msg: string, type: string) {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3500)
}

function filterProducts() {
  const q = productSearch.value.toLowerCase().trim()
  filteredProducts.value = q
    ? allProducts.value.filter(p => p.name.toLowerCase().includes(q) || String(p.id).includes(q))
    : allProducts.value
}

async function selectProduct(p: any) {
  selectedProduct.value = p
  loadingVariants.value = true
  try {
    const res = await variantApi.getVariants(p.id)
    currentVariants.value = res.data.data ?? res.data
  } catch {
    currentVariants.value = []
  } finally {
    loadingVariants.value = false
  }
}

async function removeVariantFromProduct(v: any) {
  if (!confirm(`Xóa biến thể "${v.variant_name}"? Thao tác này không thể hoàn tác.`)) return
  try {
    await variantApi.deleteVariant(v.id)
    currentVariants.value = currentVariants.value.filter(x => x.id !== v.id)
    showToast('Đã xóa biến thể', 'success')
  } catch (e: any) {
    showToast(e.userMessage || 'Xóa thất bại', 'error')
  }
}

onMounted(async () => {
  loadingProducts.value = true
  try {
    const res = await productApi.getAll()
    allProducts.value = res.data.data ?? res.data
    filteredProducts.value = allProducts.value
  } catch {} finally { loadingProducts.value = false }
})
</script>

<style scoped>
.variant-layout { display: grid; grid-template-columns: 1fr; gap: 20px; max-width: 600px; }

.product-list { max-height: 320px; overflow-y: auto; border: 1px solid var(--gray-200); border-radius: 8px; margin-top: 8px; }
.product-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; cursor: pointer; border-bottom: 1px solid var(--gray-100); transition: background 0.15s; }
.product-row:last-child { border-bottom: none; }
.product-row:hover { background: var(--gray-50); }
.product-row.selected { background: #edf3ff; }
.product-row-info { display: flex; align-items: center; gap: 8px; }
.product-id { font-family: monospace; font-size: 11px; color: var(--gray-400); background: var(--gray-100); padding: 2px 6px; border-radius: 4px; }
.product-name { font-size: 13px; font-weight: 500; color: var(--gray-700); }

.current-variants { display: flex; flex-direction: column; gap: 10px; }
.current-variant-row { background: var(--gray-50); border-radius: 8px; padding: 10px 12px; }
.variant-title-row { display: flex; align-items: center; justify-content: space-between; }
.variant-title { font-size: 13px; font-weight: 600; color: var(--gray-700); }
.option-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.option-chip { display: flex; align-items: center; gap: 4px; background: white; border: 1px solid var(--gray-200); border-radius: 6px; padding: 3px 8px; font-size: 12px; }
.chip-int { font-family: monospace; font-size: 10px; color: var(--brand); font-weight: 700; background: #edf3ff; border-radius: 3px; padding: 1px 4px; }

.loading-state { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gray-500); padding: 12px 0; }
</style>