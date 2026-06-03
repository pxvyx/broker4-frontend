// src/services/reviewApi.js
import apiClient from "./apiClient";

/**
 * Gửi đánh giá chuyên gia sau khi nghiệm thu dự án.
 * @param {{
 *   project_id: string,
 *   reviewer_sme_id: string,
 *   reviewed_expert_id: string,
 *   rating: number,           // 1–5
 *   feedback: string,
 *   tags?: string[]
 * }} payload
 * @returns {Promise<{ id: string, [key: string]: any }>}
 */
export async function submitReview(payload) {
  return apiClient.post("/reviews", payload);
}