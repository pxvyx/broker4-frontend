import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import CreatePost from "../../components/community/CreatePost";
import PostCard from "../../components/community/PostCard";
import postApi from "../../services/postApi";

export default function CommunityFeed() {
  const { isAuthenticated } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postStates, setPostStates] = useState({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");
      // postApi.getPosts() giờ luôn trả về Array<Post> sạch
      const data = await postApi.getPosts();
      setPosts(data);
      setPostStates({});
    } catch (err) {
      setError(err.message || "Không thể tải bảng tin.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    // ✅ Functional update: luôn dùng prev để tránh stale closure
    setPosts((prev) => [newPost, ...prev]);

    setPostStates((prev) => ({
      ...prev,
      [newPost.id]: { isNew: true, isRemoving: false },
    }));

    setTimeout(() => {
      setPostStates((prev) => ({
        ...prev,
        [newPost.id]: { ...prev[newPost.id], isNew: false },
      }));
    }, 600);
  };

  // ─────────────────────────────────────────────────────────────
  // handleLikeToggled
  //
  // ❌ LỖI CŨ:
  //   setPosts(posts.map(...))
  //   → `posts` bị "đóng băng" theo giá trị tại thời điểm render
  //     tạo ra hàm này (stale closure).
  //   → Trong các trường hợp concurrent update hoặc nhiều
  //     PostCard cùng gọi onLikeToggled gần nhau, hàm map sẽ
  //     chạy trên một snapshot cũ của `posts`, khiến một số
  //     update bị ghi đè và biến mất.
  //
  // ✅ FIX: Luôn dùng functional update `setPosts(prev => ...)`.
  //   `prev` là giá trị posts MỚI NHẤT tại thời điểm React
  //   xử lý update, hoàn toàn bất kể closure bao giờ được tạo.
  // ─────────────────────────────────────────────────────────────
  const handleLikeToggled = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
    );
  };

  // ─────────────────────────────────────────────────────────────
  // handlePostDeleted
  //
  // ✅ Áp dụng cùng pattern functional update cho nhất quán
  // ─────────────────────────────────────────────────────────────
  const handlePostDeleted = (postId) => {
    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], isRemoving: true },
    }));

    setTimeout(() => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setPostStates((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
    }, 400);
  };

  return (
    <div className="min-h-[60vh] py-10">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cộng đồng</h1>
          <p className="mt-2 text-gray-500">
            Chia sẻ cơ hội, kinh nghiệm và kết nối với những nhà chuyên gia
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isAuthenticated && <CreatePost onPostCreated={handlePostCreated} />}

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Đang tải bảng tin...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              Chưa có bài viết nào. Hãy là người đầu tiên!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const state = postStates[post.id] || {
                isNew: false,
                isRemoving: false,
              };
              return (
                <PostCard
                  key={post.id}
                  post={post}
                  onLikeToggled={handleLikeToggled}
                  onPostDeleted={handlePostDeleted}
                  isNew={state.isNew}
                  isRemoving={state.isRemoving}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}