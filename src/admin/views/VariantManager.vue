<template>
  <div class="form-page">
    <!-- Header -->
    <div class="form-back-header">
      <router-link :to="`/admin/products/${productId}/edit`" class="btn-back">
        <svg
          style="width: 16px; height: 16px"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </router-link>
      <div class="fh-info">
        <h2>Biến thể & SKU — {{ productName }}</h2>
        <p>Admin / Sản phẩm / Biến thể & SKU</p>
      </div>
    </div>

    <div v-if="store.loading" class="loading-state">
      <svg
        class="animate-spin"
        style="width: 20px; height: 20px"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path
          d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"
        />
      </svg>
      Đang tải...
    </div>

    <div v-else class="variant-layout">
      <!-- ── LEFT: Biến thể ───────────────────────────────────────────────── -->
      <div class="form-col">
        <div class="section-card">
          <h3>
            Tùy chọn biến thể
            <span class="sub">(VD: Màu sắc, Kích cỡ)</span>
          </h3>

          <!-- Thêm variant mới -->
          <div class="add-row">
            <input
              v-model="newVariantName"
              class="input"
              placeholder="Tên tùy chọn (VD: Màu sắc)"
              @keyup.enter="addVariant"
            />
            <button
              @click="addVariant"
              :disabled="!newVariantName.trim() || addingVariant"
              class="btn btn-primary btn-sm"
            >
              <svg
                style="width: 14px; height: 14px"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Thêm
            </button>
          </div>

          <!-- Danh sách variant -->
          <div
            v-if="store.variants.length === 0"
            class="empty-table"
            style="padding: 24px"
          >
            <div style="font-size: 28px; margin-bottom: 8px">🎨</div>
            <p style="font-size: 13px">
              Chưa có tùy chọn nào. Thêm biến thể để phân loại sản phẩm.
            </p>
          </div>

          <div v-for="v in store.variants" :key="v.id" class="variant-block">
            <!-- Variant header -->
            <div class="variant-header">
              <div v-if="editingVariantId === v.id" class="variant-edit-row">
                <input
                  v-model="editingVariantName"
                  class="input input-sm"
                  @keyup.enter="saveVariantName(v)"
                />
                <button @click="saveVariantName(v)" class="btn btn-primary btn-sm">
                  ✓
                </button>
                <button @click="editingVariantId = null" class="btn btn-outline btn-sm">
                  ✕
                </button>
              </div>
              <div v-else class="variant-title-row">
                <span class="variant-title">{{ v.variant_name }}</span>
                <div class="row-actions">
                  <button
                    @click="startEditVariant(v)"
                    class="btn-icon edit"
                    title="Sửa tên"
                  >
                    <svg
                      style="width: 13px; height: 13px"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmDeleteVariant(v)"
                    class="btn-icon delete"
                    title="Xóa biến thể"
                  >
                    <svg
                      style="width: 13px; height: 13px"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Options (giá trị của biến thể) -->
            <div class="option-chips">
              <span v-for="opt in v.options" :key="opt.id" class="option-chip">
                {{ opt.option_values }}
                <button
                  @click="deleteOption(v.id, opt.id)"
                  class="chip-del"
                  title="Xóa giá trị"
                >
                  ×
                </button>
              </span>

              <!-- Thêm option mới -->
              <div class="add-option-row">
                <input
                  :ref="(el) => { if (el) optInputs[v.id] = el as HTMLInputElement }"
                  v-model="newOptions[v.id]"
                  class="input input-xs"
                  :placeholder="'VD: ' + exampleFor(v.variant_name)"
                  @keyup.enter="addOption(v.id)"
                />
                <button @click="addOption(v.id)" class="btn btn-outline btn-sm">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── RIGHT: SKU ────────────────────────────────────────────────────── -->
      <div class="form-col">
        <div class="section-card">
          <h3>
            SKU sản phẩm
            <span class="sub">(Mã & Giá từng biến thể)</span>
          </h3>

          <!-- Form thêm/sửa SKU -->
          <div class="sku-add-form">
            <div class="form-row-2">
              <div class="field">
                <label class="label">Mã SKU <span class="req">*</span></label>
                <input
                  v-model="newSku.sku_code"
                  class="input"
                  style="font-family: monospace"
                  placeholder="SP001-DO-L"
                  :disabled="!!editingSkuCode"
                />
              </div>
              <div class="field">
                <label class="label">Giá bán <span class="req">*</span></label>
                <div class="price-input">
                  <input
                    v-model.number="newSku.price"
                    type="number"
                    min="0"
                    step="1000"
                    class="input"
                  />
                  <span class="price-suffix">₫</span>
                </div>
              </div>
            </div>
            <div class="form-row-2">
              <div class="field">
                <label class="label">Số lượng</label>
                <input
                  v-model.number="newSku.quantity"
                  type="number"
                  min="0"
                  class="input"
                />
              </div>
              <div class="field">
                <label class="label">Trạng thái</label>
                <select v-model="newSku.status" class="input">
                  <option value="active">Đang bán</option>
                  <option value="draft">Nháp</option>
                  <option value="hidden">Ẩn</option>
                </select>
              </div>
            </div>

            <div class="form-footer-right" style="gap: 8px">
              <button
                v-if="editingSkuCode"
                @click="cancelEditSku"
                class="btn btn-outline btn-sm"
              >
                Hủy
              </button>
              <button
                @click="saveSku"
                :disabled="!newSku.sku_code || !newSku.price || savingSkus"
                class="btn btn-primary"
                style="flex: 1; justify-content: center"
              >
                <svg
                  v-if="savingSkus"
                  class="animate-spin"
                  style="width: 14px; height: 14px"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"
                  />
                </svg>
                {{ editingSkuCode ? "Cập nhật SKU" : "+ Thêm SKU" }}
              </button>
            </div>
          </div>

          <!-- Bảng SKU hiện có -->
          <div v-if="store.skus.length === 0" class="empty-table" style="padding: 20px">
            <p style="font-size: 13px; color: var(--gray-400)">
              Chưa có SKU nào. Thêm SKU để quản lý giá và tồn kho.
            </p>
          </div>

          <div v-else style="overflow-x: auto; margin-top: 12px">
            <table class="table-auto">
              <thead>
                <tr>
                  <th>SKU Code</th>
                  <th>Giá</th>
                  <th>SL</th>
                  <th>Trạng thái</th>
                  <th class="text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="s in store.skus"
                  :key="s.sku_code"
                  :class="editingSkuCode === s.sku_code ? 'row-editing' : ''"
                >
                  <td
                    style="
                      font-family: monospace;
                      font-size: 12px;
                      font-weight: 600;
                      color: var(--brand);
                    "
                  >
                    {{ s.sku_code }}
                  </td>
                  <td class="price-main">{{ fmt(s.price) }}</td>
                  <td
                    :class="
                      s.quantity === 0
                        ? 'stock-out'
                        : s.quantity < 5
                        ? 'stock-low'
                        : 'stock-ok'
                    "
                  >
                    {{ s.quantity }}
                  </td>
                  <td>
                    <span
                      :class="
                        s.status === 'active'
                          ? 'badge badge-green'
                          : s.status === 'draft'
                          ? 'badge badge-yellow'
                          : 'badge badge-gray'
                      "
                    >
                      {{
                        s.status === "active"
                          ? "Đang bán"
                          : s.status === "draft"
                          ? "Nháp"
                          : "Ẩn"
                      }}
                    </span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button @click="startEditSku(s)" class="btn-icon edit">
                        <svg
                          style="width: 13px; height: 13px"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <path
                            d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                          />
                          <path
                            d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                          />
                        </svg>
                      </button>
                      <button
                        @click="confirmDeleteSku(s.sku_code)"
                        class="btn-icon delete"
                      >
                        <svg
                          style="width: 13px; height: 13px"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Gán biến thể vào SKU -->
        <div
          v-if="store.variants.length > 0 && store.skus.length > 0"
          class="section-card"
        >
          <h3>Gán biến thể vào SKU</h3>
          <p style="font-size: 13px; color: var(--gray-500); margin-bottom: 12px">
            Chọn SKU và tick vào các giá trị biến thể tương ứng.
          </p>

          <div class="field" style="margin-bottom: 12px">
            <label class="label">Chọn SKU</label>
            <select v-model="assignSkuCode" class="input">
              <option value="">-- Chọn SKU --</option>
              <option v-for="s in store.skus" :key="s.sku_code" :value="s.sku_code">
                {{ s.sku_code }} ({{ fmt(s.price) }})
              </option>
            </select>
          </div>

          <div v-if="assignSkuCode">
            <div v-for="v in store.variants" :key="v.id" class="assign-variant-group">
              <p class="assign-variant-label">{{ v.variant_name }}</p>
              <div class="assign-options">
                <label
                  v-for="opt in v.options"
                  :key="opt.id"
                  class="assign-option-item"
                  :class="isCombined(opt.id, assignSkuCode) ? 'active' : ''"
                >
                  <input
                    type="checkbox"
                    :checked="isCombined(opt.id, assignSkuCode)"
                    @change="toggleCombination(opt.id, assignSkuCode)"
                    style="display: none"
                  />
                  {{ opt.option_values }}
                </label>
              </div>
            </div>
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
            <p>
              Xóa <strong>{{ delVariant.variant_name }}</strong> và tất cả giá trị của nó.
              Không thể hoàn tác.
            </p>
          </div>
          <div class="modal-actions">
            <button @click="delVariant = null" class="btn btn-outline">Hủy</button>
            <button @click="doDeleteVariant" class="btn btn-danger">Xóa</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete SKU modal -->
    <Teleport to="body">
      <div v-if="delSkuCode" class="modal-overlay" @click.self="delSkuCode = null">
        <div class="modal-box">
          <div class="modal-icon">🗑️</div>
          <div class="modal-body">
            <h3>Xóa SKU?</h3>
            <p>
              Xóa SKU <strong>{{ delSkuCode }}</strong
              >. Không thể hoàn tác.
            </p>
          </div>
          <div class="modal-actions">
            <button @click="delSkuCode = null" class="btn btn-outline">Hủy</button>
            <button @click="doDeleteSku" :disabled="deletingSkus" class="btn btn-danger">
              {{ deletingSkus ? "Đang xóa..." : "Xóa" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="slide-up">
        <div v-if="toast" :class="['toast', toast.type]">
          {{ toast.type === "success" ? "✓" : "✕" }} {{ toast.msg }}
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useVariantStore } from "@/admin/stores/variantStore";
import { useProductStore } from "@/admin/stores/productStore";
import type { ProductVariant, SkuRow } from "@/admin/stores/variantStore";

const route = useRoute();
const store = useVariantStore();
const pStore = useProductStore();
const productId = Number(route.params.id);

const productName = ref("");
const newVariantName = ref("");
const addingVariant = ref(false);
const editingVariantId = ref<number | null>(null);
const editingVariantName = ref("");
const newOptions = reactive<Record<number, string>>({});
const optInputs = reactive<Record<number, HTMLInputElement>>({});
const delVariant = ref<ProductVariant | null>(null);

// SKU
const editingSkuCode = ref<string | null>(null);
const savingSkus = ref(false);
const deletingSkus = ref(false);
const delSkuCode = ref<string | null>(null);
const newSku = reactive<{
  sku_code: string;
  price: number;
  quantity: number;
  status: "active" | "draft" | "hidden";
}>({
  sku_code: "",
  price: 0,
  quantity: 0,
  status: "active",
});

// Combination assignment
const assignSkuCode = ref("");

const toast = ref<{ msg: string; type: string } | null>(null);
const fmt = (v: number) => Number(v).toLocaleString("vi-VN") + "₫";

function showToast(msg: string, type: string) {
  toast.value = { msg, type };
  setTimeout(() => (toast.value = null), 3500);
}

// ── Variant handlers ──────────────────────────────────────────────────────────

const EXAMPLES: Record<string, string> = {
  màu: "Đỏ / Xanh / Trắng",
  kích: "S / M / L / XL",
  size: "S / M / L / XL",
  dung: "250ml / 500ml / 1L",
};

function exampleFor(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, val] of Object.entries(EXAMPLES)) {
    if (lower.includes(key)) return val;
  }
  return "Giá trị 1 / Giá trị 2";
}

