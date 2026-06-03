// src/pages/Projects/ProjectDashboard.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { negotiateContract, signContract } from "../../services/contractApi";
import { getMilestones, createMilestone, completeMilestone } from "../../services/executionApi";
import { submitReview } from "../../services/reviewApi";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_ORDER = ["Pending", "Negotiating", "In Progress", "Completed"];

const STATUS_CONFIG = {
  Pending: {
    label: "Chờ xử lý",
    classes: "bg-gray-100 text-gray-600 border border-gray-300",
    dot: "bg-gray-400",
  },
  Negotiating: {
    label: "Đang đàm phán",
    classes: "bg-amber-100 text-amber-700 border border-amber-300",
    dot: "bg-amber-500",
  },
  "In Progress": {
    label: "Đang thực thi",
    classes: "bg-blue-100 text-blue-700 border border-blue-300",
    dot: "bg-blue-500",
  },
  Completed: {
    label: "Hoàn thành",
    classes: "bg-green-100 text-green-700 border border-green-300",
    dot: "bg-green-500",
  },
};

const MOCK_DOCUMENTS = [
  {
    id: "mou",
    type: "MOU",
    title: "Biên bản Ghi nhớ (MOU)",
    description: "Thỏa thuận hợp tác ban đầu giữa hai bên, xác định phạm vi và mục tiêu dự án.",
    icon: "📄",
    date: "28/05/2025",
    size: "184 KB",
  },
  {
    id: "nda",
    type: "NDA",
    title: "Thỏa thuận Bảo mật (NDA)",
    description: "Cam kết bảo mật thông tin kỹ thuật, dữ liệu kinh doanh trong suốt vòng đời dự án.",
    icon: "🔒",
    date: "28/05/2025",
    size: "97 KB",
  },
];

const TABS = [
  { id: "contracts", label: "Đàm phán & Pháp lý", icon: "📋" },
  { id: "milestones", label: "Tiến độ thực thi", icon: "🎯" },
  { id: "review", label: "Nghiệm thu & Đánh giá", icon: "⭐" },
];

// ─── Shared Hooks & Helpers ───────────────────────────────────────────────────

function useApiAction() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFn) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Đã xảy ra lỗi. Vui lòng thử lại.";
      setError(msg);
      throw err; // Ném lỗi để component tự catch nếu cần
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  // Trả về cả `run` và `execute` để tương thích ngược với code cũ
  return { isSubmitting, error, setError, clearError, run: execute, execute };
}

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(new Date(iso));
};

const deadlineMeta = (iso) => {
  if (!iso) return null;
  const diff = Math.ceil((new Date(iso) - Date.now()) / 86_400_000);
  if (diff < 0)  return { text: "Quá hạn",       cls: "text-red-500 bg-red-50",    icon: "⚠" };
  if (diff === 0) return { text: "Hôm nay",       cls: "text-red-500 bg-red-50",    icon: "⏰" };
  if (diff <= 3)  return { text: `${diff} ngày`,  cls: "text-amber-600 bg-amber-50", icon: "⚡" };
  return           { text: `${diff} ngày`,        cls: "text-slate-500 bg-slate-50", icon: "📅" };
};

const todayISO = () => new Date().toISOString().split("T")[0];

// ─── Shared UI Components ─────────────────────────────────────────────────────

function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200 mt-4 mb-4">
      <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      <p className="text-sm text-red-700 flex-1">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400 hover:text-red-600 shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

function Spinner({ className = "w-4 h-4" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  );
}

