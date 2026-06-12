import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import postApi from "../../services/postApi";

export default function PostCard({ post, onLikeToggled, onPostDeleted, isNew = false, isRemoving = false }) {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isModalAnimatingIn, setIsModalAnimatingIn] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [animateIn, setAnimateIn] = useState(!isNew); // Start with true unless isNew

  const isAuthor = user && user.id === post.author_id;

  // Trigger entrance animation for new posts
  useEffect(() => {
    if (isNew) {
      // Small delay to ensure DOM is rendered before animation
      const timer = requestAnimationFrame(() => {
        setAnimateIn(true);
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [isNew]);

  // Trigger modal entrance animation
  useEffect(() => {
    if (showDeleteModal) {
      const timer = requestAnimationFrame(() => {
        setIsModalAnimatingIn(true);
      });
      return () => cancelAnimationFrame(timer);
    } else {
      setIsModalAnimatingIn(false);
    }
  }, [showDeleteModal]);

  const hasLiked = user ? post.likes.includes(user.id) : false;

  const handleToggleLike = async () => {
    if (!user) return;

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);

    try {
      setLoading(true);
      const updatedPost = await postApi.toggleLike(post.id, { user_id: user.id });
      onLikeToggled(updatedPost);
    } catch (err) {
      console.error("Lỗi toggle like:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      setDeleting(true);
      await postApi.deletePost(post.id);
      setShowDeleteModal(false);
      onPostDeleted(post.id);
    } catch (err) {
      console.error("Lỗi xóa bài viết:", err.message);
      alert("Không thể xóa bài viết. Vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  const createdDate = new Date(post.created_at);
  const timeAgo = formatTimeAgo(createdDate);

  return (
    <>
    <div className={`
      rounded-2xl border border-gray-200 bg-white p-6 shadow-sm
      transition-all duration-700 ease-out
      ${animateIn && !isRemoving ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      ${isRemoving ? 'opacity-0 translate-y-8 pointer-events-none' : ''}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900">{post.author_name}</p>
          <p className="text-xs text-gray-500">{post.author_role}</p>
          <p className="text-xs text-gray-400 mt-1">{timeAgo}</p>
        </div>
        {isAuthor && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="text-gray-400 hover:text-red-600 transition"
            title="Xóa bài viết"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <p className="mt-4 text-sm text-gray-700 leading-relaxed">{post.content}</p>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4">
        <button
          onClick={handleToggleLike}
          disabled={loading || !user}
          className={[
            "flex items-center gap-2 text-sm font-medium transition",
            hasLiked
              ? "text-blue-600 hover:text-blue-700"
              : "text-gray-500 hover:text-gray-700",
            loading || !user ? "opacity-60 cursor-not-allowed" : "",
          ].join(" ")}
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill={hasLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              isAnimating
                ? {
                    transform: "scale(1.4) translateY(-6px)",
                    transformOrigin: "center",
                    transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }
                : {
                    transform: "scale(1) translateY(0)",
                    transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }
            }
          >
            <path d="M14 10h5a2 2 0 0 1 1.972 2.416l-3.036 10.068a2 2 0 0 1-1.912 1.516h-7.024a1 1 0 0 1-1-1v-7a3 3 0 0 1 3-3h3zm-11 0h3v10h-3v-10z" />
          </svg>
          {post.likes.length} Thích
        </button>

        {post.comments && post.comments.length > 0 && (
          <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            {post.comments.length} Bình luận
          </button>
        )}
      </div>
    </div>

    {/* Delete Modal */}
    {showDeleteModal && (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: isModalAnimatingIn ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)',
          transition: 'background-color 300ms ease-out',
        }}
      >
        <div
          className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-lg"
          style={{
            transform: isModalAnimatingIn ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-20px)',
            opacity: isModalAnimatingIn ? 1 : 0,
            transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: 'center',
          }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Xóa bài viết?</h3>
          <p className="text-sm text-gray-600 mb-6">Bạn chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.</p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              onClick={handleDeletePost}
              disabled={deleting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2" opacity="0.2" />
                    <path strokeLinecap="round" strokeWidth="2" d="M12 2a10 10 0 0 1 10 10" opacity="0.8" />
                  </svg>
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return date.toLocaleDateString("vi-VN");
}
