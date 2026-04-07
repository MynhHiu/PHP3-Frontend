import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './authStore'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VariantOption {
  id: number
  product_variant_id: number
  option_values: string   // text (VD: "Đỏ", "XL", "500ml")
}

export interface ProductVariant {
  id: number
  variant_name: string
  product_id: number
  options: VariantOption[]
}

export interface ProductCombination {
  id: number
  options_id: number
  sku_code: string
  option?: VariantOption & { variant?: ProductVariant }
}

export interface SkuRow {
  sku_code: string
  product_id: number
  price: number
  quantity: number
  status: 'active' | 'draft' | 'hidden'
  combination?: string   // label hiển thị, không lưu DB
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useVariantStore = defineStore('variant', () => {
  const variants = ref<ProductVariant[]>([])
  const skus = ref<SkuRow[]>([])
  const combinations = ref<ProductCombination[]>([])
  const loading = ref(false)

  const API = () => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    return base.endsWith('/api') ? base : base + '/api'
  }

  function headers(): Record<string, string> {
    const auth = useAuthStore()
    const h: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' }
    if (auth.token) h['Authorization'] = `Bearer ${auth.token}`
    return h
  }

  async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API()}/admin/${path}`, {
      method,
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const msg = err.message || `HTTP ${res.status}`
      const e = new Error(msg) as Error & { userMessage: string }
      e.userMessage = msg
      throw e
    }
    if (res.status === 204) return undefined as T
    return res.json()
  }

  // ── Variants ──────────────────────────────────────────────────────────────

  async function fetchVariants(productId: number) {
    loading.value = true
    try {
      variants.value = await req<ProductVariant[]>('GET', `products/${productId}/variants`)
    } finally {
      loading.value = false
    }
  }

  async function createVariant(productId: number, variantName: string): Promise<ProductVariant> {
    const created = await req<ProductVariant>('POST', `products/${productId}/variants`, {
      variant_name: variantName,
    })
    variants.value.push(created)
    return created
  }

  async function updateVariant(variantId: number, variantName: string) {
    const updated = await req<ProductVariant>('PUT', `variants/${variantId}`, {
      variant_name: variantName,
    })
    const idx = variants.value.findIndex(v => v.id === variantId)
    if (idx !== -1) variants.value[idx] = updated
  }

  async function deleteVariant(variantId: number) {
    await req('DELETE', `variants/${variantId}`)
    variants.value = variants.value.filter(v => v.id !== variantId)
  }

  // ── Options ───────────────────────────────────────────────────────────────

  async function createOption(variantId: number, optionValue: string): Promise<VariantOption> {
    const created = await req<VariantOption>('POST', `variants/${variantId}/options`, {
      option_values: optionValue,
    })
    const variant = variants.value.find(v => v.id === variantId)
    if (variant) variant.options.push(created)
    return created
  }

  async function deleteOption(variantId: number, optionId: number) {
    await req('DELETE', `options/${optionId}`)
    const variant = variants.value.find(v => v.id === variantId)
    if (variant) variant.options = variant.options.filter(o => o.id !== optionId)
  }

  // ── SKUs ──────────────────────────────────────────────────────────────────

  async function fetchSkus(productId: number) {
    loading.value = true
    try {
      const res = await fetch(`${API()}/admin/products/${productId}/skus`, {
        headers: headers()
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      skus.value = (Array.isArray(data) ? data : data.data ?? [])
        .map((s: SkuRow) => ({ ...s, combination: '' }))
    } finally {
      loading.value = false
    }
  }

  async function saveSku(productId: number, sku: Partial<SkuRow>) {
    const isNew = !skus.value.find(s => s.sku_code === sku.sku_code)

    if (isNew) {
      const created = await req<SkuRow>('POST', `products/${productId}/skus`, {
        sku_code: sku.sku_code,
        price: sku.price,
        quantity: sku.quantity,
        status: sku.status,
      })
      skus.value.push({ ...created, combination: '' })
    } else {
      const updated = await req<SkuRow>('PUT', `skus/${sku.sku_code}`, {
        price: sku.price,
        quantity: sku.quantity,
        status: sku.status,
      })
      const idx = skus.value.findIndex(s => s.sku_code === sku.sku_code)
      if (idx !== -1) skus.value[idx] = { ...updated, combination: '' }
    }
  }

  async function deleteSku(skuCode: string) {
    await req('DELETE', `skus/${skuCode}`)
    skus.value = skus.value.filter(s => s.sku_code !== skuCode)
  }

  // ── Combinations ──────────────────────────────────────────────────────────

  async function fetchCombinations(productId: number) {
    combinations.value = await req<ProductCombination[]>('GET', `products/${productId}/combinations`)
  }

  async function createCombination(optionsId: number, skuCode: string): Promise<ProductCombination> {
    const created = await req<ProductCombination>('POST', 'combinations', {
      options_id: optionsId,
      sku_code: skuCode,
    })
    combinations.value.push(created)
    return created
  }

  async function deleteCombination(id: number) {
    await req('DELETE', `combinations/${id}`)
    combinations.value = combinations.value.filter(c => c.id !== id)
  }

  return {
    variants,
    skus,
    combinations,
    loading,
    fetchVariants,
    createVariant,
    updateVariant,
    deleteVariant,
    createOption,
    deleteOption,
    fetchSkus,
    saveSku,
    deleteSku,
    fetchCombinations,
    createCombination,
    deleteCombination,
  }
})