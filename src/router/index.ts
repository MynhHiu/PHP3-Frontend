// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const AdminLayout    = () => import('@/admin/layouts/AdminLayout.vue')
const DashboardView  = () => import('@/admin/views/DashboardView.vue')
const ProductList    = () => import('@/admin/views/ProductList.vue')
const ProductForm    = () => import('@/admin/views/ProductForm.vue')
const CategoryList   = () => import('@/admin/views/CategoryList.vue')
const CategoryForm   = () => import('@/admin/views/CategoryForm.vue')
const BrandList      = () => import('@/admin/views/BrandList.vue')
const BrandForm      = () => import('@/admin/views/BrandForm.vue')

// Giữ UserLayout của bạn nếu đã có, hoặc để router-view
// const UserLayout     = () => import('@/user/layouts/UserLayout.vue')

export default createRouter({
  history: createWebHistory(),
  routes: [

    // ── ADMIN ─────────────────────────────────
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        { path: '',                      redirect: '/admin/dashboard' },
        { path: 'dashboard',             component: DashboardView,  name: 'dashboard' },
        { path: 'products',              component: ProductList,    name: 'products' },
        { path: 'products/create',       component: ProductForm,    name: 'product-create' },
        { path: 'products/:id/edit',     component: ProductForm,    name: 'product-edit' },
        { path: 'categories',            component: CategoryList,   name: 'categories' },
        { path: 'categories/create',     component: CategoryForm,   name: 'category-create' },
        { path: 'categories/:id/edit',   component: CategoryForm,   name: 'category-edit' },
        { path: 'brands',              component: BrandList,     name: 'brands' },
        { path: 'brands/create',       component: BrandForm,     name: 'brand-create' },
        { path: 'brands/:id/edit',     component: BrandForm,     name: 'brand-edit' },
      ],
    },

    // ── USER / FRONTEND ─────────────────────
    {
      path: '/',
      // component: UserLayout,
      children: [
        // Giữ nguyên các route user của bạn ở đây
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/admin/dashboard' },
  ],
})
