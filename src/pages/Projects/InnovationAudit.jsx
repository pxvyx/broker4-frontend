// src/pages/Projects/InnovationAudit.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import { Card, CardBody } from "../../components/ui/Card";
import { createProject } from "../../services/projectApi";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const IconCheck = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const DIGITAL_NEEDS = [
  "Tự động hóa quy trình (RPA / AI)",
  "Phân tích dữ liệu & BI",
  "Thương mại điện tử & Marketing số",
  "Quản trị chuỗi cung ứng",
  "An toàn thông tin",
  "IoT / Nhà máy thông minh",
  "Phần mềm quản lý nội bộ (ERP/CRM)",
  "R&D sản phẩm mới",
];

const SECTORS = [
  "Sản xuất & Chế tạo",
  "Nông nghiệp & Thực phẩm",
  "Logistics & Vận tải",
  "Y tế & Dược phẩm",
  "Giáo dục & Đào tạo",
  "Bán lẻ & Tiêu dùng",
  "Tài chính & FinTech",
  "Khác",
];

const URGENCY_OPTIONS = [
  { value: "urgent", label: "Khẩn cấp (< 3 tháng)", monthsOut: 3 },
  { value: "normal", label: "Bình thường (3 – 9 tháng)", monthsOut: 6 },
  { value: "planning", label: "Lên kế hoạch (> 9 tháng)", monthsOut: 12 },
];

const SERVICE_GROUPS = [
  {
    groupName: "Nhóm A — Dịch vụ môi giới kết nối (Thu từ SME + ĐH)",
    packages: [
      { id: "A1", name: "Kết nối thử nghiệm", price: "20–35tr", desc: "SME có bài toán cụ thể, kết nối với 1–2 khoa/lab phù hợp, hỗ trợ buổi pitch đầu tiên.", features: ["Phân tích nhu cầu SME", "Mapping trường ĐH", "Tổ chức 1 buổi gặp mặt", "Báo cáo kết quả"] },
      { id: "A2", name: "Kết nối hợp tác R&D", price: "60–100tr", desc: "Dẫn dắt toàn bộ quy trình đàm phán hợp đồng R&D, chuyển giao công nghệ.", features: ["Due diligence năng lực", "Thiết kế scope hợp tác", "Đàm phán MOU/Hợp đồng", "Theo dõi 3 tháng đầu"] },
      { id: "A3", name: "Hệ sinh thái đối tác", price: "120–180tr", desc: "Xây dựng mạng lưới đối tác chiến lược bền vững giữa nhóm SME và nhóm trường ĐH.", features: ["Quản lý quan hệ 2 phía", "2 Innovation Day/năm", "Báo cáo impact hàng quý", "Ưu tiên kết nối mới"] }
    ]
  },
  {
    groupName: "Nhóm B — Tư vấn đổi mới (Thu từ SME)",
    packages: [
      { id: "B1", name: "Innovation Audit", price: "15–25tr", desc: "Đánh giá nhu cầu đổi mới thực sự của SME — xác định bài toán cụ thể cần giải.", features: ["Phỏng vấn founder + team", "Phân tích mô hình KD", "Roadmap đổi mới 6 tháng", "Đề xuất hướng hợp tác ĐH"] },
      { id: "B2", name: "Chiến lược đổi mới", price: "40–70tr", desc: "Xây chiến lược đổi mới 12–24 tháng gắn với KPI kinh doanh.", features: ["Workshop Design Thinking", "Phân tích thị trường", "Roadmap + OKR đổi mới", "Xác định 2-3 đối tác ĐH"] },
      { id: "B3", name: "Coaching hàng tháng", price: "20–35tr", desc: "Đồng hành thực thi đổi mới, kết nối nguồn lực ĐH theo từng giai đoạn.", features: ["4 buổi coaching 1:1/tháng", "Review OKR hàng tháng", "Kết nối chuyên gia", "Hỗ trợ pitch gọi vốn"] }
    ]
  }
];

