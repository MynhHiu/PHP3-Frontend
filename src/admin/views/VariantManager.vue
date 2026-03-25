<template>
  <div class="form-page">
    <!-- Header -->
    <div class="form-back-header">
      <router-link :to="`/admin/products/${productId}/edit`" class="btn-back">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </router-link>
      <div class="fh-info">
        <h2>Quản lý biến thể — {{ productName }}</h2>
        <p>Admin / Sản phẩm / Biến thể & SKU</p>
      </div>
    </div>

    <div v-if="store.loading" class="loading-state">
      <svg class="animate-spin" style="width:20px;height:20px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
      </svg>
      Đang tải...
    </div>

    <div v-else class="variant-layout">
      <!-- LEFT: Tùy chọn biến thể -->
      <div class="form-col">
        <div class="section-card">
          <h3>Tùy chọn biến thể
            <span class="sub">(VD: Màu sắc, Kích cỡ)</span>
          </h3>

          <!-- Add variant -->
          <div class="add-row">
            <input v-model="newVariantName" class="input" placeholder="Tên tùy chọn (VD: Màu sắc)" @keyup.enter="addVariant" />
            <button @click="addVariant" :disabled="!newVariantName.trim() || addingVariant" class="btn btn-primary btn-sm">
              <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
              Thêm
            </button>
          </div>

          <!-- Variant list -->
          <div v-if="store.variants.length === 0" class="empty-table" style="padding:24px">
            <div class="icon-lg" style="font-size:28px">🎨</div>
            <p style="font-size:13px">Chưa có tùy chọn nào</p>
          </div>

          <div v-for="v in store.variants" :key="v.id" class="variant-block">
            <!-- Variant header -->
            <div class="variant-header">
              <div v-if="editingVariantId === v.id" class="variant-edit-row">
                <input v-model="editingVariantName" class="input input-sm" @keyup.enter="saveVariantName(v)" />
                <button @click="saveVariantName(v)" class="btn btn-primary btn-sm">✓</button>
                <button @click="editingVariantId = null" class="btn btn-outline btn-sm">✕</button>
              </div>
              <div v-else class="variant-title-row">
                <span class="variant-title">{{ v.variant_name }}</span>
                <div class="row-actions">
                  <button @click="startEditVariant(v)" class="btn-icon edit">
                    <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button @click="confirmDeleteVariant(v)" class="btn-icon delete">
                    <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Options -->
            <div class="option-chips">
              <span v-for="opt in v.options" :key="opt.id" class="option-chip">
                {{ opt.option_values }}
                <button @click="deleteOption(v.id, opt.id)" class="chip-del">×</button>
              </span>
              <div class="add-option-row">
                <input :ref="el => optInputs[v.id] = el as HTMLInputElement"
                  v-model="newOptions[v.id]"
                  class="input input-xs" placeholder="Thêm giá trị..."
                  @keyup.enter="addOption(v.id)" />
                <button @click="addOption(v.id)" class="btn btn-outline btn-sm">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: SKU -->
      <div class="form-col">
        <div class="section-card">
          <h3>SKU sản phẩm
            <span class="sub">(Mã & Giá từng biến thể)</span>
          </h3>

          <div class="sku-add-form">
            <div class="form-row-2">
              <div class="field">
                <label class="label">Mã SKU <span class="req">*</span></label>
                <input v-model="newSku.sku_code" class="input font-mono" placeholder="SP001-DO-L" />
              </div>
              <div class="field">
                <label class="label">Giá bán <span class="req">*</span></label>
                <div class="price-input">
                  <input v-model.number="newSku.price" type="number" min="0" step="1000" class="input" />
                  <span class="price-suffix">₫</span>
                </div>
              </div>
            </div>
            <div class="form-row-2">
              <div class="field">
                <label class="label">Số lượng</label>
                <input v-model.number="newSku.quantity" type="number" min="0" class="input" />
              </div>
              <div class="field">
                <label class="label">Tổ hợp biến thể</label>
                <input v-model="newSku.combination" class="input" placeholder="VD: Đỏ / L" />
              </div>
            </div>
            <div class="field">
              <label class="label">Trạng thái</label>
              <select v-model="newSku.status" class="input">
                <option value="active">Đang bán</option>
                <option value="inactive">Ngừng bán</option>
              </select>
            </div>
            <button @click="addSku" :disabled="!newSku.sku_code || !newSku.price" class="btn btn-primary" style="width:100%;justify-content:center">
              {{ editingSkuCode ? 'Cập nhật SKU' : '+ Thêm SKU' }}
            </button>
          </div>

          <!-- SKU table -->
          <div v-if="store.skus.length === 0" class="empty-table" style="padding:20px">
            <p style="font-size:13px;color:var(--gray-400)">Chưa có SKU nào</p>
          </div>
          <div v-else style="overflow-x:auto;margin-top:12px">
            <table class="table-auto">
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Tổ hợp</th>
                  <th>Giá</th>
                  <th>SL</th>
                  <th>Trạng thái</th>
                  <th class="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in store.skus" :key="s.sku_code" :class="editingSkuCode === s.sku_code ? 'row-editing' : ''">
                  <td style="font-family:monospace;font-size:12px;font-weight:600;color:var(--brand)">{{ s.sku_code }}</td>
                  <td style="font-size:12px;color:var(--gray-600)">{{ s.combination || '—' }}</td>
                  <td class="price-main">{{ fmt(s.price) }}</td>
                  <td :class="s.quantity === 0 ? 'stock-out' : s.quantity < 5 ? 'stock-low' : 'stock-ok'">{{ s.quantity }}</td>
                  <td><span :class="s.status === 'active' ? 'badge badge-green' : 'badge badge-gray'">{{ s.status === 'active' ? 'Bán' : 'Ẩn' }}</span></td>
                  <td>
                    <div class="row-actions">
                      <button @click="startEditSku(s)" class="btn-icon edit">
                        <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button @click="deleteSku(s.sku_code)" class="btn-icon delete">
                        <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
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
    </div>

    <!-- Delete variant modal -->
    <Teleport to="body">
      <div v-if="delVariant" class="modal-overlay" @click.self="delVariant = null">
        <div class="modal-box">
          <div class="modal-icon">⚠️</div>
          <div class="modal-body">
            <h3>Xóa tùy chọn?</h3>
            <p>Xóa <strong>{{ delVariant.variant_name }}</strong> và tất cả giá trị của nó.</p>
          </div>
          <div class="modal-actions">
            <button @click="delVariant = null" class="btn btn-outline">Hủy</button>
            <button @click="doDeleteVariant" class="btn btn-danger">Xóa</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useVariantStore } from '@/admin/stores/variantStore'
