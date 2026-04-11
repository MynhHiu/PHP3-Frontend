// src/user/stores/reviewStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reviewApi } from '@/api'

export interface Review {
  id: number
  user_id: number
  product_sku_code: string
  rating: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user_name?: string
  user_avatar?: string
  product_name?: string
  product_image?: string
}

export const useReviewStore = defineStore('review', () => {
  const reviews      = ref<Review[]>([])   // đánh giá công khai của 1 sản phẩm
  const myReviews    = ref<Review[]>([])   // đánh giá của user hiện tại
  const loading      = ref(false)
  const error        = ref<string | null>(null)
  const submitStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function fetchByProduct(productId: number) {
    loading.value = true
    try {
      const res    = await reviewApi.getByProduct(productId)
      reviews.value = res.data?.data ?? []
    } catch {
      reviews.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchMyReviews() {
    try {
      const res       = await reviewApi.myReviews()
      myReviews.value = res.data?.data ?? []
    } catch {
      myReviews.value = []
    }
  }

  async function submitReview(data: {
    product_sku_code: string
    rating: number
    comment: string
  }) {
    submitStatus.value = 'loading'
    error.value        = null
    try {
      await reviewApi.submit(data)
      submitStatus.value = 'success'
      await fetchMyReviews()
    } catch (e: any) {
      error.value        = e?.userMessage ?? 'Gửi đánh giá thất bại'
      submitStatus.value = 'error'
      throw e
    }
  }

  function resetSubmit() {
    submitStatus.value = 'idle'
    error.value        = null
  }

  return {
    reviews, myReviews, loading, error, submitStatus,
    fetchByProduct, fetchMyReviews, submitReview, resetSubmit,
  }
})