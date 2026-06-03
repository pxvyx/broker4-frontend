// src/pages/Matching/MatchingCenter.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardBody } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { getMatches, getAllExperts } from "../../services/projectApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_TAGS = [
  "Tất cả",
  "AI/ML",
  "Phân tích dữ liệu",
  "IoT",
  "An toàn thông tin",
  "Thương mại điện tử",
  "ERP",
];

// Avatar initials từ tên chuyên gia
function getInitials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// Màu avatar xoay vòng theo index
const AVATAR_COLORS = [
  "bg-blue-600",
  "bg-emerald-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-cyan-600",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function MatchBadge({ score }) {
  const color =
    score >= 95
      ? "bg-green-100 text-green-700"
      : score >= 85
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      {score}% phù hợp
    </span>
  );
}

function StarRating({ value }) {
  return (
    <span className="flex items-center gap-1 text-xs text-gray-500">
      <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {value ?? "—"}
    </span>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ExpertCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-2.5 bg-gray-200 rounded w-1/2" />
          <div className="h-2 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-2 bg-gray-100 rounded" />
        <div className="h-2 bg-gray-100 rounded w-5/6" />
      </div>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-5 w-16 bg-gray-100 rounded-full" />
        ))}
      </div>
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <div className="flex-1 h-8 bg-gray-100 rounded-md" />
        <div className="flex-1 h-8 bg-gray-100 rounded-md" />
      </div>
    </div>
  );
}

// ─── Expert card ──────────────────────────────────────────────────────────────

