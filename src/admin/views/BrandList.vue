<template>
  <div class="page-stack">

    <!-- Header -->
    <div class="page-header">
      <div class="page-header-info">
        <h2>Thương hiệu</h2>
        <p>Tổng {{ store.meta.total }} thương hiệu</p>
      </div>
      <router-link to="/admin/brands/create" class="btn btn-primary">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Thêm thương hiệu
      </router-link>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <input v-model="search" @input="debouncedFetch" placeholder="Tìm tên thương hiệu..." class="input" />
      <select v-model="statusFilter" @change="doFetch" class="input" style="width:176px">
        <option value="">Tất cả trạng thái</option>
        <option value="1">Đang hiển thị</option>
        <option value="0">Đang ẩn</option>
      </select>
      <button v-if="hasFilter" @click="clearFilter" class="btn btn-outline btn-sm" style="color:var(--red-500);border-color:var(--red-100)">
        ✕ Xóa lọc
      </button>
    </div>

    <!-- Table card -->
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
        <p class="e-sub">Kiểm tra <code>VITE_API_URL</code> trong file <code>.env</code></p>
        <button @click="doFetch" class="btn btn-outline btn-sm" style="margin-top:12px">🔄 Thử lại</button>
      </div>

      <div v-else-if="store.brands.length === 0" class="empty-table">
        <div class="icon-lg">🏷️</div>
        <p>Chưa có thương hiệu nào</p>
        <router-link to="/admin/brands/create" class="btn btn-primary btn-sm">+ Thêm thương hiệu đầu tiên</router-link>
      </div>

      <table v-else class="table-auto">
        <thead>
          <tr>
            <th style="width:32px"><input type="checkbox" /></th>
            <th>Thương hiệu</th>
            <th>Slug</th>
            <th>Quốc gia</th>
            <th>Website</th>
            <th>Sản phẩm</th>
            <th>Thứ tự</th>
            <th>Trạng thái</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in store.brands" :key="b.id">
            <td><input type="checkbox" /></td>
            <td>
              <div class="brand-cell">
                <div class="brand-logo">
                  <img v-if="b.logo" :src="logoUrl(b.logo)" />
                  <span v-else>{{ b.name.charAt(0) }}</span>
                </div>
                <div>
                  <p class="brand-name">{{ b.name }}</p>
                  <p v-if="b.description" class="brand-desc">{{ b.description }}</p>
                </div>
              </div>
            </td>
            <td style="font-family:monospace;font-size:11px;color:var(--gray-400)">{{ b.slug }}</td>
            <td>
              <span v-if="b.country" class="cat-chip">{{ b.country }}</span>
              <span v-else style="color:var(--gray-400);font-size:12px">—</span>
            </td>
            <td>
              <a v-if="b.website" :href="b.website" target="_blank" class="brand-link">
                {{ shortUrl(b.website) }}
                <svg style="width:10px;height:10px;margin-left:2px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
              <span v-else style="color:var(--gray-400);font-size:12px">—</span>
            </td>
            <td style="font-weight:600;color:var(--gray-700)">{{ b.products_count ?? 0 }}</td>
            <td style="color:var(--gray-500)">{{ b.sort_order }}</td>
            <td>
              <span :class="b.is_active ? 'badge badge-green' : 'badge badge-gray'">
                {{ b.is_active ? 'Hiển thị' : 'Ẩn' }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <router-link :to="`/admin/brands/${b.id}/edit`" class="btn-icon edit" title="Sửa">
                  <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </router-link>
                <button @click="confirmDel(b)" class="btn-icon delete" title="Xóa">
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
            <h3>Xóa thương hiệu?</h3>
            <p>
              Bạn sắp xóa <strong>{{ delTarget.name }}</strong>.
              <span v-if="(delTarget.products_count ?? 0) > 0" class="warn">
                ⚠️ Thương hiệu này đang có {{ delTarget.products_count }} sản phẩm!
              </span>
            </p>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBrandStore } from '@/admin/stores/brandStore'
import type { Brand } from '@/admin/stores/brandStore'

const store        = useBrandStore()
const search       = ref('')
const statusFilter = ref('')
const delTarget    = ref<Brand | null>(null)
const deleting     = ref(false)
const hasFilter    = computed(() => search.value || statusFilter.value)

const BASE    = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'
const logoUrl = (path: string) => `${BASE}/storage/${path}`
const shortUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

let timer: ReturnType<typeof setTimeout>
function debouncedFetch() { clearTimeout(timer); timer = setTimeout(doFetch, 350) }
function doFetch() { store.fetchAll({ search: search.value, is_active: statusFilter.value, page: 1 }) }
function goPage(p: number) { store.fetchAll({ search: search.value, is_active: statusFilter.value, page: p }) }
function clearFilter() { search.value = ''; statusFilter.value = ''; doFetch() }

function confirmDel(b: Brand) { delTarget.value = b }
async function doDel() {
  if (!delTarget.value) return
  deleting.value = true
  try { await store.remove(delTarget.value.id) }
  finally { deleting.value = false; delTarget.value = null }
}

onMounted(() => store.fetchAll())
</script>