async function addVariant() {
  if (!newVariantName.value.trim()) return;
  addingVariant.value = true;
  try {
    await store.createVariant(productId, newVariantName.value.trim());
    newVariantName.value = "";
    showToast("Đã thêm biến thể", "success");
  } catch (e: any) {
    showToast(e.userMessage || "Thêm thất bại", "error");
  } finally {
    addingVariant.value = false;
  }
}

function startEditVariant(v: ProductVariant) {
  editingVariantId.value = v.id;
  editingVariantName.value = v.variant_name;
}

async function saveVariantName(v: ProductVariant) {
  if (!editingVariantName.value.trim()) return;
  try {
    await store.updateVariant(v.id, editingVariantName.value.trim());
    editingVariantId.value = null;
    showToast("Đã cập nhật", "success");
  } catch (e: any) {
    showToast(e.userMessage || "Cập nhật thất bại", "error");
  }
}

function confirmDeleteVariant(v: ProductVariant) {
  delVariant.value = v;
}

async function doDeleteVariant() {
  if (!delVariant.value) return;
  try {
    await store.deleteVariant(delVariant.value.id);
    delVariant.value = null;
    showToast("Đã xóa biến thể", "success");
  } catch (e: any) {
    showToast(e.userMessage || "Xóa thất bại", "error");
  }
}

