// src/pages/Projects/ProjectHistory.jsx

import { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { Card, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getProjectsBySme } from '../../services/projectApi';

// Thay vì dùng string đơn giản, hãy cấu hình mảng TABS như sau:
const TABS = [
  { id: "all", label: "Tất cả", matchStatuses: [] },
  { id: "pending", label: "Chờ duyệt", matchStatuses: ["Pending", "Negotiating"] },
  { id: "in_progress", label: "Đang thực hiện", matchStatuses: ["In Progress"] },
  { id: "completed", label: "Hoàn thành", matchStatuses: ["Completed"] }
];

// Cập nhật lại STATUS_MAP theo đúng text từ Backend để có màu chuẩn
const STATUS_MAP = {
  "Pending": {
    label: 'Chờ duyệt',
    dot:   'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
  "Negotiating": {
    label: 'Đang đàm phán',
    dot:   'bg-amber-500',
    badge: 'bg-amber-50 text-amber-800 ring-amber-300',
  },
  "In Progress": {
    label: 'Đang thực hiện',
    dot:   'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  "Completed": {
    label: 'Hoàn thành',
    dot:   'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const formatDate = (isoString) => {
  if (!isoString) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(isoString));
};

const deadlineCountdown = (isoString) => {
  if (!isoString) return null;
  const diff = Math.ceil((new Date(isoString) - Date.now()) / 86_400_000);
  if (diff < 0)  return { text: 'Đã quá hạn',     cls: 'text-red-500'   };
  if (diff === 0) return { text: 'Hôm nay',        cls: 'text-red-500'   };
  if (diff <= 7)  return { text: `Còn ${diff} ngày`, cls: 'text-amber-600' };
  return           { text: `Còn ${diff} ngày`,     cls: 'text-slate-500' };
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Skeleton card hiển thị khi đang tải dữ liệu */
const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm animate-pulse">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="h-5 w-2/3 rounded-md bg-slate-200" />
      <div className="h-6 w-24 rounded-full bg-slate-200" />
    </div>
    <div className="space-y-3">
      <div className="h-4 w-1/2 rounded bg-slate-100" />
      <div className="h-4 w-1/3 rounded bg-slate-100" />
    </div>
    <div className="mt-6 h-9 w-full rounded-xl bg-slate-100" />
  </div>
);

/** Thanh tab lọc dự án */
/** Thanh tab lọc dự án */
const ProjectTabs = ({ activeTab, onChange, counts }) => (
  <div className="flex gap-1 rounded-2xl bg-slate-100 p-1.5">
    {TABS.map(({ id, label }) => {  // <-- Đổi 'key' thành 'id' ở đây
      const isActive = activeTab === id;
      const count = counts[id] ?? 0;
      return (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={[
            'relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200',
            isActive
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          ].join(' ')}
        >
          {label}
          {id !== 'all' && count > 0 && (
            <span
              className={[
                'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600',
              ].join(' ')}
            >
              {count}
            </span>
          )}
          {id === 'all' && (
            <span
              className={[
                'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold',
                isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600',
              ].join(' ')}
            >
              {count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

/** Badge trạng thái dự án */
const StatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[status] ?? {
    label: status,
    dot:   'bg-slate-400',
    badge: 'bg-slate-50 text-slate-600 ring-slate-200',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${cfg.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

/** Card thông tin một dự án */
const ProjectCard = ({ project, onNavigate }) => {
  const countdown = deadlineCountdown(project.deadline);

  return (
    <Card className="group rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <CardBody className="p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-800 group-hover:text-indigo-700 transition-colors duration-200">
            {project.title}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        {/* Meta info */}
        <dl className="space-y-2.5">
          {/* Budget */}
          <div className="flex items-center gap-2 text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              {/* Coin icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M9 10.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5c0 2.5-6 2.5-6 5 0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5" />
              </svg>
            </span>
            <dt className="text-slate-400">Ngân sách:</dt>
            <dd className="font-semibold text-slate-700">{formatCurrency(project.budget)}</dd>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-2 text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
              {/* Calendar icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <dt className="text-slate-400">Hạn chót:</dt>
            <dd className="font-medium text-slate-700">{formatDate(project.deadline)}</dd>
            {countdown && (
              <span className={`ml-1 text-xs font-medium ${countdown.cls}`}>
                ({countdown.text})
              </span>
            )}
          </div>

          {/* Project ID */}
          <div className="flex items-center gap-2 text-sm">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8z" />
                <polyline points="13 2 13 8 19 8" />
              </svg>
            </span>
            <dt className="text-slate-400">Mã dự án:</dt>
            <dd className="font-mono text-xs text-slate-500">{project.id}</dd>
          </div>
        </dl>

        {/* Divider */}
        <div className="my-5 border-t border-dashed border-slate-100" />

        {/* CTA Button */}
        <Button
          onClick={() => onNavigate(project)}
          className="w-full justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-indigo-700 active:scale-95"
        >
          {project.status === 'completed' ? 'Xem chi tiết' : 'Xem chi tiết / Quản lý'}
          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Button>
      </CardBody>
    </Card>
  );
};

/** Trạng thái rỗng khi không có dự án */
const EmptyState = ({ activeTab }) => {
  const isFiltered = activeTab !== 'all';
  return (
    <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V8z" />
          <polyline points="13 2 13 8 19 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="11" y2="17" />
        </svg>
      </div>
      <h3 className="mb-1.5 text-base font-semibold text-slate-700">
        {isFiltered ? 'Không tìm thấy dự án' : 'Chưa có dự án nào'}
      </h3>
      <p className="max-w-xs text-sm text-slate-400">
        {isFiltered
          ? `Không có dự án nào ở trạng thái "${TABS.find((t) => t.key === activeTab)?.label}".`
          : 'Bắt đầu bằng cách đăng dự án mới để kết nối với các freelancer phù hợp.'}
      </p>
    </div>
  );
};

/** Banner lỗi */
const ErrorBanner = ({ message, onRetry }) => (
  <div className="col-span-full flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50 py-14 text-center">
    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <h3 className="mb-1 text-base font-semibold text-red-700">Đã xảy ra lỗi</h3>
    <p className="mb-5 max-w-sm text-sm text-red-500">{message}</p>
    <Button
      onClick={onRetry}
      className="inline-flex items-center gap-2 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12a8 8 0 10-4.9 7.4" />
        <path d="M20 12v-4h-4" />
      </svg>
      Thử lại
    </Button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const ProjectHistory = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);

  // ── State ──
  const [projects, setProjects]   = useState([]);
  const [loading,  setLoading]    = useState(true);
  const [error,    setError]      = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // ── Fetch data ──
  const fetchProjects = async () => {
    if (!isAuthenticated || !user?.id) {
      setError('Vui lòng đăng nhập để xem dự án của bạn.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getProjectsBySme(user.id);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[ProjectHistory] fetchProjects error:', err);
      setError(err?.response?.data?.message ?? err?.message ?? 'Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [isAuthenticated, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

// ── Derived state ──
  const tabCounts = useMemo(() => {
    const counts = { all: projects.length };
    TABS.forEach(tab => {
      if (tab.id !== 'all') {
        // Đếm các project có status nằm trong mảng matchStatuses
        counts[tab.id] = projects.filter(p => tab.matchStatuses.includes(p.status)).length;
      }
    });
    return counts;
  }, [projects]);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return projects;
    const currentTab = TABS.find(t => t.id === activeTab);
    return currentTab ? projects.filter(p => currentTab.matchStatuses.includes(p.status)) : [];
  }, [projects, activeTab]);

  // ── Navigation handler (Vấn đề 2 đã được sửa ở đây) ──
  const handleNavigate = (project) => {
    navigate('/dashboard', { 
      state: { 
        project_id: project.id,
        initial_status: project.status // Truyền trạng thái hiện tại sang Dashboard
      } 
    });
  };

  // ── Render ──
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* ── Page Header ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              {/* Breadcrumb */}
              <span className="text-sm text-slate-400">Dashboard</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm font-medium text-indigo-600">Dự án của tôi</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Lịch sử dự án
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý toàn bộ dự án đã đăng · Tài khoản:&nbsp;
              <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">
                {user?.name || 'N/A'} ({user?.id || 'N/A'})
              </code>
            </p>
          </div>

          {/* Action */}
          <Button
            onClick={() => navigate('/audit')}
            disabled={user?.role === 'EXPERT'}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Đăng dự án mới
          </Button>
        </div>

        {/* ── Stats Row (chỉ hiện khi có data) ── */}
        {!loading && !error && projects.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Tổng dự án',       value: tabCounts.all,         color: 'text-slate-700',   bg: 'bg-white'          },
              { label: 'Chờ duyệt',         value: tabCounts.pending,     color: 'text-amber-600',   bg: 'bg-amber-50'       },
              { label: 'Đang thực hiện',    value: tabCounts.in_progress, color: 'text-blue-600',    bg: 'bg-blue-50'        },
              { label: 'Hoàn thành',        value: tabCounts.completed,   color: 'text-emerald-600', bg: 'bg-emerald-50'     },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`rounded-2xl ${bg} border border-slate-100 p-4 shadow-sm`}>
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Tabs ── */}
        {!loading && !error && (
          <div className="mb-6 overflow-x-auto">
            <ProjectTabs
              activeTab={activeTab}
              onChange={setActiveTab}
              counts={tabCounts}
            />
          </div>
        )}

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Loading skeletons */}
          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {/* Error state */}
          {!loading && error && (
            <ErrorBanner message={error} onRetry={fetchProjects} />
          )}

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <EmptyState activeTab={activeTab} />
          )}

          {/* Project cards */}
          {!loading && !error && filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onNavigate={handleNavigate}
            />
          ))}

        </div>

        {/* ── Footer note ── */}
        {!loading && !error && filtered.length > 0 && (
          <p className="mt-8 text-center text-xs text-slate-400">
            Hiển thị {filtered.length}/{projects.length} dự án
          </p>
        )}
      </div>
    </div>
  );
};

export default ProjectHistory;