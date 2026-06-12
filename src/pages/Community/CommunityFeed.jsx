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
  const [postStates, setPostStates] = useState({}); // Track animation states

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");
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
    setPosts([newPost, ...posts]);
    // Mark new post as "isNew" for animation
    setPostStates((prev) => ({
      ...prev,
      [newPost.id]: { isNew: true, isRemoving: false },
    }));
    // Remove "isNew" flag after animation completes
    setTimeout(() => {
      setPostStates((prev) => ({
        ...prev,
        [newPost.id]: { ...prev[newPost.id], isNew: false },
      }));
    }, 600);
  };

  const handleLikeToggled = (updatedPost) => {
    setPosts(posts.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  };

  const handlePostDeleted = (postId) => {
    // Trigger fade out animation
    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], isRemoving: true },
    }));
    // Remove from DOM after animation completes
    setTimeout(() => {
      setPosts(posts.filter((p) => p.id !== postId));
      setPostStates((prev) => {
        const newStates = { ...prev };
        delete newStates[postId];
        return newStates;
      });
    }, 400);
  };

  return (
    <div className="min-h-[60vh] py-10">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cộng đồng</h1>
          <p className="mt-2 text-gray-500">
            Chia sẻ cơ hội, kinh nghiệm và kết nối với những nhà chuyên gia
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Create post form (only for authenticated users) */}
        {isAuthenticated && <CreatePost onPostCreated={handlePostCreated} />}

        {/* Posts list */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Đang tải bảng tin...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Chưa có bài viết nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => {
              const state = postStates[post.id] || { isNew: false, isRemoving: false };
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
