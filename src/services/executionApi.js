// src/services/executionApi.js
// ─────────────────────────────────────────────────────────────────────────────
// API Service – Execution Layer (Milestones)
// Tất cả response đã được Axios interceptor bóc vỏ `data` → nhận thẳng payload.
// ─────────────────────────────────────────────────────────────────────────────

import apiClient from './apiClient'; // adjust path nếu cần

// ── GET ──────────────────────────────────────────────────────────────────────

/**
 * Lấy toàn bộ milestones của một dự án.
 *
 * @param   {string}  projectId
 * @returns {Promise<Array<{
 *   id:        string,
 *   title:     string,
 *   due_date:  string,   // ISO 8601
 *   completed: boolean,
 *   completed_at: string | null,
 * }>>}
 */
export const getMilestones = (projectId) =>
  apiClient.get(`/execution/projects/${projectId}/milestones`);

// ── POST ─────────────────────────────────────────────────────────────────────

/**
 * Tạo milestone mới cho một dự án.
 *
 * @param   {string} projectId
 * @param   {{ title: string, due_date: string }} payload
 * @returns {Promise<{ id: string, title: string, due_date: string, completed: boolean, completed_at: null }>}
 */
export const createMilestone = (projectId, payload) =>
  apiClient.post(`/execution/projects/${projectId}/milestones`, payload);

// ── PATCH ────────────────────────────────────────────────────────────────────

/**
 * Đánh dấu milestone là đã hoàn thành.
 *
 * @param   {string} milestoneId
 * @returns {Promise<{ id: string, completed: true, completed_at: string }>}
 */
export const completeMilestone = (milestoneId) =>
  apiClient.patch(`/execution/milestones/${milestoneId}/complete`);