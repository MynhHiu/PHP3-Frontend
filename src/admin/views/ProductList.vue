<template>
  <div class="page-stack">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header-info">
        <h2>Sản phẩm</h2>
        <p>Tổng {{ store.meta.total }} sản phẩm</p>
      </div>
      <router-link to="/admin/products/create" class="btn btn-primary">
        <svg style="width: 16px; height: 16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Thêm sản phẩm
      </router-link>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <input v-model="filters.search" @input="debouncedFetch" placeholder="Tìm tên, SKU..." class="input" />
      <select v-model="filters.category_id" @change="doFetch" class="input">
        <option value="">Tất cả danh mục</option>
        <option v-for="c in catStore.categories" :key="c.id" :value="c.id">
          {{ c.name }}
        </option>
      </select>
      <button v-if="hasFilter" @click="clearFilter" class="btn btn-outline btn-sm"
        style="color: var(--red-500); border-color: var(--red-100)">
        ✕ Xóa lọc
      </button>
    </div>

    <!-- Table -->
    <div class="table-card">
      <div v-if="store.loading" class="loading-state">
        <svg class="animate-spin" style="width: 20px; height: 20px" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2">
          <path
            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        Đang tải...
      </div>

      <div v-else-if="store.error" class="error-state">
        <div class="icon-lg">⚠️</div>
        <p class="e-title">Không kết nối được API</p>
        <p class="e-sub">{{ store.error }}</p>
        <p class="e-sub">
          Kiểm tra <code>VITE_API_URL</code> trong file <code>.env</code>
        </p>
        <button @click="doFetch" class="btn btn-outline btn-sm" style="margin-top: 12px">
          🔄 Thử lại
        </button>
      </div>

      <div v-else-if="store.products.length === 0" class="empty-table">
        <div class="icon-lg">📦</div>
        <p>Chưa có sản phẩm nào</p>
        <router-link to="/admin/products/create" class="btn btn-primary btn-sm">+ Thêm sản phẩm đầu tiên</router-link>
      </div>

      <table v-else class="table-auto">
        <thead>
          <tr>
            <th style="width: 32px"><input type="checkbox" /></th>
            <th>Sản phẩm</th>
            <th>Danh mục</th>
            <th>Giá bán</th>
            <th>Tồn kho</th>
            <th>Số lượng biến thể</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in store.products" :key="p.id">
            <td><input type="checkbox" /></td>
            <td>
              <div class="product-cell">
                <div class="product-thumb">
                  <img v-if="p.images?.[0]?.url" :src="p.images[0].url" />
                  <svg v-else style="width: 16px; height: 16px" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <div>
                  <p class="product-name">{{ p.name }}</p>
                </div>
              </div>
            </td>
            <td>
              <span class="cat-chip">{{ p.category?.name || "—" }}</span>
            </td>
            <td>
              <p class="price-main">{{ fmt(p.min_price ?? 0) }}</p>
              <p v-if="p.max_price && p.max_price > (p.min_price ?? 0)" class="price-orig">
                đến {{ fmt(p.max_price) }}
              </p>
              <p v-if="(p.sku_count ?? 0) === 0" style="font-size: 11px; color: var(--gray-400)">
                Chưa có SKU
              </p>
            </td>
            <td>
              <span :class="[
                '',
                p.stock === 0
                  ? 'stock-out'
                  : (p.stock ?? 0) < 10
                    ? 'stock-low'
                    : 'stock-ok',
              ]">
                {{ p.stock ?? 0 }}
              </span>
              <p v-if="p.stock === 0" class="stock-hint out">Hết hàng</p>
              <p v-else-if="(p.stock ?? 0) < 10" class="stock-hint low">Sắp hết</p>
            </td>
            <!-- Thay cả td Trạng thái thành: -->
            <td>
              <span :class="(p.sku_count ?? 0) === 0 ? 'badge badge-gray' : 'badge badge-green'
                ">
                {{ (p.sku_count ?? 0) === 0 ? "Chưa có SKU" : `${p.sku_count} biến thể` }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <router-link :to="`/admin/products/${p.id}/variants`" class="btn-icon edit"
                  title="Quản lý biến thể & SKU">
                  <!-- icon tag/variant -->
                  <svg style="width:13px;height:13px" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </router-link>
                <router-link :to="`/admin/products/${p.id}/edit`" class="btn-icon edit" title="Sửa">
                  <svg style="width: 14px; height: 14px" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </router-link>
                <button @click="confirmDel(p)" class="btn-icon delete" title="Xóa">
                  <svg style="width: 14px; height: 14px" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="store.meta.last_page > 1" class="pagination">
        <span>Trang {{ store.meta.current_page }} / {{ store.meta.last_page }}</span>
        <div class="page-btns">
          <button v-for="pg in store.meta.last_page" :key="pg" @click="goPage(pg)"
            :class="['page-btn', store.meta.current_page === pg && 'active']">
            {{ pg }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete modal -->
    <Teleport to="body">
      <div v-if="delTarget" class="modal-overlay" @click.self="delTarget = null">
        <div class="modal-box">
          <div class="modal-icon">🗑️</div>
          <div class="modal-body">
            <h3>Xóa sản phẩm?</h3>
            <p>
              Bạn sắp xóa <strong>{{ delTarget.name }}</strong>.<br />Không thể hoàn tác.
            </p>
          </div>
          <div class="modal-actions">
            <button @click="delTarget = null" class="btn btn-outline">Hủy</button>
            <button @click="doDel" :disabled="deleting" class="btn btn-danger">
              {{ deleting ? "Đang xóa..." : "Xóa" }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useProductStore } from "@/admin/stores/productStore";
import { useCategoryStore } from "@/admin/stores/categoryStore";
import type { Product } from "@/admin/stores/productStore";

const store = useProductStore();
const catStore = useCategoryStore();

const filters = ref({ search: "", category_id: "", status: "" });
const delTarget = ref<Product | null>(null);
const deleting = ref(false);
const hasFilter = computed(
  () => filters.value.search || filters.value.category_id || filters.value.status
);

const BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:8000";

let timer: ReturnType<typeof setTimeout>;
function debouncedFetch() {
  clearTimeout(timer);
  timer = setTimeout(doFetch, 350);
}
function doFetch() {
  store.fetchAll({ ...filters.value, page: 1 });
}
function goPage(p: number) {
  store.fetchAll({ ...filters.value, page: p });
}
function clearFilter() {
  filters.value = { search: "", category_id: "", status: "" };
  doFetch();
}

function confirmDel(p: Product) {
  delTarget.value = p;
}
async function doDel() {
  if (!delTarget.value) return;
  deleting.value = true;
  try {
    await store.remove(delTarget.value.id);
  } finally {
    deleting.value = false;
    delTarget.value = null;
  }
}

const fmt = (v: number) => Number(v).toLocaleString("vi-VN") + "₫";
const statusLabel = (s: string) =>
  ({ active: "Đang bán", draft: "Nháp", hidden: "Ẩn" }[s] ?? s);
const statusBadge = (s: string) =>
({
  active: "badge badge-green",
  draft: "badge badge-yellow",
  hidden: "badge badge-gray",
}[s] ?? "badge badge-gray");

onMounted(async () => {
  await catStore.fetchAll();
  await store.fetchAll();
});
</script>
