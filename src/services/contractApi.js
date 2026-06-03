// src/services/contractApi.js
import apiClient from "./apiClient";

/**
 * Khởi tạo đàm phán hợp đồng giữa SME và chuyên gia.
 * @param {{ project_id: string, expert_id: string }} payload
 * @returns {Promise<{ id: string, status: "Draft", [key: string]: any }>}
 */
export async function negotiateContract(payload) {
  return apiClient.post("/contracts/negotiate", payload);
}

/**
 * Ký hợp đồng đã đàm phán xong.
 * @param {string} contractId
 * @returns {Promise<{ id: string, status: "Active", [key: string]: any }>}
 */
export async function signContract(contractId) {
  return apiClient.post(`/contracts/${contractId}/sign`);
}