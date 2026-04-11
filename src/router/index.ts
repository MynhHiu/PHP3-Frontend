import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/user/stores/authStore'


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
const CouponList = () => import('@/admin/views/CouponList.vue')
const CouponForm = () => import('@/admin/views/CouponForm.vue')
const ReviewList = () => import('@/admin/views/ReviewList.vue')

const UserLayout = () => import('@/user/layouts/UserLayout.vue')
const HomeView = () => import('@/user/views/HomeView.vue')
const CartView = () => import('@/user/views/CartView.vue')
const CheckoutView = () => import('@/user/views/CheckoutView.vue')
const ProfileView = () => import('@/user/views/ProfileView.vue')
const OrderHistoryView = () => import('@/user/views/OrderHistoryView.vue')
const OrderDetailView = () => import('@/user/views/OrderDetailView.vue')
const ProductDetailView = () => import('@/user/views/ProductDetailView.vue')
const LoginView = () => import('@/user/views/LoginView.vue')
const RegisterView = () => import('@/user/views/RegisterView.vue')
const GoogleCallback   = () => import('@/user/views/GoogleCallback.vue')

const VariantManager = () => import('@/admin/views/VariantManager.vue')

const CouponsView = () => import('@/user/views/CouponsView.vue')

// Shorthand meta helpers
const adminMeta = { requiresAuth: true, requiresAdmin: true }
const authMeta  = { requiresAuth: true }

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior() {
    return { top: 0 }
  },
  routes: [

    // ── ADMIN ─────────────────────────────────────────────────
    // Chỉ dành cho role = 1 (admin). Nếu user thường vào sẽ bị chuyển về home.
    {
      path: '/admin',
      component: AdminLayout,
      meta: adminMeta,
      children: [
        { path: '',                      redirect: '/admin/dashboard' },
        { path: 'dashboard',             component: DashboardView,  name: 'dashboard',       meta: adminMeta },
        { path: 'products',              component: ProductList,    name: 'products',         meta: adminMeta },
        { path: 'products/create',       component: ProductForm,    name: 'product-create',   meta: adminMeta },
        { path: 'products/:id/edit',     component: ProductForm,    name: 'product-edit',     meta: adminMeta },
        { path: 'categories',            component: CategoryList,   name: 'categories',       meta: adminMeta },
        { path: 'categories/create',     component: CategoryForm,   name: 'category-create',  meta: adminMeta },
        { path: 'categories/:id/edit',   component: CategoryForm,   name: 'category-edit',    meta: adminMeta },
        { path: 'brands',                component: BrandList,      name: 'brands',            meta: adminMeta },
        { path: 'brands/create',         component: BrandForm,      name: 'brand-create',      meta: adminMeta },
        { path: 'brands/:id/edit',       component: BrandForm,      name: 'brand-edit',        meta: adminMeta },
        { path: 'orders',                component: OrderList,      name: 'orders',            meta: adminMeta },
        { path: 'users',                 component: UserList,       name: 'users',             meta: adminMeta },
        { path: 'coupons',               component: CouponList,     name: 'coupons',           meta: adminMeta },
        { path: 'coupons/create',        component: CouponForm,     name: 'coupon-create',     meta: adminMeta },
        { path: 'coupons/:code/edit',    component: CouponForm,     name: 'coupon-edit',       meta: adminMeta },
        { path: 'variants',              component: VariantList,    name: 'variants',          meta: adminMeta },
        { path: 'variants/create',       component: VariantCreate,  name: 'variant-create',    meta: adminMeta },
        { path: 'variants/:id/edit',     component: VariantCreate,  name: 'variant-edit',      meta: adminMeta },
        { path: 'variants/assign',       component: VariantAssign,  name: 'variant-assign',    meta: adminMeta },
        { path: 'products/:id/variants', component: VariantManager, name: 'variant-manager',   meta: adminMeta },
        { path: 'reviews',               component: ReviewList,     name: 'reviews',           meta: adminMeta  },
      ],
    },

    // ── AUTH ──────────────────────────────────────────────────
    {
      path: '/login',
      component: LoginView,
      name: 'login',
      meta: { guestOnly: true },
      beforeEnter: (_to, _from, next) => {
        const token = localStorage.getItem('user_token')
        token ? next('/') : next()
      },
    },
    {
      path: '/register',
      component: RegisterView,
      name: 'register',
      meta: { guestOnly: true },
      beforeEnter: (_to, _from, next) => {
        const token = localStorage.getItem('user_token')
        token ? next('/') : next()
      },
    },
    { path: '/auth/google/callback', name: 'google-callback', component: GoogleCallback },

    // ── USER / FRONTEND ───────────────────────────────────────
    // Public routes (home, product, cart) không cần đăng nhập.
    // Các trang nhạy cảm (checkout, profile, orders, coupons) yêu cầu đăng nhập.
    {
      path: '/',
      component: UserLayout,
      children: [
        { path: '',              component: HomeView,          name: 'home' },
        { path: 'products/:id',  component: ProductDetailView, name: 'product-detail' },
        { path: 'cart',          component: CartView,          name: 'cart' },
        { path: 'checkout',      component: CheckoutView,      name: 'checkout',       meta: authMeta },
        { path: 'profile',       component: ProfileView,       name: 'profile',        meta: authMeta },
        { path: 'order-history', component: OrderHistoryView,  name: 'order-history',  meta: authMeta },
        { path: 'order/:id',     component: OrderDetailView,   name: 'order-detail',   meta: authMeta },
        { path: 'coupons',       component: CouponsView,       name: 'my-coupons',     meta: authMeta },
      ],
    },

    // ── Wildcard ──────────────────────────────────────────────
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// ─── Navigation Guard ─────────────────────────────────────────────────────────
router.beforeEach((to: any, _from: any, next: any) => {
  const authStore = useAuthStore()

  // 1. Yêu cầu đăng nhập
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'login', query: { redirect: to.fullPath } })
  }

  // 2. Yêu cầu quyền admin (role = 1)
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // User đã đăng nhập nhưng không phải admin → về trang chủ
    return next({ name: 'home' })
  }

  // 3. Đã đăng nhập thì không vào trang guest (login/register)
  if (to.meta.guestOnly && authStore.isLoggedIn) {
    // Nếu là admin thì redirect về dashboard, user thường về home
    return authStore.isAdmin
      ? next({ path: '/admin/dashboard' })
      : next({ name: 'home' })
  }

  next()
})
 
export default router
