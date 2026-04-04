<template>
  <div class="form-page">
    <!-- Header -->
    <div class="form-back-header">
      <router-link to="/admin/variants" class="btn-back">
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
        <h2>{{ isEdit ? "Sửa biến thể" : "Tạo biến thể mới" }}</h2>
        <p>Admin / Biến thể / {{ isEdit ? "Chỉnh sửa" : "Tạo mới" }}</p>
      </div>
    </div>

    <div v-if="loadingInit" class="loading-state">
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
      <!-- LEFT -->
      <div class="form-col">
        <!-- Chọn sản phẩm (chỉ hiện khi tạo mới) -->
        <div v-if="!isEdit" class="section-card">
          <h3>Chọn sản phẩm <span class="req">*</span></h3>
          <div class="field">
            <input
              v-model="productSearch"
              class="input"
              placeholder="Tìm tên sản phẩm..."
              @input="filterProducts"
            />
          </div>
          <div class="product-list">
            <div
              v-for="p in filteredProducts"
              :key="p.id"
              @click="
                selectedProductId = p.id;
                selectedProductName = p.name;
              "
              :class="['product-row', selectedProductId === p.id && 'selected']"
            >
              <div class="product-row-info">
                <span class="product-id">#{{ p.id }}</span>
                <span class="product-name-text">{{ p.name }}</span>
              </div>
              <svg
                v-if="selectedProductId === p.id"
                style="width: 16px; height: 16px; color: var(--brand); flex-shrink: 0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div
              v-if="filteredProducts.length === 0"
              style="
                padding: 12px;
                text-align: center;
                font-size: 13px;
                color: var(--gray-400);
              "
            >
              Không tìm thấy sản phẩm
            </div>
          </div>
          <p
            v-if="selectedProductName"
            style="
              margin-top: 8px;
              font-size: 13px;
              color: var(--brand);
              font-weight: 600;
            "
          >
            ✓ Đã chọn: {{ selectedProductName }}
          </p>
        </div>

        <!-- Tên biến thể -->
        <div class="section-card">
          <h3>Thông tin biến thể</h3>
          <div class="form-inner">
            <div class="field">
              <label class="label">Tên biến thể <span class="req">*</span></label>
              <input
                v-model="variantName"
                class="input"
                placeholder="VD: Màu sắc, Kích cỡ, Dung tích..."
                autofocus
              />
            </div>
          </div>
        </div>

        <!-- Giá trị biến thể -->
        <div class="section-card">
          <h3>Giá trị của biến thể</h3>
          <p style="font-size: 13px; color: var(--gray-500); margin-bottom: 12px">
            Nhập các giá trị cho <strong>{{ variantName || "biến thể" }}</strong
            >. Nhấn
            <kbd
              style="
                background: var(--gray-100);
                border: 1px solid var(--gray-300);
                border-radius: 4px;
                padding: 1px 5px;
                font-size: 11px;
              "
              >Enter</kbd
            >
            để thêm nhanh.
          </p>

          <div class="options-list">
            <div v-for="(opt, i) in options" :key="i" class="option-row">
              <input
                v-model="opt.value"
                class="input"
                :placeholder="placeholderFor(i)"
                @keydown.enter.prevent="onEnterOption(i)"
                :ref="(el) => { if (el) optionRefs[i] = el as HTMLInputElement }"
              />
              <button
                v-if="options.length > 1"
                type="button"
                @click="removeOption(i)"
                class="btn-icon delete"
                title="Xóa"
              >
                <svg
                  style="width: 14px; height: 14px"
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

          <button
            type="button"
            @click="addOption"
            class="btn btn-outline btn-sm"
            style="margin-top: 10px"
          >
            + Thêm giá trị
          </button>
        </div>
      </div>

      <!-- RIGHT: Xem trước -->
      <div class="form-col">
        <div class="section-card">
          <h3>Xem trước</h3>

          <div v-if="variantName || validOptions.length > 0" class="preview-block">
            <p class="preview-label">Sản phẩm</p>
            <p
              style="
                font-size: 13px;
                color: var(--gray-700);
                font-weight: 500;
                margin-bottom: 14px;
              "
            >
              {{ selectedProductName || "(chưa chọn)" }}
            </p>

            <p class="preview-label">Tên biến thể</p>
            <span
              v-if="variantName"
              class="badge badge-green"
              style="margin-bottom: 14px; display: inline-block"
            >
              {{ variantName }}
            </span>
            <span
              v-else
              style="
                font-size: 13px;
                color: var(--gray-400);
                display: block;
                margin-bottom: 14px;
              "
              >—</span
            >

            <p class="preview-label">Các giá trị ({{ validOptions.length }})</p>
            <div class="option-chips" style="margin-bottom: 14px">
              <span v-for="(opt, i) in validOptions" :key="i" class="option-chip">
                {{ opt.value }}
              </span>
              <span
                v-if="validOptions.length === 0"
                style="font-size: 12px; color: var(--gray-400)"
              >
                Chưa có giá trị
              </span>
            </div>
          </div>

          <div v-else class="empty-preview">
            <div style="font-size: 28px; margin-bottom: 8px">🏷️</div>
            <p>Nhập thông tin để xem trước</p>
          </div>
        </div>

        <div class="section-card" style="background: var(--gray-50)">
          <h3>💡 Gợi ý</h3>
          <ul class="tips-list">
            <li><em>Màu sắc</em> → Đỏ, Xanh, Trắng, Đen, Vàng</li>
            <li><em>Kích cỡ</em> → S, M, L, XL, XXL</li>
            <li><em>Dung tích</em> → 250ml, 500ml, 1L, 2L</li>
            <li>
              Sau khi tạo, vào <strong>Quản lý SKU</strong> để gán biến thể vào từng SKU
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="form-footer" style="margin-top: 16px">
      <router-link to="/admin/variants" class="btn btn-outline">← Quay lại</router-link>
      <button
        type="button"
        @click="submit"
        :disabled="submitting || !canSubmit"
        class="btn btn-primary btn-min"
      >
        <svg
          v-if="submitting"
          class="animate-spin"
          style="width: 16px; height: 16px"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"
          />
        </svg>
        {{ submitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo biến thể" }}
      </button>
    </div>

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
import { ref, reactive, computed, nextTick, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useVariantStore } from "@/admin/stores/variantStore";
import { useProductStore } from "@/admin/stores/productStore";

const route = useRoute();
const router = useRouter();
const vStore = useVariantStore();
const pStore = useProductStore();

const isEdit = computed(() => !!route.params.id);
const variantId = computed(() => Number(route.params.id));

const submitting = ref(false);
const loadingInit = ref(false);
const toast = ref<{ msg: string; type: string } | null>(null);
const optionRefs = ref<HTMLInputElement[]>([]);

// ── Sản phẩm ──────────────────────────────────────────────────────────────────
const allProducts = ref<any[]>([]);
const filteredProducts = ref<any[]>([]);
const productSearch = ref("");
const selectedProductId = ref<number | null>(null);
const selectedProductName = ref("");

function filterProducts() {
  const q = productSearch.value.toLowerCase().trim();
  filteredProducts.value = q
    ? allProducts.value.filter(
        (p) => p.name.toLowerCase().includes(q) || String(p.id).includes(q)
      )
    : allProducts.value;
}

// ── Form ──────────────────────────────────────────────────────────────────────
const variantName = ref("");

interface OptionRow {
  value: string;
  existingId?: number;
}
const options = reactive<OptionRow[]>([{ value: "" }]);

const validOptions = computed(() => options.filter((o) => o.value.trim()));

const canSubmit = computed(() => {
  if (!variantName.value.trim()) return false;
  if (!isEdit.value && !selectedProductId.value) return false;
  return true;
});

// ── Placeholder ───────────────────────────────────────────────────────────────
const EXAMPLES: Record<string, string[]> = {
  màu: ["Đỏ", "Xanh lam", "Trắng", "Đen", "Vàng"],
  kích: ["S", "M", "L", "XL", "XXL"],
  size: ["S", "M", "L", "XL", "XXL"],
  dung: ["250ml", "500ml", "1L", "2L"],
  chất: ["Cotton", "Polyester", "Linen"],
};

function placeholderFor(index: number): string {
  const name = variantName.value.toLowerCase();
  for (const [key, vals] of Object.entries(EXAMPLES)) {
    if (name.includes(key)) return `VD: ${vals[index % vals.length]}`;
  }
  return `VD: Giá trị ${index + 1}`;
}

// ── Option handlers ───────────────────────────────────────────────────────────
function addOption() {
  options.push({ value: "" });
  nextTick(() => optionRefs.value[options.length - 1]?.focus());
}

function removeOption(i: number) {
  options.splice(i, 1);
}

function onEnterOption(i: number) {
  if (i === options.length - 1) addOption();
  else optionRefs.value[i + 1]?.focus();
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submit() {
  if (!canSubmit.value) return;
  submitting.value = true;
  try {
    if (isEdit.value) {
      // Cập nhật tên variant
      await vStore.updateVariant(variantId.value, variantName.value.trim());

      // Thêm các option mới (chưa có existingId)
      const newOpts = options.filter((o) => o.value.trim() && !o.existingId);
      for (const opt of newOpts) {
        await vStore.createOption(variantId.value, opt.value.trim());
      }

      showToast("Cập nhật biến thể thành công!", "success");
    } else {
      // Tạo variant gắn với sản phẩm
      const created = await vStore.createVariant(
        selectedProductId.value!,
        variantName.value.trim()
      );

      // Tạo các giá trị
      for (const opt of validOptions.value) {
        await vStore.createOption(created.id, opt.value.trim());
      }

      showToast("Tạo biến thể thành công!", "success");
    }
    setTimeout(() => router.push("/admin/variants"), 1200);
  } catch (err: any) {
    showToast(err.userMessage || "Lưu thất bại", "error");
  } finally {
    submitting.value = false;
  }
}

function showToast(msg: string, type: string) {
  toast.value = { msg, type };
  setTimeout(() => (toast.value = null), 3500);
}

// ── Mount ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  loadingInit.value = true;
  try {
    await pStore.fetchAll();
    allProducts.value = pStore.products;
    filteredProducts.value = allProducts.value;

    if (isEdit.value) {
      // Tìm variant trong tất cả sản phẩm
      for (const p of allProducts.value) {
        await vStore.fetchVariants(p.id);
        const found = vStore.variants.find((v) => v.id === variantId.value);
        if (found) {
          variantName.value = found.variant_name;
          selectedProductId.value = p.id;
          selectedProductName.value = p.name;
          // Load options vào form
          options.splice(0, options.length);
          for (const opt of found.options) {
            options.push({ value: opt.option_values, existingId: opt.id });
          }
          if (options.length === 0) options.push({ value: "" });
          break;
        }
      }
    }
  } finally {
    loadingInit.value = false;
  }
});
</script>

<style scoped>
.variant-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
}
@media (max-width: 768px) {
  .variant-layout {
    grid-template-columns: 1fr;
  }
}