function StatusTimeline({ currentStatus }) {
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);
  return (
    <div className="flex items-center">
      {STATUS_ORDER.map((s, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  done ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-400",
                  active ? "ring-2 ring-blue-300 ring-offset-1" : "",
                ].join(" ")}
              >
                {idx < currentIdx ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span className={`text-xs hidden sm:block whitespace-nowrap ${done ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                {STATUS_CONFIG[s].label}
              </span>
            </div>
            {idx < STATUS_ORDER.length - 1 && (
              <div className={`h-0.5 w-10 sm:w-14 mx-1 transition-colors duration-300 ${idx < currentIdx ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function DocumentCard({ doc, canSign, contractId, onSigned }) {
  const { isSubmitting, error, run } = useApiAction();
  const [signed, setSigned] = useState(false);

  const handleSign = async () => {
    if (!contractId) return;
    try {
      const result = await run(() => signContract(contractId));
      if (result) {
        setSigned(true);
        onSigned?.(result);
      }
    } catch (e) {} // Lỗi đã được useApiAction hứng
  };

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30 transition-colors duration-150">
      <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-2xl shrink-0">
        {doc.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold">{doc.type}</span>
          {signed && <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">✓ Đã ký</span>}
        </div>
        <p className="font-semibold text-gray-800 text-sm mt-1">{doc.title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
        <div className="flex gap-4 mt-2 text-xs text-gray-400">
          <span>📅 {doc.date}</span>
          <span>💾 {doc.size}</span>
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
      <div className="flex gap-2 shrink-0">
        <button className="px-3 py-1.5 rounded border border-gray-300 text-xs text-gray-600 hover:bg-gray-100 transition-colors">Tải xuống</button>
        {canSign && !signed && (
          <button
            onClick={handleSign}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-blue-500 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Spinner />} Ký điện tử
          </button>
        )}
      </div>
    </div>
  );
}

function StarPicker({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["", "Rất tệ", "Tệ", "Trung bình", "Tốt", "Xuất sắc"];
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => !disabled && setHovered(0)}
          onClick={() => !disabled && onChange(star)}
          className="text-3xl transition-transform duration-100 hover:scale-110 focus:outline-none disabled:cursor-default"
        >
          <span className={(hovered || value) >= star ? "text-amber-400" : "text-gray-200"}>★</span>
        </button>
      ))}
      {(hovered || value) > 0 && <span className="ml-2 text-sm text-amber-600 font-medium">{labels[hovered || value]}</span>}
    </div>
  );
}

// ─── Milestone Sub-components (API Integrated) ────────────────────────────────

const MilestoneProgress = ({ total, completed }) => {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const barColor = pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-indigo-500" : "bg-amber-400";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-600">Tiến độ cột mốc</span>
        <span className={`font-bold ${pct === 100 ? "text-emerald-600" : "text-indigo-600"}`}>{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex gap-4 text-xs text-slate-400">
        <span>{completed} hoàn thành</span>
        <span>·</span>
        <span>{total - completed} còn lại</span>
      </div>
    </div>
  );
};

const AddMilestoneForm = ({ onSubmit, isSubmitting, onCancel, actionError }) => {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) onSubmit({ title: title.trim(), due_date: dueDate || null });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 shadow-sm">
      <h4 className="mb-4 text-sm font-semibold text-indigo-800">Thêm Cột mốc mới</h4>
      <ErrorBanner message={actionError} />
      <div className="mb-3">
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Tên cột mốc <span className="text-red-500">*</span></label>
        <input ref={inputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
      </div>
      <div className="mb-5">
        <label className="mb-1.5 block text-xs font-medium text-slate-600">Hạn chót (tuỳ chọn)</label>
        <input type="date" value={dueDate} min={todayISO()} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting || !title.trim()} className="bg-indigo-600 text-white hover:bg-indigo-700">
          {isSubmitting ? <Spinner /> : "Lưu cột mốc"}
        </Button>
        <Button type="button" onClick={onCancel} disabled={isSubmitting} variant="secondary">Huỷ</Button>
      </div>
    </form>
  );
};