async function addOption(variantId: number) {
  const val = (newOptions[variantId] || "").trim();
  if (!val) return;
  try {
    await store.createOption(variantId, val);
    newOptions[variantId] = "";
    showToast("Đã thêm giá trị", "success");
  } catch (e: any) {
    showToast(e.userMessage || "Thêm thất bại", "error");
  }
}

async function deleteOption(variantId: number, optionId: number) {
  if (!confirm("Xóa giá trị này?")) return;
  try {
    await store.deleteOption(variantId, optionId);
    showToast("Đã xóa giá trị", "success");
  } catch (e: any) {
    showToast(e.userMessage || "Xóa thất bại", "error");
  }
}

// ── SKU handlers ──────────────────────────────────────────────────────────────

async function saveSku() {
  if (!newSku.sku_code || !newSku.price) return;
  savingSkus.value = true;
  try {
    await store.saveSku(productId, { ...newSku });
    resetSkuForm();
    showToast(editingSkuCode.value ? "Đã cập nhật SKU" : "Đã thêm SKU", "success");
    editingSkuCode.value = null;
  } catch (e: any) {
    showToast(e.userMessage || "Lưu SKU thất bại", "error");
  } finally {
    savingSkus.value = false;
  }
}

function startEditSku(s: SkuRow) {
  editingSkuCode.value = s.sku_code;
  Object.assign(newSku, {
    sku_code: s.sku_code,
    price: s.price,
    quantity: s.quantity,
    status: s.status,
  });
}

