import { defineStore } from 'pinia'
import { ref } from 'vue'
import { variantApi } from '@/api'

// ── Khớp với bảng `product_variants` ──────────────────────────────────────
export interface ProductVariant {
  id: number
  variant_name: string   // VARCHAR(255)
  product_id: number     // INT(11)
  created_at?: string    // DATETIME
  options?: VariantOption[]
}

// ── Khớp với bảng `variant_options` ───────────────────────────────────────
export interface VariantOption {
  id: number
  product_variant_id: number  // INT(11) FK → product_variants.id
  option_values: number        // INT(11)  ← database lưu số (ví dụ: ID của giá trị)
  option_label?: string        // label hiển thị (frontend tự quản lý, không có trong DB)
  created_at?: string
}

// ── Khớp với bảng `product_skus` ──────────────────────────────────────────
export interface ProductSku {
  sku_code: string        // VARCHAR(255) PRIMARY KEY
  product_id: number      // INT(11) FK → products.id
  price: number           // DECIMAL(10,2)
  quantity: number        // INT(11)
  status: string          // VARCHAR(50) — 'active' | 'inactive'
  created_at?: string     // DATETIME
  updated_at?: string     // DATETIME
  combination?: string    // Frontend only: tên ghép từ options
}

// ── Khớp với bảng `product_combination_options` ───────────────────────────
export interface ProductCombinationOption {
  id: number
  options_id: number      // INT(11) FK → variant_options.id
  sku_code: string        // VARCHAR(255) FK → product_skus.sku_code
  created_at: string      // DATETIME
}

export const useVariantStore = defineStore('variant', () => {
  const variants    = ref<ProductVariant[]>([])
  const skus        = ref<ProductSku[]>([])
  const combinations = ref<ProductCombinationOption[]>([])
  const loading     = ref(false)
  const error       = ref<string | null>(null)

  // ── Variants ──────────────────────────────────────────────────────────
  async function fetchVariants(productId: number) {
    loading.value = true; error.value = null
    try {
      const res = await variantApi.getVariants(productId)
      variants.value = res.data.data ?? res.data
    } catch (e: any) {
      error.value = e.userMessage || 'Không thể tải biến thể'
      variants.value = []
    } finally { loading.value = false }
  }

  async function createVariant(productId: number, variantName: string) {
    // POST body: { variant_name, product_id }
    const res = await variantApi.createVariant(productId, {
      variant_name: variantName,
      product_id: productId,
    })
    const v: ProductVariant = res.data.data ?? res.data
    variants.value.push({ ...v, options: [] })
    return v
  }

  async function updateVariant(id: number, variantName: string) {
    // PUT body: { variant_name }
    await variantApi.updateVariant(id, { variant_name: variantName })
    const v = variants.value.find(x => x.id === id)
    if (v) v.variant_name = variantName
  }

  async function deleteVariant(id: number) {
    await variantApi.deleteVariant(id)
    variants.value = variants.value.filter(v => v.id !== id)
  }

  // ── Variant Options ───────────────────────────────────────────────────
  async function createOption(variantId: number, optionValues: number, optionLabel?: string) {
    // POST body: { product_variant_id, option_values }
    // option_values là INT(11) theo database
    const res = await variantApi.createOption(variantId, {
      product_variant_id: variantId,
      option_values: optionValues,
    })
    const opt: VariantOption = { ...(res.data.data ?? res.data), option_label: optionLabel }
    const v = variants.value.find(x => x.id === variantId)
    if (v) { if (!v.options) v.options = []; v.options.push(opt) }
    return opt
  }

  async function deleteOption(variantId: number, optionId: number) {
    await variantApi.deleteOption(optionId)
    const v = variants.value.find(x => x.id === variantId)
    if (v?.options) v.options = v.options.filter(o => o.id !== optionId)
  }

  // ── SKUs ──────────────────────────────────────────────────────────────
  async function fetchSkus(productId: number) {
    try {
      const res = await variantApi.getSkus(productId)
      skus.value = res.data.data ?? res.data
    } catch { skus.value = [] }
  }

  async function saveSku(productId: number, sku: Partial<ProductSku> & { sku_code: string }) {
    const existing = skus.value.find(s => s.sku_code === sku.sku_code)
    // Loại bỏ field combination vì không có trong DB (frontend only)
    const { combination, ...skuData } = sku as any
    if (existing) {
      await variantApi.updateSku(sku.sku_code, skuData)
      Object.assign(existing, sku)
    } else {
      // POST body: { sku_code, product_id, price, quantity, status }
      const res = await variantApi.createSku(productId, {
        ...skuData,
        product_id: productId,
      })
      skus.value.push({ ...(res.data.data ?? res.data), combination })
    }
  }

  async function deleteSku(skuCode: string) {
    await variantApi.deleteSku(skuCode)
    skus.value = skus.value.filter(s => s.sku_code !== skuCode)
  }

  // ── Combination Options ───────────────────────────────────────────────
  async function saveCombinationOption(skuCode: string, optionsId: number) {
    // POST body: { options_id, sku_code }
    const res = await variantApi.createCombinationOption({ options_id: optionsId, sku_code: skuCode })
    combinations.value.push(res.data.data ?? res.data)
  }

  async function deleteCombinationOption(id: number) {
    await variantApi.deleteCombinationOption(id)
    combinations.value = combinations.value.filter(c => c.id !== id)
  }

  function reset() {
    variants.value = []; skus.value = []; combinations.value = []
  }

  return {
    variants, skus, combinations, loading, error,
    fetchVariants, createVariant, updateVariant, deleteVariant,
    createOption, deleteOption,
    fetchSkus, saveSku, deleteSku,
    saveCombinationOption, deleteCombinationOption,
    reset,
  }
})