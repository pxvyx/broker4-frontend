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
    // Ưu tiên dùng Firebase Token làm chứng minh thư (Bearer Token) chính thức
    const firebaseToken = localStorage.getItem("broker_firebase_token");
    const accessToken = localStorage.getItem("broker_access_token");
    
    // Gộp chung: Gửi token nào có sẵn (Ưu tiên Firebase)
    const token = firebaseToken || accessToken;
    
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
    const payload = response.data; 

    if (payload?.success === false) {
      const err = new Error(payload.message ?? "Đã xảy ra lỗi từ máy chủ.");
      err.code = "BUSINESS_ERROR";
      err.payload = payload;
      return Promise.reject(err);
    }

    return payload?.data !== undefined ? payload.data : payload;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message =
        data?.message ?? httpStatusMessage(status) ?? "Lỗi không xác định.";
      const err = new Error(message);
      err.code = "HTTP_ERROR";
      err.status = status;
      err.payload = data;

      // SỬA LỖI: Khi Token hết hạn (401), phải xóa SẠCH mọi token
      if (status === 401) {
        localStorage.removeItem("broker_access_token");
        localStorage.removeItem("broker_firebase_token"); // Đã bổ sung
        window.dispatchEvent(new Event("broker:unauthorized"));
      }

      return Promise.reject(err);
    }

    if (error.request) {
      const err = new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.");
      err.code = "NETWORK_ERROR";
      return Promise.reject(err);
    }

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