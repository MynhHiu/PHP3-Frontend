<template>
  <div class="page-stack">

    <!-- Header -->
    <div class="page-header">
      <div class="page-header-info">
        <h2>Quản lý Banner</h2>
        <p>Tổng {{ store.banners.length }} banner</p>
      </div>
      <router-link to="/admin/banners/create" class="btn btn-primary">
        <svg style="width:16px;height:16px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Thêm banner
      </router-link>
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
        <button @click="store.fetchAll()" class="btn btn-outline btn-sm" style="margin-top:12px">🔄 Thử lại</button>
      </div>

      <div v-else-if="store.banners.length === 0" class="empty-table">
        <div class="icon-lg">🖼️</div>
        <p>Chưa có banner nào</p>
        <router-link to="/admin/banners/create" class="btn btn-primary btn-sm">+ Thêm banner đầu tiên</router-link>
      </div>

      <table v-else class="table-auto">
        <thead>
          <tr>
            <th style="width:80px">Ảnh</th>
            <th>Tiêu đề</th>
            <th style="width:120px;text-align:center">Loại</th>
            <th>Link</th>
            <th style="width:80px;text-align:center">Thứ tự</th>
            <th style="width:110px;text-align:center">Trạng thái</th>
            <th class="text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in store.banners" :key="b.id">
            <td>
              <img
                :src="b.image_url"
                :alt="b.title"
                style="width:72px;height:44px;object-fit:cover;border-radius:6px;border:1px solid var(--gray-100)"
              />
            </td>
            <td>
              <p style="font-weight:600;margin:0">{{ b.title }}</p>
              <p v-if="b.description" style="font-size:12px;color:var(--gray-400);margin:2px 0 0">{{ b.description }}</p>
            </td>
            <td style="text-align:center">
              <span :class="['type-badge', b.banner_type === 'side' ? 'type-side' : 'type-main']">
                {{ b.banner_type === 'side' ? 'Banner nhỏ' : 'Banner chính' }}
              </span>
            </td>
            <td>
              <a v-if="b.link" :href="b.link" target="_blank" style="color:var(--primary);font-size:13px">
                {{ b.link }}
              </a>
              <span v-else style="color:var(--gray-300);font-size:13px">—</span>
            </td>
            <td style="text-align:center">
              <span style="font-size:13px;color:var(--gray-500)">{{ b.sort_order }}</span>
            </td>
            <td style="text-align:center">
              <button
                @click="handleToggle(b.id)"
                :class="['badge', b.is_active ? 'badge-green' : 'badge-red']"
                style="border:none;cursor:pointer;font-size:12px"
                :disabled="toggling === b.id"
              >
                {{ b.is_active ? 'Hiển thị' : 'Ẩn' }}
              </button>
            </td>
            <td class="text-right">
              <div style="display:flex;gap:6px;justify-content:flex-end">
                <router-link :to="`/admin/banners/${b.id}/edit`" class="btn btn-outline btn-sm">Sửa</router-link>
                <button @click="handleDelete(b.id, b.title)" class="btn btn-sm" style="background:var(--red-50);color:var(--red-500);border:1px solid var(--red-100)">
                  Xóa
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Confirm delete modal -->
    <div v-if="deleteTarget" class="modal-overlay" @click.self="deleteTarget = null">
      <div class="modal-box">
        <h3 style="margin:0 0 8px">Xóa banner?</h3>
        <p style="color:var(--gray-500);margin:0 0 20px">Bạn có chắc muốn xóa banner <strong>{{ deleteTarget.title }}</strong>? Hành động này không thể hoàn tác.</p>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button @click="deleteTarget = null" class="btn btn-outline btn-sm">Huỷ</button>
          <button @click="confirmDelete" class="btn btn-sm" style="background:var(--red-500);color:#fff" :disabled="deleting">
            {{ deleting ? 'Đang xóa...' : 'Xóa' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBannerStore } from '@/admin/stores/bannerStore'

const store        = useBannerStore()
const toggling     = ref<number | null>(null)
const deleting     = ref(false)
const deleteTarget = ref<{ id: number; title: string } | null>(null)

onMounted(() => store.fetchAll())

async function handleToggle(id: number) {
  toggling.value = id
  try {
    await store.toggle(id)
  } catch {
    alert('Không thể cập nhật trạng thái')
  } finally {
    toggling.value = null
  }
}

function handleDelete(id: number, title: string) {
  deleteTarget.value = { id, title }
}

async function confirmDelete() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    await store.remove(deleteTarget.value.id)
    deleteTarget.value = null
  } catch {
    alert('Không thể xóa banner')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-box {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.badge-green { background: var(--green-50); color: var(--green-600); border-radius: 20px; padding: 3px 10px; }
.badge-red   { background: var(--red-50);   color: var(--red-500);   border-radius: 20px; padding: 3px 10px; }

.type-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}
.type-main { background: #e8f5ee; color: #1a6e35; }
.type-side { background: #fff3e0; color: #e65100; }
</style>