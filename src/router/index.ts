import { createRouter, createWebHistory } from 'vue-router'

const AdminLayout = () => import('@/admin/layouts/AdminLayout.vue')
const DashboardView = () => import('@/admin/views/DashboardView.vue')
const ProductList = () => import('@/admin/views/ProductList.vue')
const ProductForm = () => import('@/admin/views/ProductForm.vue')
const CategoryList = () => import('@/admin/views/CategoryList.vue')
const CategoryForm = () => import('@/admin/views/CategoryForm.vue')
const BrandList = () => import('@/admin/views/BrandList.vue')
const BrandForm = () => import('@/admin/views/BrandForm.vue')
const VariantList = () => import('@/admin/views/VariantList.vue')
const VariantCreate = () => import('@/admin/views/VariantCreate.vue')
const VariantAssign = () => import('@/admin/views/VariantAssign.vue')
const OrderList = () => import('@/admin/views/OrderList.vue')
const UserList = () => import('@/admin/views/UserList.vue')

const UserLayout = () => import('@/user/layouts/UserLayout.vue')
const HomeView = () => import('@/user/views/HomeView.vue')
const CartView = () => import('@/user/views/CartView.vue')
const CheckoutView = () => import('@/user/views/CheckoutView.vue')
const ProfileView = () => import('@/user/views/ProfileView.vue')
const OrderHistoryView = () => import('@/user/views/OrderHistoryView.vue')
const OrderDetailView = () => import('@/user/views/OrderDetailView.vue')
const LoginView = () => import('@/user/views/LoginView.vue')
const RegisterView = () => import('@/user/views/RegisterView.vue')

export default createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [

    // ── ADMIN ─────────────────────────────────────────────────
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
        { path: 'variants', component: VariantList, name: 'variants' },
        { path: 'variants/create', component: VariantCreate, name: 'variant-create' },
        { path: 'variants/:id/edit', component: VariantCreate, name: 'variant-edit' },
        { path: 'variants/assign', component: VariantAssign, name: 'variant-assign' },
      ],
    },

    // ── AUTH ──────────────────────────────────────────────────
    {
      path: '/login',
      component: LoginView,      // ← đổi từ AuthView
      name: 'login',
      beforeEnter: (_to, _from, next) => {
        const token = localStorage.getItem('user_token')
        token ? next('/') : next()
      },
    },
    {
      path: '/register',
      component: RegisterView,   // ← đổi từ AuthView
      name: 'register',
      beforeEnter: (_to, _from, next) => {
        const token = localStorage.getItem('user_token')
        token ? next('/') : next()
      },
    },

    // ── USER / FRONTEND ───────────────────────────────────────
    {
      path: '/',
      component: UserLayout,
      children: [
        { path: '', component: HomeView, name: 'home' },
        { path: 'cart', component: CartView, name: 'cart' },
        { path: 'checkout', component: CheckoutView, name: 'checkout' },
        { path: 'profile', component: ProfileView, name: 'profile' },
        { path: 'order-history', component: OrderHistoryView, name: 'order-history' },
        { path: 'order/:id', component: OrderDetailView, name: 'order-detail' },
      ],
    },

    // ── Wildcard ──────────────────────────────────────────────
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})