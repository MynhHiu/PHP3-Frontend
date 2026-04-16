// src/admin/stores/dashboardStore.ts
import { defineStore } from 'pinia'
import { ref }         from 'vue'
import { dashboardApi } from '@/api'

export interface RevenueChartItem {
  label:   string
  revenue: number
  orders:  number
}

export interface TopProduct {
  id:         number
  name:       string
  price:      number
  sold_count: number
}

export interface DashboardStats {
  products: {
    total:     number
    active:    number
    out_stock: number
  }
  categories: { total: number }
  orders: {
    total:   number
    pending: number
    done:    number
  }
  revenue: {
    total:      number
    this_month: number
  }
  users: {
    total:     number
    new_month: number
  }
  reviews: { pending: number }
  revenue_chart: RevenueChartItem[]
  top_products:  TopProduct[]
}

const defaultStats = (): DashboardStats => ({
  products:  { total: 0, active: 0, out_stock: 0 },
  categories:{ total: 0 },
  orders:    { total: 0, pending: 0, done: 0 },
  revenue:   { total: 0, this_month: 0 },
  users:     { total: 0, new_month: 0 },
  reviews:   { pending: 0 },
  revenue_chart: [],
  top_products:  [],
})

export const useDashboardStore = defineStore('dashboard', () => {
  const stats   = ref<DashboardStats>(defaultStats())
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function fetchStats() {
    loading.value = true
    error.value   = null
    try {
      const res  = await dashboardApi.getStats()
      stats.value = res.data
    } catch (e: any) {
      error.value = e?.userMessage || 'Không thể tải thống kê'
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, error, fetchStats }
})