const MilestoneRow = ({ milestone, onComplete, isCompleting }) => {
  const dm = deadlineMeta(milestone.due_date);
  return (
    <div className={["group flex items-start gap-4 rounded-2xl border p-4 transition-all duration-150", milestone.completed ? "border-emerald-100 bg-emerald-50/50" : "border-slate-100 bg-white hover:border-indigo-100 hover:bg-indigo-50/30"].join(" ")}>
      <div className="mt-0.5 flex-shrink-0">
        {milestone.completed ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </span>
        ) : (
          <button onClick={() => !isCompleting && onComplete(milestone.id)} disabled={isCompleting} className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-300 bg-white transition-all hover:border-indigo-400 hover:bg-indigo-50">
            {isCompleting && <Spinner className="w-3 h-3 text-indigo-400" />}
          </button>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={["text-sm font-medium leading-snug", milestone.completed ? "text-slate-400 line-through" : "text-slate-800"].join(" ")}>{milestone.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {milestone.due_date && !milestone.completed && dm && (
            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium ${dm.cls}`}>
              {dm.icon} {formatDate(milestone.due_date)} · {dm.text}
            </span>
          )}
          {milestone.completed && milestone.completed_at && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">✓ Hoàn thành {formatDate(milestone.completed_at)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

const MilestoneListSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 animate-pulse">
        <div className="h-6 w-6 rounded-full bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-1/3 rounded bg-slate-100" />
        </div>
      </div>
    ))}
  </div>
);

// ─── Tab 1: Contracts ─────────────────────────────────────────────────────────

function ContractsTab({ status, projectId, expertId, contract, onContractUpdate, onStatusChange, onGoToMilestones }) {
  const { isSubmitting, error, setError, execute } = useApiAction();
  const isPending = status === "Pending";
  const isNegotiating = status === "Negotiating";
  const isLocked = STATUS_ORDER.indexOf(status) > STATUS_ORDER.indexOf("Negotiating");

  const handleNegotiate = async () => {
    if (!projectId || !expertId) { setError("Thiếu thông tin Project ID hoặc Expert ID."); return; }
    try {
      const result = await execute(() => negotiateContract({ project_id: projectId, expert_id: expertId }));
      if (result) {
        onContractUpdate(result);
        onStatusChange("Negotiating");
      }
    } catch (e) {}
  };

  const handleContractSigned = (signedContract) => {
    onContractUpdate(signedContract);
    onStatusChange("In Progress");
    onGoToMilestones();
  };

  return (
    <div className="space-y-6">
      {!isLocked && (
        <div className={["flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border", isNegotiating ? "bg-amber-50 border-amber-200" : "bg-gray-50 border-gray-200"].join(" ")}>
          <div>
            {isPending && (
              <>
                <p className="text-sm font-semibold text-gray-700">
                  {expertId ? "Sẵn sàng bắt đầu?" : "Chưa có chuyên gia"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {expertId 
                    ? "Khởi động quá trình đàm phán để mở khóa tài liệu pháp lý." 
                    : "Dự án của bạn chưa được chọn chuyên gia phụ trách."}
                </p>
              </>
            )}
            {isNegotiating && (
              <>
                <p className="text-sm font-semibold text-amber-700">Đang trong giai đoạn đàm phán</p>
                <p className="text-xs text-amber-600 mt-0.5">Hai bên xem xét và ký duyệt các tài liệu bên dưới trước khi tiến hành.</p>
              </>
            )}
          </div>
          <div className="shrink-0">
            {isPending && expertId && (
              <Button variant="primary" size="sm" onClick={handleNegotiate} disabled={isSubmitting}>
                {isSubmitting ? <><Spinner /> Đang xử lý...</> : "🚀 Bắt đầu đàm phán"}
              </Button>
            )}
            {isPending && !expertId && (
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => window.location.href = '/matching'} 
              >
                🔍 Tìm chuyên gia ngay
              </Button>
            )}
          </div>
        </div>
      )}

      {isLocked && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Hợp đồng đã được ký kết. Dự án đang trong giai đoạn thực thi.
        </div>
      )}

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Tài liệu pháp lý</h3>
        <div className="space-y-3">
          {MOCK_DOCUMENTS.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} canSign={isNegotiating} contractId={contract?.id} onSigned={handleContractSigned} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Milestones (API Integrated) ───────────────────────────────────────

function MilestonesTab({ status, projectId, milestones, loadingMilestones, fetchError, fetchMilestones, onMilestonesChange, onGoToReview }) {
  const isLocked = STATUS_ORDER.indexOf(status) < STATUS_ORDER.indexOf("In Progress");

  const [showForm, setShowForm] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const { isSubmitting: isAdding, error: addError, clearError, execute } = useApiAction();

  const handleCreateMilestone = useCallback(async (payload) => {
    try {
      const newMilestone = await execute(() => createMilestone(projectId, payload));
      onMilestonesChange((prev) => [...prev, newMilestone]);
      setShowForm(false);
    } catch {}
  }, [execute, projectId, onMilestonesChange]);

  const handleCompleteMilestone = useCallback(async (milestoneId) => {
    setCompletingId(milestoneId);
    try {
      const updated = await execute(() => completeMilestone(milestoneId));
      onMilestonesChange((prev) => prev.map((m) => m.id === milestoneId ? { ...m, completed: true, completed_at: updated?.completed_at ?? new Date().toISOString() } : m));
    } catch {} finally {
      setCompletingId(null);
    }
  }, [execute, onMilestonesChange]);

  const stats = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter((m) => m.completed).length;
    const overdue = milestones.filter((m) => !m.completed && m.due_date && new Date(m.due_date) < new Date()).length;
    return { total, completed, overdue };
  }, [milestones]);

  const sortedMilestones = useMemo(() => {
    return [...milestones].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }, [milestones]);

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
        <span className="text-5xl">🔒</span>
        <p className="text-sm font-medium text-gray-500">Tab này chưa được mở khóa</p>
        <p className="text-xs text-gray-400">Hoàn tất ký hợp đồng ở tab Đàm phán & Pháp lý để bắt đầu thực thi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <CardBody className="p-6">
          <div className="mb-5 grid grid-cols-3 divide-x divide-slate-100">
            {[
              { label: "Tổng cột mốc", value: stats.total, color: "text-slate-700" },
              { label: "Hoàn thành", value: stats.completed, color: "text-emerald-600" },
              { label: "Quá hạn", value: stats.overdue, color: stats.overdue > 0 ? "text-red-500" : "text-slate-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="px-4 text-center first:pl-0 last:pr-0">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="mt-0.5 text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
          <MilestoneProgress total={stats.total} completed={stats.completed} />
        </CardBody>
      </Card>

      {!showForm && (
        <Button onClick={() => { setShowForm(true); clearError(); }} className="w-full justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          ➕ Thêm Cột mốc
        </Button>
      )}

      {showForm && (
        <AddMilestoneForm onSubmit={handleCreateMilestone} isSubmitting={isAdding} onCancel={() => { setShowForm(false); clearError(); }} actionError={addError} />
      )}

      <Card className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        <CardBody className="p-6">
          <h2 className="mb-5 text-base font-semibold text-slate-800">Danh sách Cột mốc</h2>
          {loadingMilestones && <MilestoneListSkeleton />}
          {!loadingMilestones && fetchError && (
             <div className="text-center py-5">
               <p className="text-red-500 text-sm">{fetchError}</p>
               <button onClick={fetchMilestones} className="mt-2 text-indigo-600 text-xs underline">Thử lại</button>
             </div>
          )}
          {!loadingMilestones && !fetchError && sortedMilestones.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Chưa có cột mốc nào. Hãy thêm cột mốc đầu tiên!</p>
          )}
          {!loadingMilestones && !fetchError && sortedMilestones.length > 0 && (
            <div className="space-y-3">
              {sortedMilestones.map((milestone) => (
                <MilestoneRow key={milestone.id} milestone={milestone} onComplete={handleCompleteMilestone} isCompleting={completingId === milestone.id} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700">Hoàn tất giai đoạn thực thi?</p>
          <p className="text-xs text-gray-400 mt-0.5">Chuyển sang bước nghiệm thu và đánh giá chuyên gia.</p>
        </div>
        <Button variant="primary" size="md" onClick={onGoToReview}>✅ Nghiệm thu dự án →</Button>
      </div>
    </div>
  );
}

// ─── Tab 3: Review ────────────────────────────────────────────────────────────

function ReviewTab({ status, projectId, expertId, onComplete }) {
  const isLocked = STATUS_ORDER.indexOf(status) < STATUS_ORDER.indexOf("In Progress");
  const isCompleted = status === "Completed";

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [formError, setFormError] = useState("");
  const { isSubmitting, error, setError, execute } = useApiAction();

  const handleSubmit = async () => {
    if (rating === 0) { setFormError("Vui lòng chọn số sao đánh giá."); return; }
    if (feedback.trim().length < 10) { setFormError("Nhận xét tối thiểu 10 ký tự."); return; }
    if (!projectId) { setFormError("Không tìm thấy Project ID."); return; }
    setFormError("");

    try {
      const result = await execute(() =>
        submitReview({
          project_id: projectId,
          reviewer_sme_id: "SME-001",
          reviewed_expert_id: expertId ?? "",
          rating,
          feedback: feedback.trim(),
          tags: [],
        })
      );
      if (result) onComplete();
    } catch (e) {}
  };

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
        <span className="text-5xl">🔒</span>
        <p className="text-sm font-medium text-gray-500">Tab này chưa được mở khóa</p>
        <p className="text-xs text-gray-400">Hoàn tất ký hợp đồng để mở khóa tính năng nghiệm thu.</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl shadow-md">🎉</div>
        <h3 className="text-lg font-bold text-gray-800">Dự án hoàn thành xuất sắc!</h3>
        <p className="text-sm text-gray-500 text-center max-w-sm">Đánh giá của bạn đã được ghi nhận. Cảm ơn bạn đã sử dụng nền tảng Broker 4.0.</p>
        <div className="flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className={s <= rating ? "text-amber-400" : "text-gray-200"}>★</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">Đánh giá chuyên gia</h3>
        <p className="text-sm text-gray-500">Nhận xét của bạn giúp cộng đồng học thuật và doanh nghiệp cùng phát triển tốt hơn.</p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Mức độ hài lòng <span className="text-red-500">*</span></label>
        <StarPicker value={rating} onChange={setRating} disabled={isSubmitting} />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Nhận xét chi tiết <span className="text-red-500">*</span></label>
        <textarea
          rows={5}
          disabled={isSubmitting}
          className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none disabled:bg-gray-50"
          placeholder="Chuyên gia đã đáp ứng kỳ vọng như thế nào?"
          value={feedback}
          onChange={(e) => { setFeedback(e.target.value); setFormError(""); }}
        />
        {formError && <p className="text-xs text-red-500">{formError}</p>}
      </div>
      <ErrorBanner message={error} onDismiss={() => setError(null)} />
      <Button variant="primary" size="lg" onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? <><Spinner /> Đang gửi đánh giá...</> : "🚀 Gửi đánh giá & Hoàn tất dự án"}
      </Button>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function ProjectDashboard() {
  const { state } = useLocation();

  const initialStatus = state?.initial_status || "Pending";
  const projectId = state?.project_id ?? null;
  const selectedExperts = state?.selectedExperts ?? [];
  const expertId = selectedExperts[0] ?? null;

  const getDefaultTab = (st) => {
    if (st === "Completed") return "review";
    if (st === "In Progress") return "milestones";
    return "contracts";
  };

  const [status, setStatus] = useState(initialStatus);
  const [activeTab, setActiveTab] = useState(getDefaultTab(initialStatus));
  const [contract, setContract] = useState(null);

  // Milestone State
  const [milestones, setMilestones] = useState([]);
  const [loadingMilestones, setLoadingMilestones] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const fetchMilestones = useCallback(async () => {
    if (!projectId) return;
    setLoadingMilestones(true);
    setFetchError(null);
    try {
      const data = await getMilestones(projectId);
      setMilestones(Array.isArray(data) ? data : []);
    } catch (err) {
      setFetchError(err.message ?? "Không thể tải danh sách cột mốc.");
    } finally {
      setLoadingMilestones(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  const isTabLocked = (tabId) => {
    if (tabId === "contracts") return false;
    return STATUS_ORDER.indexOf(status) < STATUS_ORDER.indexOf("In Progress");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-5">
        {!projectId && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-amber-50 border border-amber-200 text-sm text-amber-700">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <span>Không có Project ID. Hãy truy cập từ màn hình Lịch sử dự án.</span>
          </div>
        )}

        {/* Project Header */}
        <Card>
          <CardBody className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{projectId ?? "PRJ-UNKNOWN"}</span>
                  <StatusBadge status={status} />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">Không gian làm việc Dự án</h1>
                <p className="text-sm text-gray-500">Chuyên gia phụ trách: <span className="font-mono">{expertId ?? "Chưa xác định"}</span></p>
              </div>
              <div className="sm:pl-6 sm:border-l border-gray-100">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Trạng thái dự án</p>
                <StatusTimeline currentStatus={status} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Tab Navigation & Body */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b border-gray-200">
            {TABS.map((tab) => {
              const locked = isTabLocked(tab.id);
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => !locked && setActiveTab(tab.id)}
                  disabled={locked}
                  className={[
                    "flex-1 flex items-center justify-center gap-1.5 px-3 py-3.5 text-sm font-medium transition-all duration-150 border-b-2 select-none",
                    active ? "border-blue-600 text-blue-700 bg-blue-50/50" : locked ? "border-transparent text-gray-300 cursor-not-allowed" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {locked && (
                    <svg className="w-3 h-3 text-gray-300 hidden sm:block" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-5 sm:p-6">
            {activeTab === "contracts" && (
              <ContractsTab status={status} projectId={projectId} expertId={expertId} contract={contract} onContractUpdate={setContract} onStatusChange={setStatus} onGoToMilestones={() => setActiveTab("milestones")} />
            )}
            {activeTab === "milestones" && (
              <MilestonesTab
                status={status}
                projectId={projectId}
                milestones={milestones}
                loadingMilestones={loadingMilestones}
                fetchError={fetchError}
                fetchMilestones={fetchMilestones}
                onMilestonesChange={setMilestones}
                onGoToReview={() => setActiveTab("review")}
              />
            )}
            {activeTab === "review" && (
              <ReviewTab status={status} projectId={projectId} expertId={expertId} onComplete={() => setStatus("Completed")} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}