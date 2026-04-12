// src/composables/useGhn.ts
// Composable gọi GHN API qua Laravel backend (proxy)
// Đặt file này ở: src/composables/useGhn.ts

import { ref } from 'vue'
import api from '@/api/index'

export interface GhnProvince {
  ProvinceID: number
  ProvinceName: string
}

export interface GhnDistrict {
  DistrictID: number
  DistrictName: string
  ProvinceID: number
}

export interface GhnWard {
  WardCode: string
  WardName: string
  DistrictID: number
}

export function useGhn() {
  const provinces = ref<GhnProvince[]>([])
  const districts = ref<GhnDistrict[]>([])
  const wards     = ref<GhnWard[]>([])

  const loadingProvinces = ref(false)
  const loadingDistricts = ref(false)
  const loadingWards     = ref(false)

  // ── Lấy danh sách tỉnh/thành ──────────────────────────────────────────────
  async function fetchProvinces() {
    if (provinces.value.length > 0) return // cache
    loadingProvinces.value = true
    try {
      const res = await api.get('/shipping/provinces')
      provinces.value = res.data ?? []
    } catch {
      provinces.value = []
    } finally {
      loadingProvinces.value = false
    }
  }

  // ── Lấy danh sách quận/huyện theo tỉnh ────────────────────────────────────
  async function fetchDistricts(provinceId: number) {
    districts.value = []
    wards.value = []
    if (!provinceId) return
    loadingDistricts.value = true
    try {
      const res = await api.get('/shipping/districts', { params: { province_id: provinceId } })
      districts.value = res.data ?? []
    } catch {
      districts.value = []
    } finally {
      loadingDistricts.value = false
    }
  }

  // ── Lấy danh sách phường/xã theo huyện ────────────────────────────────────
  async function fetchWards(districtId: number) {
    wards.value = []
    if (!districtId) return
    loadingWards.value = true
    try {
      const res = await api.get('/shipping/wards', { params: { district_id: districtId } })
      wards.value = res.data ?? []
    } catch {
      wards.value = []
    } finally {
      loadingWards.value = false
    }
  }

  // ── Tính phí ship ──────────────────────────────────────────────────────────
  async function calculateFee(toDistrictId: number, toWardCode: string, total: number): Promise<number> {
    if (!toDistrictId || !toWardCode) return 30_000
    try {
      const res = await api.post('/shipping/calculate-fee', {
        to_district_id: toDistrictId,
        to_ward_code:   toWardCode,
        weight:         500,
        total,
      })
      return res.data.shipping_fee ?? 30_000
    } catch {
      return 30_000
    }
  }

  return {
    provinces, districts, wards,
    loadingProvinces, loadingDistricts, loadingWards,
    fetchProvinces, fetchDistricts, fetchWards, calculateFee,
  }
}