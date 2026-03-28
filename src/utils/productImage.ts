/**
 * src/utils/productImage.ts
 * ─────────────────────────────────────────────────────────────────
 * Helper resolve ảnh sản phẩm từ thư mục src/assets/image/
 *
 * DB lưu image_url dạng:  "quat_panasonic.jpg"  hoặc  "products/abc.jpg"
 * File ảnh thực tế nằm ở: src/assets/image/quat_panasonic.jpg
 *
 * Cách dùng trong Vue:
 *   import { resolveProductImage } from '@/utils/productImage'
 *   <img :src="resolveProductImage(p.image_url)" />
 * ─────────────────────────────────────────────────────────────────
 */

// Import tất cả ảnh trong thư mục assets/image (Vite glob import)
const imageModules = import.meta.glob('@/assets/image/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>

/**
 * Tạo map: filename → URL đã được Vite xử lý
 * Ví dụ: { "quat_panasonic.jpg": "/src/assets/image/quat_panasonic.jpg" }
 */
const imageMap: Record<string, string> = {}
for (const path in imageModules) {
  // Lấy phần tên file từ path đầy đủ
  const filename = path.split('/').pop() ?? ''
  imageMap[filename] = imageModules[path]
}

/** Ảnh placeholder khi không tìm thấy */
const PLACEHOLDER = 'https://via.placeholder.com/260x260/e8f5e9/2d8c4e?text=SP'

/**
 * Nhận vào image_url từ DB, trả về URL ảnh để dùng trong <img :src="...">
 *
 * Thứ tự ưu tiên:
 *   1. Nếu là URL đầy đủ (http/https) → dùng luôn (ảnh từ backend storage)
 *   2. Lấy phần tên file cuối cùng → tìm trong assets/image/
 *   3. Không tìm thấy → trả về placeholder
 */
export function resolveProductImage(imageUrl: string | null | undefined): string {
  if (!imageUrl) return PLACEHOLDER

  // Trường hợp 1: URL đầy đủ từ backend (sau khi backend đã prepend APP_URL)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Thử lấy tên file từ URL và tìm trong local assets trước
    const filename = imageUrl.split('/').pop() ?? ''
    if (filename && imageMap[filename]) return imageMap[filename]
    // Không có local → dùng URL backend
    return imageUrl
  }

  // Trường hợp 2: Tên file thuần hoặc path (vd: "quat_panasonic.jpg" hoặc "products/quat_panasonic.jpg")
  const filename = imageUrl.split('/').pop() ?? imageUrl
  if (imageMap[filename]) return imageMap[filename]

  // Trường hợp 3: Không tìm thấy
  return PLACEHOLDER
}

export { PLACEHOLDER }