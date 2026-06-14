import apiClient from "./apiClient";

const postApi = {
  getPosts: () => apiClient.get("/posts"),
  createPost: (payload) => apiClient.post("/posts", payload),
  toggleLike: (postId, payload) => apiClient.post(`/posts/${postId}/like`, payload),
  addComment: (postId, payload) => apiClient.post(`/posts/${postId}/comments`, payload),
  deletePost: (postId) => apiClient.delete(`/posts/${postId}`),
};

export default postApi;
