// src/services/projectApi.js
import apiClient from "./apiClient";

/**
 * Tạo dự án mới.
 *
 * @param {{
 *   sme_id: string,
 *   title: string,
 *   description: string,
 *   required_specialties: string[],
 *   budget: number,
 *   deadline: string          // ISO-8601: "YYYY-MM-DD"
 * }} payload
 * @returns {Promise<{ id: string, [key: string]: any }>}  Object Project từ backend
 */
export async function createProject(payload) {
  return apiClient.post("/projects", payload);
}

/**
 * Lấy danh sách chuyên gia được đề xuất cho một dự án.
 *
 * @param {string} projectId
 * @returns {Promise<Array<{
 *   expert: {
 *     id: string,
 *     expert_name: string,
 *     title: string,
 *     institution: string,
 *     tags: string[],
 *     rating: number,
 *     projects?: number,
 *     available?: boolean,
 *     expertise?: string[],
 *   },
 *   score: number   // 0–100, phần trăm phù hợp
 * }>>}
 */
export async function getMatches(projectId) {
  return apiClient.get(`/matches/${projectId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// BỔ SUNG VÀO: src/services/projectApi.js
// Thêm hàm này vào cuối file (hoặc nhóm cùng các hàm GET khác).
// Interceptor của Axios đã bóc vỏ `response.data`, nên chỉ cần return thẳng.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lấy danh sách dự án theo SME ID.
 *
 * @param {string} smeId  - ID của SME (ví dụ: "SME-001")
 * @returns {Promise<Array<{id: string, title: string, budget: number, deadline: string, status: string}>>}
 */
export const getProjectsBySme = async (smeId) => {
  const response = await apiClient.get(`/projects/sme/${smeId}`);
  // Axios interceptor đã unwrap `data` → response là mảng trực tiếp
  return response;
};

/**
 * Cập nhật trạng thái của project.
 *
 * @param {string} projectId - ID của project
 * @param {string} newStatus - Trạng thái mới (Pending | Negotiating | In Progress | Completed)
 * @returns {Promise<Object>} Updated project object
 */
export const updateProjectStatus = async (projectId, newStatus) => {
  return apiClient.patch(`/projects/${projectId}/status`, {
    status: newStatus,
  });
};

export async function getAllExperts() {
  return apiClient.get(`/experts`); // Gọi API bạn vừa thêm ở Backend
}