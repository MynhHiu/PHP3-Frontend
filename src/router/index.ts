// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const AdminLayout = () => import('@/admin/layouts/AdminLayout.vue')
const DashboardView = () => import('@/admin/views/DashboardView.vue')
const ProductList = () => import('@/admin/views/ProductList.vue')
const ProductForm = () => import('@/admin/views/ProductForm.vue')
const CategoryList = () => import('@/admin/views/CategoryList.vue')
const CategoryForm = () => import('@/admin/views/CategoryForm.vue')
const BrandList = () => import('@/admin/views/BrandList.vue')
const BrandForm = () => import('@/admin/views/BrandForm.vue')
const VariantManager = () => import('@/admin/views/VariantManager.vue')
const VariantList    = () => import('@/admin/views/VariantList.vue')
const VariantCreate  = () => import('@/admin/views/VariantCreate.vue')
const VariantAssign  = () => import('@/admin/views/VariantAssign.vue') 
const OrderList = () => import('@/admin/views/OrderList.vue')
const UserList = () => import('@/admin/views/UserList.vue')

// Giữ UserLayout của bạn nếu đã có, hoặc để router-view
// const UserLayout     = () => import('@/user/layouts/UserLayout.vue')
const UserLayout     = () => import('@/user/layouts/UserLayout.vue')
const HomeView       = () => import('@/user/views/HomeView.vue')
export default createRouter({
  history: createWebHistory(),
  routes: [

    // ── ADMIN ─────────────────────────────────
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', component: DashboardView, name: 'dashboard' },
        { path: 'products', component: ProductList, name: 'products' },
        { path: 'products/create', component: ProductForm, name: 'product-create' },
        { path: 'products/:id/edit', component: ProductForm, name: 'product-edit' },
        { path: 'categories', component: CategoryList, name: 'categories' },
        { path: 'categories/create', component: CategoryForm, name: 'category-create' },
        { path: 'categories/:id/edit', component: CategoryForm, name: 'category-edit' },
        { path: 'brands', component: BrandList, name: 'brands' },
        { path: 'brands/create', component: BrandForm, name: 'brand-create' },
        { path: 'brands/:id/edit', component: BrandForm, name: 'brand-edit' },
        { path: 'orders', component: OrderList, name: 'orders' },
        { path: 'users', component: UserList, name: 'users' },
        // ── VARIANT ROUTES (2 trang mới trong sidebar) ──────────────────
        // 1. Danh sách tất cả biến thể
        {
          path: 'variants', component: VariantList, name: 'variants',
        },
        // 2. Tạo biến thể mới (với các option_values)
        {
          path: 'variants/create', component: VariantCreate, name: 'variant-create',
        },
        // 3. Sửa biến thể
        {
          path: 'variants/:id/edit',
          component: VariantCreate,    // dùng chung form tạo/sửa
 name: 'variant-edit',
        },
        // 4. Gán biến thể vào sản phẩm + tạo SKU + combination_options
        {
          path: 'variants/assign',
          component: VariantAssign,
          name: 'variant-assign',
        },
      ],
    },

    // ── USER / FRONTEND ─────────────────────
    {
      path: '/',
      component: UserLayout,
      children: [
        { path: '',         component: HomeView, name: 'home' },
      ],
    },

    { path: '/:pathMatch(.*)*', redirect: '/admin/dashboard' },
  ],
})
