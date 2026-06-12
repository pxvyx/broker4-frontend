import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import postApi from "../../services/postApi";

export default function CreatePost({ onPostCreated }) {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!content.trim()) {
      setError("Vui lòng nhập nội dung bài viết.");
      return;
    }

    try {
      setLoading(true);
      const newPost = await postApi.createPost({
        author_id: user.id,
        author_name: user.name,
        author_role: user.role,
        content: content.trim(),
      });
      setSuccess(true);
      setContent("");
      setTimeout(() => setSuccess(false), 2000);
      onPostCreated(newPost);
    } catch (err) {
      setError(err.message || "Không thể tạo bài viết.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 ${
      loading ? "opacity-75" : "opacity-100"
    }`}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }
        .spinner {
          animation: spin 0.8s linear infinite;
        }
        .animate-success {
          animation: slideUp 0.3s ease-out;
        }
        .animate-out {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">{user.role}</p>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
          placeholder="Chia sẻ cơ hội, kinh nghiệm, hoặc câu hỏi của bạn..."
          className="w-full rounded-2xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
          rows={4}
        />

        {error && (
          <p className="text-sm text-red-600 animate-success">{error}</p>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium animate-success">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Đăng bài thành công!
          </div>
        )}

        <button
          type="submit"
          disabled={loading || success}
          className={`relative w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-300 ${
            success
              ? "bg-green-600 hover:bg-green-700"
              : "bg-blue-600 hover:bg-blue-700"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {loading && (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2" opacity="0.2" />
                <path strokeLinecap="round" strokeWidth="2" d="M12 2a10 10 0 0 1 10 10" opacity="0.8" />
              </svg>
              Đang đăng...
            </span>
          )}
          {success && (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Thành công
            </span>
          )}
          {!loading && !success && "Đăng bài"}
        </button>
      </form>
    </div>
  );
}