function cancelEditSku() {
  editingSkuCode.value = null;
  resetSkuForm();
}

function confirmDeleteSku(code: string) {
  delSkuCode.value = code;
}

async function doDeleteSku() {
  if (!delSkuCode.value) return;
  deletingSkus.value = true;
  try {
    await store.deleteSku(delSkuCode.value);
    delSkuCode.value = null;
    showToast("Đã xóa SKU", "success");
  } catch (e: any) {
    showToast(e.userMessage || "Xóa thất bại", "error");
  } finally {
    deletingSkus.value = false;
  }
}

function resetSkuForm() {
  Object.assign(newSku, { sku_code: "", price: 0, quantity: 0, status: "active" });
}

// ── Combination handlers ───────────────────────────────────────────────────────

function isCombined(optionId: number, skuCode: string): boolean {
  return store.combinations.some(
    (c) => c.options_id === optionId && c.sku_code === skuCode
  );
}

async function toggleCombination(optionId: number, skuCode: string) {
  const existing = store.combinations.find(
    (c) => c.options_id === optionId && c.sku_code === skuCode
  );
  try {
    if (existing) {
      await store.deleteCombination(existing.id);
    } else {
      await store.createCombination(optionId, skuCode);
    }
  } catch (e: any) {
    showToast(e.userMessage || "Thao tác thất bại", "error");
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

onMounted(async () => {
  await Promise.all([
    store.fetchVariants(productId),
    store.fetchSkus(productId),
    store.fetchCombinations(productId),
  ]);

  // Lấy tên sản phẩm
  let p = pStore.getById(productId);
  if (!p) {
    await pStore.fetchAll();
    p = pStore.getById(productId);
  }
  if (p) productName.value = p.name;
});
</script>

<style scoped>
.variant-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media (max-width: 900px) {
  .variant-layout {
    grid-template-columns: 1fr;
  }
}

/* Variant block */
.add-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.add-row .input {
  flex: 1;
}

.variant-block {
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.variant-header {
  background: var(--gray-50);
  padding: 10px 12px;
  border-bottom: 1px solid var(--gray-100);
}

.variant-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.variant-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
}

.variant-edit-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.variant-edit-row .input {
  flex: 1;
}

/* Options */
.option-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px;
  align-items: center;
}

.option-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 20px;
  padding: 3px 8px 3px 12px;
  font-size: 12px;
  color: var(--gray-700);
  font-weight: 500;
}

.chip-del {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--gray-400);
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
  border-radius: 50%;
  transition: color 0.15s, background 0.15s;
}
.chip-del:hover {
  color: var(--red-500);
  background: var(--red-50);
}

.add-option-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.input-xs {
  width: 120px;
  font-size: 12px;
  padding: 4px 8px;
  height: 30px;
}
.input-sm {
  font-size: 13px;
  padding: 6px 10px;
  height: 34px;
}

/* SKU form */
.sku-add-form {
  padding: 14px;
  background: var(--gray-50);
  border-radius: 8px;
  border: 1px solid var(--gray-200);
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.row-editing {
  background: #fef9c3;
}

/* Combination assignment */
.assign-variant-group {
  margin-bottom: 12px;
}
.assign-variant-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.assign-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.assign-option-item {
  display: inline-flex;
  align-items: center;
  padding: 5px 14px;
  border: 1.5px solid var(--gray-200);
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  background: white;
  color: var(--gray-600);
  user-select: none;
}

.assign-option-item:hover {
  border-color: var(--brand);
  color: var(--brand);
}

.assign-option-item.active {
  border-color: var(--brand);
  background: #edf3ff;
  color: var(--brand);
  font-weight: 600;
}

.form-footer-right {
  display: flex;
  justify-content: flex-end;
}
</style>