const INITIAL_FORM = {
  companyName: "", contactName: "", email: "", phone: "",
  sector: "", employeeCount: "", digitalNeeds: [], painPoint: "",
  selectedPackage: "", // Cập nhật trường này
  urgency: "", hasItTeam: "",
};




// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Chuyển form state → body cho POST /api/projects */
function mapFormToPayload(form) {
  const urgencyOption = URGENCY_OPTIONS.find((u) => u.value === form.urgency);
  const deadlineDate = new Date();
  deadlineDate.setMonth(deadlineDate.getMonth() + (urgencyOption?.monthsOut ?? 6));
  const deadline = deadlineDate.toISOString().split("T")[0];

  return {
    sme_id: "SME-001", 
    title: `[${form.sector}] Dự án CĐS – ${form.companyName}`,
    description: form.painPoint.trim(),
    required_specialties: form.digitalNeeds,
    service_package: form.selectedPackage, // Gửi mã gói (Ví dụ: "A1", "B2") về Backend
    deadline,
    meta: {
      company_name: form.companyName,
      contact_name: form.contactName,
      email: form.email,
      phone: form.phone,
      sector: form.sector,
      employee_count: form.employeeCount,
      has_it_team: form.hasItTeam,
      urgency: form.urgency,
    },
  };
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div
            className={[
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200",
              i + 1 <= current
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-200 text-gray-500",
              i + 1 === current ? "ring-2 ring-blue-300 ring-offset-1" : "",
            ].join(" ")}
          >
            {i + 1 < current ? (
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < total - 1 && (
            <div
              className={[
                "flex-1 h-0.5 rounded transition-colors duration-300",
                i + 1 < current ? "bg-blue-600" : "bg-gray-200",
              ].join(" ")}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function InputField({ label, required, error, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white";

// ─── Step panels ──────────────────────────────────────────────────────────────

function Step1({ form, set, errors }) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-800">
        Thông tin doanh nghiệp
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <InputField label="Tên doanh nghiệp" required error={errors.companyName}>
          <input
            className={inputClass}
            placeholder="Công ty TNHH ABC"
            value={form.companyName}
            onChange={(e) => set("companyName", e.target.value)}
          />
        </InputField>
        <InputField label="Người liên hệ" required error={errors.contactName}>
          <input
            className={inputClass}
            placeholder="Nguyễn Văn A"
            value={form.contactName}
            onChange={(e) => set("contactName", e.target.value)}
          />
        </InputField>
        <InputField label="Email" required error={errors.email}>
          <input
            type="email"
            className={inputClass}
            placeholder="contact@company.vn"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </InputField>
        <InputField label="Số điện thoại" error={errors.phone}>
          <input
            className={inputClass}
            placeholder="0901 234 567"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
        </InputField>
      </div>
      <InputField label="Ngành nghề" required error={errors.sector}>
        <select
          className={inputClass}
          value={form.sector}
          onChange={(e) => set("sector", e.target.value)}
        >
          <option value="">-- Chọn ngành --</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </InputField>
      <InputField label="Quy mô nhân sự" hint="Số lượng nhân viên toàn công ty">
        <select
          className={inputClass}
          value={form.employeeCount}
          onChange={(e) => set("employeeCount", e.target.value)}
        >
          <option value="">-- Chọn quy mô --</option>
          {["1–10", "11–50", "51–200", "201–500", "> 500"].map((v) => (
            <option key={v} value={v}>{v} nhân viên</option>
          ))}
        </select>
      </InputField>
    </div>
  );
}

function Step2({ form, set, errors }) {
  const toggleNeed = (need) =>
    set(
      "digitalNeeds",
      form.digitalNeeds.includes(need)
        ? form.digitalNeeds.filter((n) => n !== need)
        : [...form.digitalNeeds, need]
    );

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-800">
        Nhu cầu chuyển đổi số
      </h2>
      <InputField
        label="Lĩnh vực quan tâm"
        required
        hint="Có thể chọn nhiều mục"
        error={errors.digitalNeeds}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {DIGITAL_NEEDS.map((need) => {
            const checked = form.digitalNeeds.includes(need);
            return (
              <label
                key={need}
                className={[
                  "flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all duration-150 select-none text-sm",
                  checked
                    ? "border-blue-500 bg-blue-50 text-blue-800 shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50/40",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  className="accent-blue-600 w-4 h-4 shrink-0"
                  checked={checked}
                  onChange={() => toggleNeed(need)}
                />
                {need}
              </label>
            );
          })}
        </div>
      </InputField>

      <InputField
        label="Mô tả bài toán / khó khăn hiện tại"
        required
        error={errors.painPoint}
        hint="Mô tả càng chi tiết, kết quả matching càng chính xác"
      >
        <textarea
          className={`${inputClass} resize-none h-32`}
          placeholder="Ví dụ: Doanh nghiệp đang gặp khó khăn trong việc theo dõi tồn kho theo thời gian thực..."
          value={form.painPoint}
          onChange={(e) => set("painPoint", e.target.value)}
        />
        <span className="text-xs text-gray-400 text-right">
          {form.painPoint.length} ký tự
        </span>
      </InputField>

      <InputField label="Doanh nghiệp có đội IT nội bộ không?">
        <div className="flex gap-3 mt-1">
          {["Có", "Không", "Đang xây dựng"].map((v) => (
            <label
              key={v}
              className={[
                "flex-1 text-center py-2 rounded-md border text-sm cursor-pointer transition-all duration-150 select-none",
                form.hasItTeam === v
                  ? "border-blue-500 bg-blue-600 text-white font-medium shadow-sm"
                  : "border-gray-200 text-gray-600 hover:border-blue-300",
              ].join(" ")}
            >
              <input
                type="radio"
                className="sr-only"
                value={v}
                checked={form.hasItTeam === v}
                onChange={() => set("hasItTeam", v)}
              />
              {v}
            </label>
          ))}
        </div>
      </InputField>
    </div>
  );
}

function Step3({ form, set, errors }) {
  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
        Dịch vụ & Mức độ ưu tiên
      </h2>

      {/* Lựa chọn gói dịch vụ */}
      <InputField label="Lựa chọn gói dịch vụ phù hợp" required error={errors.selectedPackage}>
        <div className="space-y-6 mt-3">
          {SERVICE_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="text-sm font-bold text-blue-800 mb-4 uppercase tracking-wide">
                {group.groupName}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {group.packages.map((pkg) => {
                  const isSelected = form.selectedPackage === pkg.id;
                  return (
                    <div 
                      key={pkg.id}
                      onClick={() => set("selectedPackage", pkg.id)}
                      className={`relative cursor-pointer transition-all duration-200 border-2 rounded-xl p-4 flex flex-col h-full ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/30 shadow-md' 
                          : 'border-gray-100 hover:border-blue-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-blue-600 text-white rounded-full p-0.5">
                          <IconCheck />
                        </div>
                      )}
                      
                      <div className="mb-2 pr-6">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded mb-2">{pkg.id}</span>
                        <h5 className="font-bold text-gray-900 leading-tight">{pkg.name}</h5>
                      </div>
                      <div className="text-blue-600 font-semibold text-sm mb-2">{pkg.price}</div>
                      <p className="text-xs text-gray-500 mb-4 flex-grow">{pkg.desc}</p>
                      
                      <ul className="space-y-1.5 mt-auto pt-3 border-t border-gray-100">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="text-[11px] text-gray-600 flex items-start gap-1">
                            <span className="text-emerald-500 mt-0.5">•</span>
                            <span className="leading-tight">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </InputField>

      {/* Mức độ ưu tiên */}
      <InputField label="Mức độ ưu tiên triển khai" required error={errors.urgency}>
        <div className="flex flex-col gap-2 mt-1">
          {URGENCY_OPTIONS.map(({ value, label }) => (
            <label
              key={value}
              className={[
                "flex items-center gap-3 px-4 py-3 rounded-md border cursor-pointer transition-all duration-150 select-none text-sm",
                form.urgency === value ? "border-blue-500 bg-blue-50 text-blue-800 font-medium" : "border-gray-200 text-gray-700 hover:border-blue-300",
              ].join(" ")}
            >
              <input
                type="radio"
                className="accent-blue-600"
                checked={form.urgency === value}
                onChange={() => set("urgency", value)}
              />
              {label}
            </label>
          ))}
        </div>
      </InputField>
      
      {/* Summary */}
      <div className="rounded-md bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm mt-6">
        <p className="font-semibold text-gray-700 mb-2">Tóm tắt khảo sát</p>
        <div className="flex gap-2 flex-wrap"><span className="text-gray-500">Gói dịch vụ:</span><span className="font-medium text-gray-800">{form.selectedPackage || "—"}</span></div>
        <div className="flex gap-2 flex-wrap"><span className="text-gray-500">Mức độ ưu tiên:</span><span className="font-medium text-gray-800">{URGENCY_OPTIONS.find(u => u.value === form.urgency)?.label || "—"}</span></div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function InnovationAudit() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  // API state
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  // ── Validators per step ──────────────────────────────────────────────────────
  const validators = {
    1: () => {
      const e = {};
      if (!form.companyName.trim()) e.companyName = "Vui lòng nhập tên doanh nghiệp.";
      if (!form.contactName.trim()) e.contactName = "Vui lòng nhập tên người liên hệ.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email không hợp lệ.";
      if (!form.sector) e.sector = "Vui lòng chọn ngành nghề.";
      return e;
    },
    2: () => {
      const e = {};
      if (form.digitalNeeds.length === 0) e.digitalNeeds = "Vui lòng chọn ít nhất một nhu cầu.";
      if (form.painPoint.trim().length < 10) e.painPoint = "Mô tả tối thiểu 10 ký tự.";
      return e;
    },
    3: () => {
          const e = {};
          if (!form.selectedPackage) e.selectedPackage = "Vui lòng chọn một gói dịch vụ.";
          if (!form.urgency) e.urgency = "Vui lòng chọn mức độ ưu tiên.";
          return e;
        },
      };
  const handleNext = () => {
    const e = validators[step]?.() ?? {};
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setStep((s) => s + 1);
  };

  const handleBack = () => { setErrors({}); setStep((s) => s - 1); };

  // ── Submit → POST /api/projects ──────────────────────────────────────────────
  const handleSubmit = async () => {
    const e = validators[3]?.() ?? {};
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setSubmitting(true);
    setApiError(null);

    try {
      const payload = mapFormToPayload(form);
      const project = await createProject(payload);

      navigate("/matching", {
        state: {
          project_id: project.id,
          auditData: form,       // giữ lại để MatchingCenter hiển thị banner
        },
      });
    } catch (err) {
      setApiError(err.message ?? "Gửi khảo sát thất bại. Vui lòng thử lại.");
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Page header */}
        <div className="mb-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide uppercase mb-3">
            Bước đầu tiên
          </span>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đánh giá nhu cầu
          </h1>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            Khảo sát 3 bước nhanh giúp chúng tôi hiểu doanh nghiệp của bạn và
            đề xuất chuyên gia phù hợp nhất.
          </p>
        </div>

        <Card>
          <CardBody className="p-6 sm:p-8">
            <StepIndicator current={step} total={3} />

            {step === 1 && <Step1 form={form} set={set} errors={errors} />}
            {step === 2 && <Step2 form={form} set={set} errors={errors} />}
            {step === 3 && <Step3 form={form} set={set} errors={errors} />}

            {/* API error banner */}
            {apiError && (
              <div className="mt-5 flex items-start gap-3 p-3 rounded-md bg-red-50 border border-red-200">
                <svg
                  className="w-5 h-5 text-red-500 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  />
                </svg>
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-100">
              {step > 1 ? (
                <Button variant="ghost" onClick={handleBack} disabled={submitting}>
                  ← Quay lại
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button variant="primary" onClick={handleNext}>
                  Tiếp theo →
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12" cy="12" r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        />
                      </svg>
                      Đang phân tích...
                    </>
                  ) : (
                    "Tìm chuyên gia phù hợp →"
                  )}
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}