function ExpertCard({ match, index, isSelected, onToggle }) {
  const { expert, score } = match;
  const initials = getInitials(expert.expert_name);
  const colorClass = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <Card
      className={[
        "transition-all duration-200 hover:shadow-xl",
        isSelected ? "ring-2 ring-blue-500 ring-offset-1" : "",
      ].join(" ")}
    >
      <CardBody className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`${colorClass} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md`}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 text-sm leading-tight">
                  {expert.expert_name}
                </p>
                <p className="text-xs text-blue-600 font-medium mt-0.5">
                  {expert.title}
                </p>
              </div>
              <MatchBadge score={Math.round(score)} />
            </div>
            <p className="text-xs text-gray-400 mt-1 truncate">
              {expert.institution}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-3">
          <StarRating value={expert.rating} />
          {expert.projects != null && (
            <span className="text-xs text-gray-400">
              {expert.projects} dự án
            </span>
          )}
          <span
            className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
              expert.available !== false
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {expert.available !== false ? "Sẵn sàng" : "Đang bận"}
          </span>
        </div>

        {/* Domain tags */}
        {Array.isArray(expert.tags) && expert.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {expert.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Tech expertise */}
        {Array.isArray(expert.expertise) && expert.expertise.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {expert.expertise.map((e) => (
              <span
                key={e}
                className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono"
              >
                {e}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            {/* NÚT CHỌN CHỈ HIỆN KHI ĐANG MATCHING (CÓ SCORE) */}
            {score !== null && (
              <Button
                variant={isSelected ? "primary" : "secondary"}
                size="sm"
                className="flex-1"
                onClick={() => onToggle(expert.id)}
              >
                {isSelected ? "✓ Đã chọn" : "Chọn"}
              </Button>
            )}
            <Button variant="ghost" size="sm" className="flex-1">
              Xem hồ sơ
            </Button>
          </div>
      </CardBody>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MatchingCenter() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const projectId = state?.project_id ?? null;
  const auditData = state?.auditData ?? null;

  // ── API state ────────────────────────────────────────────────────────────────
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [searchQ, setSearchQ] = useState("");
  const [selected, setSelected] = useState([]);
  const [dismissBanner, setDismissBanner] = useState(false);

  // ── Fetch matches ─────────────────────────────────────────────────────────────
 // Thay thế hàm fetchMatches cũ bằng đoạn này:
  const fetchMatches = useCallback(async (id) => {
    setLoading(true);
    setApiError(null);
    try {
      if (id) {
        // Chế độ Matching (có project_id)
        const data = await getMatches(id);
        setMatches(Array.isArray(data) ? data : []);
      } else {
        // Chế độ Danh bạ (không có project_id)
        const data = await getAllExperts();
        // Backend trả về list chuyên gia, ta cần bọc lại cho giống format của match: { expert, score }
        const mappedData = (Array.isArray(data) ? data : []).map(exp => ({ expert: exp, score: null }));
        setMatches(mappedData);
      }
    } catch (err) {
      setApiError(err.message ?? "Không thể tải danh sách chuyên gia.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Đổi useEffect cũ thành:
  useEffect(() => {
    fetchMatches(projectId); // Truyền null nếu không có projectId
  }, [projectId, fetchMatches]);

  // ── Filter + search ───────────────────────────────────────────────────────────
  const filtered = matches.filter(({ expert }) => {
    const tags = Array.isArray(expert.tags) ? expert.tags : [];
    const matchTag =
      activeFilter === "Tất cả" ||
      tags.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()));
    const matchSearch =
      !searchQ ||
      expert.expert_name?.toLowerCase().includes(searchQ.toLowerCase()) ||
      expert.title?.toLowerCase().includes(searchQ.toLowerCase()) ||
      tags.some((t) => t.toLowerCase().includes(searchQ.toLowerCase()));
    return matchTag && matchSearch;
  });

  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          {/* Success banner */}
          {auditData && !dismissBanner && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 mb-6">
              <svg
                className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
                fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-800">
                  Khảo sát đã được phân tích thành công!
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Hiển thị chuyên gia phù hợp nhất cho{" "}
                  <strong>{auditData.companyName}</strong> – ngành{" "}
                  <strong>{auditData.sector}</strong>.
                  {projectId && (
                    <span className="ml-1 font-mono text-blue-400">
                      [{projectId}]
                    </span>
                  )}
                </p>
              </div>
              <button
                className="ml-auto text-blue-400 hover:text-blue-600 shrink-0"
                onClick={() => setDismissBanner(true)}
                aria-label="Đóng"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* No project id warning */}
          {!projectId && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 mb-6">
              <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <div className="flex-1 text-sm text-amber-700">
                Chưa có project ID. Vui lòng hoàn thành{" "}
                <button
                  className="underline font-medium hover:text-amber-900"
                  onClick={() => navigate("/audit")}
                >
                  đánh giá nhu cầu
                </button>{" "}
                trước.
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Trung tâm kết nối
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {loading
                  ? "Đang tải danh sách chuyên gia..."
                  : `${filtered.length} chuyên gia & phòng lab được đề xuất`}
              </p>
            </div>

            {selected.length > 0 && (
              <Button
                variant="primary"
                onClick={() =>
                  navigate("/dashboard", {
                    state: { selectedExperts: selected, project_id: projectId },
                  })
                }
              >
                Tạo dự án với {selected.length} chuyên gia →
              </Button>
            )}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              placeholder="Tìm chuyên gia..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {FILTER_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={[
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors duration-150",
                  activeFilter === tag
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600",
                ].join(" ")}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content area ── */}

        {/* API error */}
        {apiError && !loading && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="text-5xl">⚠️</span>
            <p className="text-sm font-medium text-gray-700">{apiError}</p>
            {projectId && (
              <Button variant="secondary" onClick={() => fetchMatches(projectId)}>
                Thử lại
              </Button>
            )}
          </div>
        )}

        {/* Loading skeleton grid */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ExpertCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !apiError && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-sm font-medium">
              {matches.length === 0
                ? "Chưa có dữ liệu chuyên gia. Hãy hoàn thành khảo sát trước."
                : "Không tìm thấy chuyên gia phù hợp với bộ lọc hiện tại."}
            </p>
            {matches.length > 0 && (
              <button
                className="mt-3 text-sm text-blue-600 hover:underline"
                onClick={() => { setActiveFilter("Tất cả"); setSearchQ(""); }}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Expert grid */}
        {!loading && !apiError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((match, index) => (
              <ExpertCard
                key={match.expert.id}
                match={match}
                index={index}
                isSelected={selected.includes(match.expert.id)}
                onToggle={toggleSelect}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}