<template>
  <div class="page-stack">
    <div class="page-header">
      <div class="page-header-info">
        <h2>Danh mục sản phẩm</h2>
        <p>Tổ chức sản phẩm theo nhóm</p>
      </div>
      <router-link to="/admin/categories/create" class="btn btn-primary">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
        Thêm danh mục
      </router-link>
    </div>

    <div class="filter-bar">
      <input v-model="search" @input="debouncedFetch" placeholder="Tìm tên danh mục..." class="input" />
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

      <div v-else-if="store.categories.length === 0" class="empty-table">
        <div class="icon-lg">📂</div>
        <p>Chưa có danh mục nào</p>
        <router-link to="/admin/categories/create" class="btn btn-primary btn-sm">+ Thêm danh mục đầu tiên</router-link>
      </div>

      <table v-else class="table-auto">
        <thead>
          <tr>
            <th>Tên danh mục</th>
            <!-- <th>Slug</th> -->
            <!-- <th>Danh mục cha</th> -->
            <!-- <th>Sản phẩm</th> -->
            <!-- <th>Thứ tự</th> -->
            <th>Trạng thái</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in store.categories" :key="cat.id">
            <td>
              <div class="cat-name-cell">
                <div :class="['cat-avatar', cat.parent_id ? 'child' : 'root']">
                  {{ cat.parent_id ? '↳' : cat.name.charAt(0) }}
                </div>
                <p :class="['cat-name', cat.parent_id ? 'child' : 'root']">{{ cat.name }}</p>
              </div>
            </td>
            <!-- <td style="font-family:monospace;font-size:11px;color:var(--gray-400)">{{ cat.slug }}</td> -->
            <!-- <td>
              <span v-if="cat.parent_id" class="cat-chip">{{ parentName(cat.parent_id) }}</span>
              <span v-else style="font-size:12px;color:var(--gray-400)">—</span>
            </td> -->
            <!-- <td style="font-weight:600;color:var(--gray-700)">{{ cat.products_count ?? 0 }}</td> -->
            <!-- <td style="color:var(--gray-500)">{{ cat.sort_order }}</td> -->
            <td>
              <span :class="cat.is_active ? 'badge badge-green' : 'badge badge-gray'">
                {{ cat.is_active ? 'Hiển thị' : 'Ẩn' }}
              </span>
            </td>
            <td>
              <div class="row-actions">
                <router-link :to="`/admin/categories/${cat.id}/edit`" class="btn-icon edit">
                  <svg style="width:14px;height:14px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </router-link>
                <button @click="confirmDel(cat)" class="btn-icon delete">
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

    <Teleport to="body">
      <div v-if="delTarget" class="modal-overlay" @click.self="delTarget = null">
        <div class="modal-box">
          <div class="modal-icon">🗑️</div>
          <div class="modal-body">
            <h3>Xóa danh mục?</h3>
            <p>
              Bạn sắp xóa <strong>{{ delTarget.name }}</strong>.
              <span v-if="(delTarget.products_count ?? 0) > 0" class="warn">
                ⚠️ Danh mục này có {{ delTarget.products_count }} sản phẩm!
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
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/admin/stores/categoryStore'
import type { Category } from '@/admin/stores/categoryStore'

const store     = useCategoryStore()
const search    = ref('')
const delTarget = ref<Category | null>(null)
const deleting  = ref(false)

let timer: ReturnType<typeof setTimeout>
function debouncedFetch() { clearTimeout(timer); timer = setTimeout(() => store.fetchAll({ search: search.value }), 350) }

function parentName(id: number): string {
  return store.categories.find(c => c.id === id)?.name || '—'
}
function confirmDel(c: Category) { delTarget.value = c }
async function doDel() {
  if (!delTarget.value) return
  deleting.value = true
  try { await store.remove(delTarget.value.id) }
  finally { deleting.value = false; delTarget.value = null }
}

onMounted(() => store.fetchAll())
</script>