import { useProductStore } from '@/admin/stores/productStore'
import type { ProductVariant, ProductSku } from '@/admin/stores/variantStore'

const route     = useRoute()
const store     = useVariantStore()
const pStore    = useProductStore()
const productId = Number(route.params.id)

const productName       = ref('')
const newVariantName    = ref('')
const addingVariant     = ref(false)
const editingVariantId  = ref<number | null>(null)
const editingVariantName = ref('')
const newOptions        = reactive<Record<number, string>>({})
const optInputs         = reactive<Record<number, HTMLInputElement>>({})
const delVariant        = ref<ProductVariant | null>(null)
const editingSkuCode    = ref<string | null>(null)

const newSku = reactive<Partial<ProductSku> & { sku_code: string; combination: string }>({
  sku_code: '', price: 0, quantity: 0, status: 'active', combination: ''
})

const fmt = (v: number) => Number(v).toLocaleString('vi-VN') + '₫'

async function addVariant() {
  if (!newVariantName.value.trim()) return
  addingVariant.value = true
  try { await store.createVariant(productId, newVariantName.value.trim()); newVariantName.value = '' }
  finally { addingVariant.value = false }
}

function startEditVariant(v: ProductVariant) {
  editingVariantId.value = v.id; editingVariantName.value = v.variant_name
}
async function saveVariantName(v: ProductVariant) {
  await store.updateVariant(v.id, editingVariantName.value)
  editingVariantId.value = null
}

function confirmDeleteVariant(v: ProductVariant) { delVariant.value = v }
async function doDeleteVariant() {
  if (!delVariant.value) return
  await store.deleteVariant(delVariant.value.id)
  delVariant.value = null
}

async function addOption(variantId: number) {
  const val = (newOptions[variantId] || '').trim()
  if (!val) return
  await store.createOption(variantId, val)
  newOptions[variantId] = ''
}

async function deleteOption(variantId: number, optionId: number) {
  await store.deleteOption(variantId, optionId)
}

async function addSku() {
  if (!newSku.sku_code || !newSku.price) return
  await store.saveSku(productId, { ...newSku })
  Object.assign(newSku, { sku_code: '', price: 0, quantity: 0, status: 'active', combination: '' })
  editingSkuCode.value = null
}

function startEditSku(s: ProductSku) {
  editingSkuCode.value = s.sku_code
  Object.assign(newSku, { ...s, combination: (s as any).combination || '' })
}

async function deleteSku(code: string) {
  await store.deleteSku(code)
}

onMounted(async () => {
  await store.fetchVariants(productId)
  await store.fetchSkus(productId)
  const p = pStore.getById(productId)
  if (p) productName.value = p.name
  else { await pStore.fetchAll(); const p2 = pStore.getById(productId); if (p2) productName.value = p2.name }
})
</script>