/* Product list */
.product-list {
  max-height: 280px;
  overflow-y: auto;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  margin-top: 8px;
}
.product-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid var(--gray-100);
  transition: background 0.15s;
}
.product-row:last-child {
  border-bottom: none;
}
.product-row:hover {
  background: var(--gray-50);
}
.product-row.selected {
  background: #edf3ff;
}
.product-row-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.product-id {
  font-family: monospace;
  font-size: 11px;
  color: var(--gray-400);
  background: var(--gray-100);
  padding: 2px 6px;
  border-radius: 4px;
}
.product-name-text {
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
}

/* Options */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.option-row .input {
  flex: 1;
}

/* Preview */
.preview-block {
  padding: 4px 0;
}
.preview-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--gray-400);
  margin-bottom: 6px;
}
.option-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.option-chip {
  display: inline-flex;
  align-items: center;
  background: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 13px;
  color: var(--gray-700);
}
.empty-preview {
  text-align: center;
  padding: 28px 16px;
  color: var(--gray-400);
  font-size: 13px;
}

/* Tips */
.tips-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tips-list li {
  font-size: 13px;
  color: var(--gray-600);
  padding-left: 16px;
  position: relative;
  line-height: 1.5;
}
.tips-list li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: var(--brand);
  font-weight: 700;
}
.tips-list em {
  color: var(--brand);
  font-style: normal;
  font-weight: 600;
}
</style>
