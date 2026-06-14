import apiClient from "./apiClient";

/**
 * NGUỒN GỐC LỖI — Phân tích luồng dữ liệu:
 *
 * Backend Flask trả về:
 *   { success: true, message: "...", data: <actual_data> }
 *
 * apiClient (Axios instance) đã cấu hình interceptor:
 *   response.data.data  →  trả thẳng <actual_data>
 *
 * Bằng chứng: loadPosts() gọi setPosts(data) thành công → data là Array,
 * nghĩa là apiClient đã tự bóc cả 2 lớp rồi.
 *
 * ❌ VẤN ĐỀ CŨ: PostCard cố bóc thêm:
 *   response.data    → undefined  (vì response đã là post object rồi)
 *   response.data || response → fallback về response (may mắn đúng)
 *   Nhưng sau đó check actualPost.success → undefined → KHÔNG bóc thêm
 *   → Kết quả cuối: đúng object, nhưng CỰC KỲ dễ vỡ và khó debug
 *
 * ✅ GIẢI PHÁP: Mọi hàm mutation đều cần qua một chuẩn hoá tập trung tại đây.
 * PostCard.jsx chỉ nhận dữ liệu sạch, không cần xử lý gì thêm.
 */

/**
 * Chuẩn hoá response — phòng thủ trước 3 tình huống:
 *
 * Tình huống 1 (có interceptor bóc cả 2 lớp):
 *   input  → { id: "POST-1", likes: [...], comments: [...] }
 *   output → { id: "POST-1", likes: [...], comments: [...] }  ✓
 *
 * Tình huống 2 (interceptor chỉ bóc 1 lớp — trả về wrapper):
 *   input  → { success: true, data: { id: "POST-1", ... } }
 *   output → { id: "POST-1", ... }  ✓
 *
 * Tình huống 3 (không có interceptor — raw Axios):
 *   input  → { data: { success: true, data: { id: "POST-1", ... } }, status: 200 }
 *   output → { id: "POST-1", ... }  ✓
 */
function normalizePostResponse(res) {
  // Tầng Axios: nếu có trường `status` HTTP và `data` → raw Axios response
  const body =
    res !== null &&
    typeof res === "object" &&
    "status" in res &&
    "data" in res
      ? res.data
      : res;

  // Tầng Wrapper Backend: nếu còn trường `success` + `data` → bóc thêm
  if (
    body !== null &&
    typeof body === "object" &&
    "success" in body &&
    "data" in body
  ) {
    return body.data;
  }

  // Đã sạch — trả thẳng
  return body;
}

const postApi = {
  // GET /posts — trả về Array<Post>
  getPosts: () =>
    apiClient.get("/posts").then((res) => {
      const data = normalizePostResponse(res);
      // Đảm bảo luôn là mảng, tránh crash nếu backend trả về null/undefined
      return Array.isArray(data) ? data : [];
    }),

  // POST /posts — trả về Post object vừa tạo
  createPost: (payload) =>
    apiClient.post("/posts", payload).then(normalizePostResponse),

  // POST /posts/:id/like — trả về Post object ĐÃ CẬP NHẬT (likes mới)
  toggleLike: (postId, payload) =>
    apiClient
      .post(`/posts/${postId}/like`, payload)
      .then(normalizePostResponse),

  // POST /posts/:id/comments — trả về Post object ĐÃ CẬP NHẬT (comments mới)
  addComment: (postId, payload) =>
    apiClient
      .post(`/posts/${postId}/comments`, payload)
      .then(normalizePostResponse),

  // DELETE /posts/:id — không cần parse body trả về
  deletePost: (postId) => apiClient.delete(`/posts/${postId}`),
};

export default postApi;