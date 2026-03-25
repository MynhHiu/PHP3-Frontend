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
      <!-- LEFT: Chọn sản phẩm & biến thể -->
      <div class="form-col">
        <div class="section-card">
          <h3>Chọn sản phẩm</h3>

          <!-- Tìm kiếm sản phẩm -->
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

          <!-- Danh sách sản phẩm -->
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

        <!-- Biến thể hiện có của sản phẩm -->
        <div v-if="selectedProduct" class="section-card">
          <h3>
            Biến thể hiện có
            <!-- <span class="sub">— product_id = {{ selectedProduct.id }}</span> -->
          </h3>
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

      <!-- RIGHT: Thêm biến thể -->
      <div class="form-col">
        <div class="section-card">
          <h3>Thêm biến thể vào sản phẩm</h3>

          <div v-if="!selectedProduct" class="empty-table" style="padding:24px">
            
            <p style="font-size:13px;color:var(--gray-400)">Chọn sản phẩm trước</p>
          </div>

          <div v-else>
            <!-- Tạo biến thể mới trực tiếp -->
            <div class="subsection">
              <h4>Tạo biến thể mới cho sản phẩm này</h4>
              <div class="form-inner">
                <!-- variant_name VARCHAR(255) -->
                <div class="field">
                  <label class="label">
                    Tên biến thể <span class="req"></span>
                    <!-- <span class="hint">— product_variants.variant_name</span> -->
                  </label>
                  <input
                    v-model="newVariant.variant_name"
                    class="input"
                    placeholder="VD: Màu sắc, Kích cỡ..."
                    @keyup.enter="createAndAssign"
                  />
                </div>

                <!-- Giá trị tùy chọn -->
                <div class="field">
                  <label class="label">
                    Giá trị
                    <!-- <span class="hint">— variant_options.option_values</span> -->
                  </label>
                  <div class="options-input-list">
                    <div
                      v-for="(opt, i) in newVariantOptions"
                      :key="i"
                      class="option-input-row"
                    >
                      <input
                        v-model.number="opt.option_values"
                        type="number"
                        class="input input-sm font-mono"
                        placeholder="Số (INT)"
                        min="0"
                        style="width:80px"
                      />
                      <input
                        v-model="opt.option_label"
                        class="input input-sm"
                        placeholder="Tên hiển thị"
                      />
                      <button
                        v-if="newVariantOptions.length > 1"
                        type="button"
                        @click="newVariantOptions.splice(i, 1)"
                        class="btn-icon delete"
                      >×</button>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="newVariantOptions.push({ option_values: 0, option_label: '' })"
                    class="btn btn-outline btn-sm"
                    style="margin-top:6px"
                  >+ Thêm giá trị</button>
                </div>

                <button
                  @click="createAndAssign"
                  :disabled="!newVariant.variant_name.trim() || saving"
                  class="btn btn-primary"
                  style="width:100%;justify-content:center"
                >
                  <svg v-if="saving" class="animate-spin" style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                  </svg>
                  {{ saving ? 'Đang tạo...' : '+ Tạo & gán biến thể' }}
                </button>
              </div>
            </div>

            <!-- <div class="divider"><span>hoặc</span></div> -->

            <!-- Gán biến thể đã có (từ sản phẩm khác) -->
            <div class="subsection">
              <!-- <h4>Gán SKU cho biến thể</h4>
              <p class="section-desc">
                Tạo mã SKU gắn với biến thể đã có của sản phẩm này.
                Bảng: <code>product_skus</code>
              </p> -->

              <div v-if="currentVariants.length === 0" style="color:var(--gray-400);font-size:13px">
                <!-- Tạo biến thể trước để gán SKU. -->
              </div>
              <div v-else class="sku-quick-form">
                <!-- sku_code VARCHAR(255) -->
                <div class="form-row-2">
                  <div class="field">
                    <label class="label">Mã SKU <span class="req">*</span></label>
                    <input v-model="newSku.sku_code" class="input font-mono" placeholder="SP001-DO-L" />
                  </div>
                  <div class="field">
                    <label class="label">
                      Giá <span class="req">*</span>
                      <span class="hint">DECIMAL(10,2)</span>
                    </label>
                    <div class="price-input">
                      <input v-model.number="newSku.price" type="number" min="0" step="1000" class="input" />
                      <span class="price-suffix">₫</span>
                    </div>
                  </div>
                </div>
                <div class="form-row-2">
                  <div class="field">
                    <label class="label">Số lượng (quantity)</label>
                    <input v-model.number="newSku.quantity" type="number" min="0" class="input" />
                  </div>
                  <div class="field">
                    <label class="label">Trạng thái (status)</label>
                    <select v-model="newSku.status" class="input">
                      <option value="active">Đang bán</option>
                      <option value="inactive">Ngừng bán</option>
                    </select>
                  </div>
                </div>

                <!-- Chọn biến thể để gán combination_options -->
                <div class="field">
                  <label class="label">
                    Gán cho biến thể
                    <span class="hint">— product_combination_options.options_id</span>
                  </label>
                  <div class="variant-checks">
                    <label
                      v-for="v in currentVariants"
                      :key="v.id"
                      class="variant-check-row"
                    >
                      <div class="variant-check-name">{{ v.variant_name }}</div>
                      <select v-model="skuOptionMap[v.id]" class="input input-sm">
                        <option value="">-- Chọn giá trị --</option>
                        <option
                          v-for="opt in v.options"
                          :key="opt.id"
                          :value="opt.id"
                        >
                          #{{ opt.option_values }}{{ opt.option_label ? ' — ' + opt.option_label : '' }}
                        </option>
                      </select>
                    </label>
                  </div>
                </div>

                <button
                  @click="saveSku"
                  :disabled="!newSku.sku_code || !newSku.price || savingSku"
                  class="btn btn-primary"
                  style="width:100%;justify-content:center"
                >
                  {{ savingSku ? 'Đang lưu...' : '+ Thêm SKU' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SKU table -->
        <div v-if="selectedProduct && skus.length > 0" class="section-card">
          <h3>SKU của sản phẩm</h3>
          <div style="overflow-x:auto">
            <table class="table-auto">
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Giá</th>
                  <th>SL</th>
                  <th>Status</th>
                  <th class="text-right">Xóa</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in skus" :key="s.sku_code">
                  <td style="font-family:monospace;font-size:12px;font-weight:600;color:var(--brand)">{{ s.sku_code }}</td>
                  <td class="price-main">{{ fmt(s.price) }}</td>
                  <td>{{ s.quantity }}</td>
                  <td>
                    <span :class="s.status === 'active' ? 'badge badge-green' : 'badge badge-gray'">
                      {{ s.status === 'active' ? 'Bán' : 'Ẩn' }}
                    </span>
                  </td>
                  <td>
                    <button @click="deleteSku(s.sku_code)" class="btn-icon delete">
                      <svg style="width:12px;height:12px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { productApi, variantApi } from '@/api'
import type { ProductSku } from '@/admin/stores/variantStore'

// ── State ──────────────────────────────────────────────────────────────────
const allProducts      = ref<any[]>([])
const filteredProducts = ref<any[]>([])
const productSearch    = ref('')
const selectedProduct  = ref<any>(null)
const loadingProducts  = ref(false)
const loadingVariants  = ref(false)
const currentVariants  = ref<any[]>([])
const skus             = ref<any[]>([])
const saving           = ref(false)
const savingSku        = ref(false)
const toast            = ref<{ msg: string; type: string } | null>(null)

// Map variantId → selected optionId (cho combination_options)
const skuOptionMap = reactive<Record<number, number | string>>({})

// Form tạo biến thể mới
const newVariant = reactive({ variant_name: '' })
const newVariantOptions = reactive<Array<{ option_values: number; option_label: string }>>([
  { option_values: 0, option_label: '' }
])

// Form SKU — khớp product_skus
const newSku = reactive({
  sku_code: '',        // VARCHAR(255)
  price: 0,            // DECIMAL(10,2)
  quantity: 0,         // INT(11)
  status: 'active',    // VARCHAR(50)
})

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (v: number) => Number(v).toLocaleString('vi-VN') + '₫'

function showToast(msg: string, type: string) {
  toast.value = { msg, type }
  setTimeout(() => toast.value = null, 3500)
}

// ── Products ───────────────────────────────────────────────────────────────
function filterProducts() {
  const q = productSearch.value.toLowerCase().trim()
  filteredProducts.value = q
    ? allProducts.value.filter(p => p.name.toLowerCase().includes(q) || String(p.id).includes(q))
    : allProducts.value
}

async function selectProduct(p: any) {
  selectedProduct.value = p
  loadingVariants.value = true
  // Reset form
  Object.assign(newSku, { sku_code: '', price: 0, quantity: 0, status: 'active' })
  Object.keys(skuOptionMap).forEach(k => delete skuOptionMap[Number(k)])

  try {
    const [varRes, skuRes] = await Promise.all([
      variantApi.getVariants(p.id),
      variantApi.getSkus(p.id),
    ])
    currentVariants.value = varRes.data.data ?? varRes.data
    skus.value            = skuRes.data.data ?? skuRes.data
  } catch {
    currentVariants.value = []; skus.value = []
  } finally { loadingVariants.value = false }
}

// ── Tạo biến thể mới và gán ──────────────────────────────────────────────
async function createAndAssign() {
  if (!newVariant.variant_name.trim() || !selectedProduct.value) return
  saving.value = true
  try {
    // 1. Tạo variant — POST /admin/products/:id/variants
    // Body: { variant_name, product_id }
    const res = await variantApi.createVariant(selectedProduct.value.id, {
      variant_name: newVariant.variant_name.trim(),
      product_id: selectedProduct.value.id,
    })
    const created = res.data.data ?? res.data

    // 2. Tạo các option — POST /admin/variants/:id/options
    // Body: { product_variant_id, option_values: INT }
    const validOpts = newVariantOptions.filter(o => !isNaN(o.option_values))
    const createdOptions: any[] = []
    for (const opt of validOpts) {
      const oRes = await variantApi.createOption(created.id, {
        product_variant_id: created.id,
        option_values: Number(opt.option_values),  // ← INT(11)
      })
      createdOptions.push({ ...(oRes.data.data ?? oRes.data), option_label: opt.option_label })
    }

    currentVariants.value.push({ ...created, options: createdOptions })
    newVariant.variant_name = ''
    newVariantOptions.splice(0, newVariantOptions.length, { option_values: 0, option_label: '' })
    showToast('Tạo biến thể thành công!', 'success')
  } catch (e: any) {
    showToast(e.userMessage || 'Tạo thất bại', 'error')
  } finally { saving.value = false }
}

// ── Gỡ biến thể khỏi sản phẩm ────────────────────────────────────────────
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

// ── Thêm SKU ──────────────────────────────────────────────────────────────
async function saveSku() {
  if (!newSku.sku_code || !newSku.price || !selectedProduct.value) return
  savingSku.value = true
  try {
    // POST /admin/products/:id/skus
    // Body: { sku_code, product_id, price, quantity, status }
    const res = await variantApi.createSku(selectedProduct.value.id, {
      sku_code: newSku.sku_code,
      product_id: selectedProduct.value.id,
      price: newSku.price,
      quantity: newSku.quantity,
      status: newSku.status,
    })
    const createdSku = res.data.data ?? res.data
    skus.value.push(createdSku)

    // Gán combination options
    // POST /admin/combination-options
    // Body: { options_id: INT, sku_code: VARCHAR }
    for (const [varId, optId] of Object.entries(skuOptionMap)) {
      if (optId) {
        await variantApi.createCombinationOption({
          options_id: Number(optId),
          sku_code: newSku.sku_code,
        })
      }
    }

    Object.assign(newSku, { sku_code: '', price: 0, quantity: 0, status: 'active' })
    Object.keys(skuOptionMap).forEach(k => delete skuOptionMap[Number(k)])
    showToast('Thêm SKU thành công!', 'success')
  } catch (e: any) {
    showToast(e.userMessage || 'Thêm SKU thất bại', 'error')
  } finally { savingSku.value = false }
}

async function deleteSku(skuCode: string) {
  if (!confirm(`Xóa SKU "${skuCode}"?`)) return
  try {
    await variantApi.deleteSku(skuCode)
    skus.value = skus.value.filter(s => s.sku_code !== skuCode)
    showToast('Đã xóa SKU', 'success')
  } catch (e: any) {
    showToast(e.userMessage || 'Xóa thất bại', 'error')
  }
}

// ── Mounted ────────────────────────────────────────────────────────────────
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
.variant-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 768px) { .variant-layout { grid-template-columns: 1fr; } }

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

.subsection { margin-bottom: 20px; }
.subsection h4 { font-size: 13px; font-weight: 600; color: var(--gray-700); margin-bottom: 10px; }
.section-desc { font-size: 12px; color: var(--gray-500); margin-bottom: 10px; }

.divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--gray-200); }
.divider span { font-size: 12px; color: var(--gray-400); font-weight: 500; }

.options-input-list { display: flex; flex-direction: column; gap: 6px; }
.option-input-row { display: flex; align-items: center; gap: 8px; }

.sku-quick-form { display: flex; flex-direction: column; gap: 12px; }
.variant-checks { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.variant-check-row { display: flex; align-items: center; gap: 10px; }
.variant-check-name { font-size: 12px; font-weight: 600; color: var(--gray-600); min-width: 90px; }

.hint { font-size: 10px; font-weight: 400; color: var(--gray-400); font-family: monospace; }
.icon-lg { text-align: center; margin-bottom: 8px; }
.loading-state { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--gray-500); padding: 12px 0; }
</style>