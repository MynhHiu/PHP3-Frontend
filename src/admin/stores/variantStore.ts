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
    const res = await fetch(`${API()}/admin/products/${productId}`, { headers: headers() })
    if (!res.ok) return
    const data = await res.json()
    skus.value = (data.skus ?? []).map((s: SkuRow) => ({ ...s, combination: '' }))
  }

  async function saveSku(productId: number, sku: Partial<SkuRow>) {
    // Kiểm tra đã tồn tại chưa (updateOrCreate qua backend)
    const fd = new FormData()
    fd.append('_method', 'PUT')
    fd.append('name', '')             // placeholder, backend sẽ giữ nguyên
    // Dùng endpoint riêng của SKU nếu có, hoặc dùng product update
    // Hiện tại dùng product update với skus array
    const existing = skus.value.map(s => ({
      sku_code: s.sku_code,
      price: s.sku_code === sku.sku_code ? sku.price! : s.price,
      quantity: s.sku_code === sku.sku_code ? sku.quantity! : s.quantity,
      status: s.sku_code === sku.sku_code ? sku.status! : s.status,
    }))

    // Nếu là SKU mới thì thêm vào
    if (!skus.value.find(s => s.sku_code === sku.sku_code)) {
      existing.push({
        sku_code: sku.sku_code!,
        price: sku.price!,
        quantity: sku.quantity!,
        status: sku.status!,
      })
    }

    const skuFd = new FormData()
    skuFd.append('_method', 'PUT')

    // Lấy thông tin product hiện tại để giữ nguyên các field
    const pRes = await fetch(`${API()}/admin/products/${productId}`, { headers: { Authorization: headers().Authorization ?? "", Accept: 'application/json' } })
    const pData = await pRes.json()
    skuFd.append('name', pData.name)
    skuFd.append('categories_id', String(pData.categories_id))
    if (pData.brand_id) skuFd.append('brand_id', String(pData.brand_id))
    if (pData.description) skuFd.append('description', pData.description)

    existing.forEach((s, i) => {
      skuFd.append(`skus[${i}][sku_code]`, s.sku_code)
      skuFd.append(`skus[${i}][price]`, String(s.price))
      skuFd.append(`skus[${i}][quantity]`, String(s.quantity))
      skuFd.append(`skus[${i}][status]`, s.status)
    })

    const authStore = useAuthStore()
    const updateRes = await fetch(`${API()}/admin/products/${productId}`, {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: authStore.token ? `Bearer ${authStore.token}` : '' },
      body: skuFd,
    })

    if (updateRes.ok) {
      const updated = await updateRes.json()
      skus.value = (updated.skus ?? []).map((s: SkuRow) => ({ ...s, combination: '' }))
    }
  }

  async function deleteSku(skuCode: string) {
    skus.value = skus.value.filter(s => s.sku_code !== skuCode)
    // Không có endpoint riêng — sẽ sync khi save tiếp theo
    // Hoặc dùng product update với danh sách SKU mới
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