<template>
  <div class="form-page">
    <!-- Header -->
    <div class="form-back-header">
      <router-link to="/admin/products" class="btn-back">
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
        <h2>{{ isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm mới" }}</h2>
        <p>Admin / Sản phẩm / {{ isEdit ? "Chỉnh sửa" : "Thêm mới" }}</p>
      </div>
    </div>

    <!-- Loading khi fetch product để edit -->
    <div v-if="loadingProduct" class="loading-state">
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
      Đang tải thông tin sản phẩm...
    </div>

    <form v-else @submit.prevent="submit">
      <div class="form-grid">
        <!-- ── Cột trái ───────────────────────────────────────────────────── -->
        <div class="form-col">
          <!-- Thông tin cơ bản -->
          <div class="section-card">
            <h3>Thông tin cơ bản</h3>
            <div class="form-inner">
              <div class="field">
                <label class="label">Tên sản phẩm <span class="req">*</span></label>
                <input
                  v-model="form.name"
                  class="input"
                  placeholder="VD: Nồi cơm điện Panasonic 1.8L"
                  required
                />
              </div>
              <div class="form-row-2">
                <div class="field">
                  <label class="label">Danh mục <span class="req">*</span></label>
                  <select v-model="form.categories_id" class="input" required>
                    <option value="">-- Chọn danh mục --</option>
                    <optgroup v-if="catStore.rootCategories.length" label="Danh mục gốc">
                      <option
                        v-for="c in catStore.rootCategories"
                        :key="c.id"
                        :value="c.id"
                      >
                        {{ c.name }}
                      </option>
                    </optgroup>
                    <optgroup v-if="catStore.childCategories.length" label="Danh mục con">
                      <option
                        v-for="c in catStore.childCategories"
                        :key="c.id"
                        :value="c.id"
                      >
                        ↳ {{ c.name }}
                      </option>
                    </optgroup>
                  </select>
                </div>
                <div class="field">
                  <label class="label">Thương hiệu</label>
                  <select v-model="form.brand_id" class="input">
                    <option value="">-- Chọn thương hiệu --</option>
                    <option v-for="b in brandStore.brands" :key="b.id" :value="b.id">
                      {{ b.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="field">
                <label class="label">Mô tả sản phẩm</label>
                <textarea
                  v-model="form.description"
                  class="input"
                  rows="4"
                  placeholder="Mô tả chi tiết sản phẩm..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Hình ảnh -->
          <div class="section-card">
            <h3>
              Hình ảnh
              <span class="sub">({{ totalImgCount }}/8)</span>
            </h3>

            <!-- Ảnh cũ (chế độ edit) -->
            <div
              v-if="existingImages.length"
              class="img-grid"
              style="margin-bottom: 12px"
            >
              <div v-for="img in existingImages" :key="img.id" class="img-thumb">
                <img :src="img.url" />
                <button
                  type="button"
                  @click="removeExistingImg(img.id)"
                  class="img-remove"
                  :disabled="removingImageId === img.id"
                  title="Xóa ảnh này"
                >
                  <span v-if="removingImageId === img.id">⏳</span>
                  <span v-else>×</span>
                </button>
                <span v-if="img.id === existingImages[0]?.id" class="img-main-badge"
                  >Ảnh chính</span
                >
              </div>
            </div>

            <!-- Upload zone -->
            <div
              v-if="totalImgCount < 8"
              class="upload-zone"
              @click="($refs.fileInput as HTMLInputElement).click()"
              @dragover.prevent
              @drop.prevent="onDrop"
            >
              <svg
                style="
                  width: 32px;
                  height: 32px;
                  color: var(--gray-300);
                  margin: 0 auto 8px;
                  display: block;
                "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p style="font-size: 13px; font-weight: 500; color: var(--gray-600)">
                Kéo thả hoặc
                <span style="color: var(--brand); text-decoration: underline"
                  >chọn file</span
                >
              </p>
              <p style="font-size: 11px; color: var(--gray-400); margin-top: 4px">
                PNG, JPG tối đa 5MB · Còn {{ 8 - totalImgCount }} slot
              </p>
            </div>
            <input
              ref="fileInput"
              type="file"
              multiple
              accept="image/*"
              class="hidden"
              @change="onFileChange"
            />

            <!-- Ảnh mới chọn -->
            <div v-if="previewImages.length" class="img-grid" style="margin-top: 8px">
              <div v-for="(img, i) in previewImages" :key="'new-' + i" class="img-thumb">
                <img :src="img" />
                <button type="button" @click="removeNewImg(i)" class="img-remove">
                  ×
                </button>
                <span class="img-main-badge" style="background: var(--blue-500)"
                  >Mới</span
                >
              </div>
            </div>
          </div>

          <!-- Biến thể / SKU -->
          <div class="section-card">
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 16px;
              "
            >
              <h3 style="margin: 0">Biến thể / SKU</h3>
              <button type="button" @click="addSku" class="btn btn-outline btn-sm">
                <svg
                  style="width: 13px; height: 13px"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Thêm SKU
              </button>
            </div>

            <div v-if="skus.length === 0" class="sku-empty">
              <p>Chưa có biến thể nào. Nhấn <strong>Thêm SKU</strong> để bắt đầu.</p>
            </div>

            <div v-else class="sku-list">
              <div v-for="(sku, i) in skus" :key="i" class="sku-row">
                <div class="field sku-field-code">
                  <label class="label">Mã SKU <span class="req">*</span></label>
                  <input
                    v-model="sku.sku_code"
                    class="input"
                    placeholder="VD: SP001-XL-DO"
                    required
                  />
                </div>
                <div class="field sku-field-price">
                  <label class="label">Giá bán <span class="req">*</span></label>
                  <div class="price-input">
                    <input
                      v-model.number="sku.price"
                      type="number"
                      min="0"
                      step="1000"
                      class="input"
                      required
                    />
                    <span class="price-suffix">₫</span>
                  </div>
                </div>
                <div class="field sku-field-qty">
                  <label class="label">Tồn kho</label>
                  <input
                    v-model.number="sku.quantity"
                    type="number"
                    min="0"
                    class="input"
                    placeholder="0"
                  />
                </div>
                <div class="field sku-field-status">
                  <label class="label">Trạng thái</label>
                  <select v-model="sku.status" class="input">
                    <option value="active">Đang bán</option>
                    <option value="draft">Nháp</option>
                    <option value="hidden">Ẩn</option>
                  </select>
                </div>
                <button
                  type="button"
                  @click="removeSku(i)"
                  class="btn-icon delete sku-remove"
                  title="Xóa SKU này"
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
                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              </div>

              <!-- Tổng quan SKU -->
              <div class="sku-summary">
                <span>{{ skus.length }} biến thể</span>
                <span
                  >Tổng tồn kho: <strong>{{ totalStock }}</strong></span
                >
                <span
                  >Giá từ: <strong>{{ fmtPrice(minPrice) }}</strong></span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- ── Cột phải: Tóm tắt SKU ──────────────────────────────────────── -->
        <div class="form-col">
          <div class="section-card">
            <h3>Tóm tắt biến thể</h3>

            <div v-if="skus.length === 0" class="sku-summary-empty">
              <svg
                style="
                  width: 36px;
                  height: 36px;
                  color: var(--gray-300);
                  margin: 0 auto 8px;
                  display: block;
                "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
              </svg>
              <p>Chưa có SKU nào được thêm.</p>
            </div>

            <div v-else class="sku-stat-grid">
              <div class="sku-stat-card">
                <span class="sku-stat-label">Số biến thể</span>
                <span class="sku-stat-value">{{ skus.length }}</span>
              </div>
              <div class="sku-stat-card">
                <span class="sku-stat-label">Tổng tồn kho</span>
                <span class="sku-stat-value">{{ totalStock }}</span>
              </div>
              <div class="sku-stat-card">
                <span class="sku-stat-label">Giá thấp nhất</span>
                <span class="sku-stat-value price">{{ fmtPrice(minPrice) }}</span>
              </div>
              <div class="sku-stat-card">
                <span class="sku-stat-label">Giá cao nhất</span>
                <span class="sku-stat-value price">{{ fmtPrice(maxPrice) }}</span>
              </div>
            </div>

            <!-- Danh sách SKU mini -->
            <div v-if="skus.length > 0" class="sku-mini-list">
              <div v-for="(sku, i) in skus" :key="i" class="sku-mini-row">
                <span class="sku-mini-code">{{ sku.sku_code || "(chưa đặt tên)" }}</span>
                <span class="sku-mini-price">{{ fmtPrice(sku.price) }}</span>
                <span :class="['sku-mini-status', sku.status]">
                  {{
                    sku.status === "active"
                      ? "Đang bán"
                      : sku.status === "draft"
                      ? "Nháp"
                      : "Ẩn"
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- Thông tin sản phẩm (readonly summary khi edit) -->
          <div v-if="isEdit" class="section-card">
            <h3>Thông tin</h3>
            <div class="info-row">
              <span class="info-label">Danh mục</span>
              <span class="info-value">{{ selectedCategoryName || "—" }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Thương hiệu</span>
              <span class="info-value">{{ selectedBrandName || "—" }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Số ảnh</span>
              <span class="info-value">{{ totalImgCount }}/8</span>
            </div>
          </div>
        </div>

        <!-- ── Actions ────────────────────────────────────────────────────── -->
        <div class="form-col-full">
          <div class="form-footer">
            <router-link to="/admin/products" class="btn btn-outline"
              >← Quay lại</router-link
            >
            <button type="submit" :disabled="submitting" class="btn btn-primary btn-min">
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
              {{ submitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo sản phẩm" }}
            </button>
          </div>
        </div>
      </div>
    </form>

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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductStore } from "@/admin/stores/productStore";
import { useCategoryStore } from "@/admin/stores/categoryStore";
import { useBrandStore } from "@/admin/stores/brandStore";
import type { ProductImage } from "@/admin/stores/productStore";

const route = useRoute();
const router = useRouter();
const store = useProductStore();
const catStore = useCategoryStore();
const brandStore = useBrandStore();

const isEdit = computed(() => !!route.params.id);
const submitting = ref(false);
const loadingProduct = ref(false);
const toast = ref<{ msg: string; type: string } | null>(null);
const fileInput = ref<HTMLInputElement>();

// ── Ảnh ──────────────────────────────────────────────────────────────────────
const existingImages = ref<ProductImage[]>([]);
const selectedFiles = ref<File[]>([]);
const previewImages = ref<string[]>([]);
const removingImageId = ref<number | null>(null);

const totalImgCount = computed(
  () => existingImages.value.length + selectedFiles.value.length
);

// ── Form (chỉ các field có trong bảng products) ───────────────────────────────
const form = ref({
  name: "",
  brand_id: "" as number | string,
  description: "",
  categories_id: "" as number | string,
});

// ── Computed: tên danh mục / thương hiệu đang chọn ───────────────────────────
const selectedCategoryName = computed(() => {
  const id = form.value.categories_id;
  if (!id) return "";
  const all = [...catStore.rootCategories, ...catStore.childCategories];
  return all.find((c) => c.id === Number(id))?.name ?? "";
});

const selectedBrandName = computed(() => {
  const id = form.value.brand_id;
  if (!id) return "";
  return brandStore.brands.find((b) => b.id === Number(id))?.name ?? "";
});

// ── SKU ───────────────────────────────────────────────────────────────────────
interface SkuRow {
  sku_code: string;
  price: number;
  quantity: number;
  status: "active" | "draft" | "hidden";
}

const skus = ref<SkuRow[]>([]);

const totalStock = computed(() => skus.value.reduce((s, r) => s + (r.quantity || 0), 0));
const minPrice = computed(() => {
  if (!skus.value.length) return 0;
  return Math.min(...skus.value.map((r) => r.price || 0));
});
const maxPrice = computed(() => {
  if (!skus.value.length) return 0;
  return Math.max(...skus.value.map((r) => r.price || 0));
});

function addSku() {
  skus.value.push({ sku_code: "", price: 0, quantity: 0, status: "active" });
}
function removeSku(i: number) {
  skus.value.splice(i, 1);
}

const fmtPrice = (v: number) => (v > 0 ? Number(v).toLocaleString("vi-VN") + "₫" : "—");

// ── File handlers ─────────────────────────────────────────────────────────────
async function onFileChange(e: Event) {
  await addFiles(Array.from((e.target as HTMLInputElement).files || []));
  (e.target as HTMLInputElement).value = "";
}

async function onDrop(e: DragEvent) {
  await addFiles(
    Array.from(e.dataTransfer?.files || []).filter((f) => f.type.startsWith("image/"))
  );
}

async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const MAX_DIM = 1920;
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(new File([blob], file.name, { type: "image/jpeg" }));
          else resolve(file);
        },
        "image/jpeg",
        0.85
      );
    };
    img.src = URL.createObjectURL(file);
  });
}

async function addFiles(files: File[]) {
  const slots = 8 - totalImgCount.value;
  for (const f of files.slice(0, slots)) {
    const compressed = await compressImage(f);
    selectedFiles.value.push(compressed);
    previewImages.value.push(URL.createObjectURL(compressed));
  }
}

function removeNewImg(i: number) {
  const url = previewImages.value[i];
  if (url) URL.revokeObjectURL(url);
  selectedFiles.value.splice(i, 1);
  previewImages.value.splice(i, 1);
}

async function removeExistingImg(imageId: number) {
  if (!confirm("Xóa ảnh này?")) return;
  removingImageId.value = imageId;
  try {
    await store.removeImage(imageId);
    existingImages.value = existingImages.value.filter((img) => img.id !== imageId);
    showToast("Đã xóa ảnh", "success");
  } catch (e: unknown) {
    showToast(e instanceof Error ? e.message : "Xóa ảnh thất bại", "error");
  } finally {
    removingImageId.value = null;
  }
}

// ── FormData builder ──────────────────────────────────────────────────────────
function buildFormData(): FormData {
  const fd = new FormData();

  // Chỉ append các field tồn tại trong bảng products
  fd.append("name", form.value.name);
  fd.append("categories_id", String(form.value.categories_id));
  if (form.value.brand_id) fd.append("brand_id", String(form.value.brand_id));
  if (form.value.description) fd.append("description", form.value.description);

  // Ảnh
  selectedFiles.value.forEach((f) => fd.append("images[]", f));

  // SKUs
  skus.value.forEach((sku, i) => {
    fd.append(`skus[${i}][sku_code]`, sku.sku_code);
    fd.append(`skus[${i}][price]`, String(sku.price));
    fd.append(`skus[${i}][quantity]`, String(sku.quantity));
    fd.append(`skus[${i}][status]`, sku.status);
  });

  return fd;
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submit() {
  if (!form.value.categories_id) {
    showToast("Vui lòng chọn danh mục", "error");
    return;
  }

  // Validate SKU
  if (skus.value.length > 0) {
    const codes = skus.value.map((s) => s.sku_code.trim());
    if (codes.some((c) => !c)) {
      showToast("Mã SKU không được để trống", "error");
      return;
    }
    if (new Set(codes).size !== codes.length) {
      showToast("Mã SKU bị trùng, vui lòng kiểm tra lại", "error");
      return;
    }
  }

  submitting.value = true;
  try {
    if (isEdit.value) {
      const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
      await store.update(Number(id), buildFormData());
      showToast("Cập nhật sản phẩm thành công!", "success");
    } else {
      await store.create(buildFormData());
      showToast("Tạo sản phẩm thành công!", "success");
    }
    setTimeout(() => router.push("/admin/products"), 1200);
  } catch (err: unknown) {
    const msg =
      (err as Error & { userMessage?: string }).userMessage ??
      (err instanceof Error ? err.message : "Lưu thất bại, kiểm tra lại");
    showToast(msg, "error");
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
  await Promise.all([catStore.fetchAll(), brandStore.fetchAll()]);

  if (isEdit.value) {
    loadingProduct.value = true;
    try {
      const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
      const product = await store.fetchOne(Number(id));

      form.value.name = product.name ?? "";
      form.value.description = product.description ?? "";
      form.value.categories_id = product.categories_id ?? "";
      form.value.brand_id = product.brand_id ?? "";

      existingImages.value = product.images ?? [];

      skus.value = (product.skus ?? []).map((s) => ({
        sku_code: s.sku_code,
        price: s.price,
        quantity: s.quantity,
        status: s.status,
      }));
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : "Không tải được sản phẩm", "error");
    } finally {
      loadingProduct.value = false;
    }
  }
});
</script>

<style scoped>
/* ── SKU List ──────────────────────────────────────────────────────────────── */
.sku-empty {
  padding: 20px;
  text-align: center;
  background: var(--gray-50, #f9fafb);
  border: 1px dashed var(--gray-200, #e5e7eb);
  border-radius: 8px;
  color: var(--gray-400, #9ca3af);
  font-size: 13px;
}

.sku-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sku-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr auto;
  gap: 10px;
  align-items: end;
  padding: 12px;
  background: var(--gray-50, #f9fafb);
  border: 1px solid var(--gray-100, #f3f4f6);
  border-radius: 8px;
  transition: border-color 0.15s;
}

.sku-row:hover {
  border-color: var(--gray-200, #e5e7eb);
}

.sku-remove {
  align-self: end;
  margin-bottom: 1px;
}

.sku-summary {
  display: flex;
  gap: 16px;
  padding: 10px 12px;
  background: var(--brand-50, #eff6ff);
  border-radius: 6px;
  font-size: 12px;
  color: var(--gray-500, #6b7280);
  margin-top: 4px;
}

.sku-summary strong {
  color: var(--gray-700, #374151);
}

/* ── SKU Summary Panel (cột phải) ─────────────────────────────────────────── */
.sku-summary-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--gray-400, #9ca3af);
  font-size: 13px;
}

.sku-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
}

.sku-stat-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: var(--gray-50, #f9fafb);
  border: 1px solid var(--gray-100, #f3f4f6);
  border-radius: 8px;
}

.sku-stat-label {
  font-size: 11px;
  color: var(--gray-400, #9ca3af);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sku-stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-800, #1f2937);
}

.sku-stat-value.price {
  font-size: 14px;
  color: var(--brand, #2563eb);
}

/* ── SKU Mini List ────────────────────────────────────────────────────────── */
.sku-mini-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.sku-mini-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: var(--gray-50, #f9fafb);
  border-radius: 6px;
  font-size: 12px;
}

.sku-mini-code {
  flex: 1;
  font-weight: 500;
  color: var(--gray-700, #374151);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sku-mini-price {
  color: var(--brand, #2563eb);
  font-weight: 600;
  white-space: nowrap;
}

.sku-mini-status {
  padding: 2px 7px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.sku-mini-status.active {
  background: #dcfce7;
  color: #166534;
}

.sku-mini-status.draft {
  background: #fef9c3;
  color: #854d0e;
}

.sku-mini-status.hidden {
  background: #f3f4f6;
  color: #6b7280;
}

/* ── Info rows (edit mode) ────────────────────────────────────────────────── */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--gray-100, #f3f4f6);
  font-size: 13px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--gray-400, #9ca3af);
}

.info-value {
  font-weight: 500;
  color: var(--gray-700, #374151);
}

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .sku-row {
    grid-template-columns: 1fr 1fr;
  }
  .sku-remove {
    grid-column: 2;
    justify-self: end;
  }
  .sku-stat-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
