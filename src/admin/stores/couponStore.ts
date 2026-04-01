// src/admin/stores/couponStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { couponApi } from '@/api'

export interface Coupon {
  coupon_code:   string
  discount:      string   // VD: "20%" hoặc "50000"
  description:   string
  minordervalue: number
  usages_count?: number
  created_at?:   string
}

export const useCouponStore = defineStore('coupon', () => {
  const coupons = ref<Coupon[]>([])
  const loading = ref(false)
  const error   = ref<string | null>(null)

  async function fetchAll(params: Record<string, any> = {}) {
    loading.value = true
    error.value   = null
    try {
      const res     = await couponApi.getAll(params)
      coupons.value = res.data.data ?? res.data
    } catch (e: any) {
      error.value   = e.userMessage || 'Không thể tải mã giảm giá'
      coupons.value = []
    } finally {
      loading.value = false
    }
  }

  async function create(data: Record<string, any>) {
    const res       = await couponApi.create(data)
    const c: Coupon = res.data.data ?? res.data
    coupons.value.unshift(c)
    return c
  }

  async function update(coupon_code: string, data: Record<string, any>) {
    const res       = await couponApi.update(coupon_code, data)
    const c: Coupon = res.data.data ?? res.data
    const idx       = coupons.value.findIndex(x => x.coupon_code === coupon_code)
    if (idx !== -1) coupons.value[idx] = c
    return c
  }

  async function remove(coupon_code: string) {
    await couponApi.delete(coupon_code)
    coupons.value = coupons.value.filter(c => c.coupon_code !== coupon_code)
  }

  function getByCode(coupon_code: string) {
    return coupons.value.find(c => c.coupon_code === coupon_code)
  }

  return { coupons, loading, error, fetchAll, create, update, remove, getByCode }
})