// src/services/apiClient.js
import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request Interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    // Attach auth token nếu có (JWT / session)
    const token = localStorage.getItem("broker_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data; // { success, message, data }

    // Backend trả HTTP 2xx nhưng success = false → vẫn là lỗi nghiệp vụ
    if (payload?.success === false) {
      const err = new Error(payload.message ?? "Đã xảy ra lỗi từ máy chủ.");
      err.code = "BUSINESS_ERROR";
      err.payload = payload;
      return Promise.reject(err);
    }

    // Bóc vỏ: chỉ trả phần data về cho caller
    return payload?.data !== undefined ? payload.data : payload;
  },
  (error) => {
    if (error.response) {
      // Lỗi HTTP (4xx, 5xx)
      const { status, data } = error.response;
      const message =
        data?.message ?? httpStatusMessage(status) ?? "Lỗi không xác định.";
      const err = new Error(message);
      err.code = "HTTP_ERROR";
      err.status = status;
      err.payload = data;

      // Token hết hạn / không hợp lệ → clear storage và redirect
      if (status === 401) {
        localStorage.removeItem("broker_access_token");
        window.dispatchEvent(new Event("broker:unauthorized"));
      }

      return Promise.reject(err);
    }

    if (error.request) {
      // Không nhận được response (mất mạng, timeout, CORS …)
      const err = new Error(
        "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
      );
      err.code = "NETWORK_ERROR";
      return Promise.reject(err);
    }

    // Lỗi setup request
    return Promise.reject(error);
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────────
function httpStatusMessage(status) {
  const MAP = {
    400: "Dữ liệu gửi lên không hợp lệ.",
    401: "Phiên đăng nhập đã hết hạn.",
    403: "Bạn không có quyền thực hiện thao tác này.",
    404: "Không tìm thấy tài nguyên yêu cầu.",
    422: "Dữ liệu không thể xử lý được.",
    429: "Bạn đang gửi quá nhiều yêu cầu. Hãy thử lại sau.",
    500: "Lỗi nội bộ máy chủ. Vui lòng thử lại.",
    503: "Dịch vụ tạm thời không khả dụng.",
  };
  return MAP[status] ?? `Lỗi HTTP ${status}.`;
}

export default apiClient;