import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

/* ════════════════════════════════════════════════
   SCROLL-REVEAL HOOK
   Dùng IntersectionObserver — không cần thư viện ngoài
════════════════════════════════════════════════ */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el); // chỉ trigger 1 lần
        }
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ════════════════════════════════════════════════
   REVEAL WRAPPER
   Bọc quanh bất kỳ khối nội dung nào cần trượt lên khi scroll
   Props:
     - delay (ms): hiệu ứng stagger cho các phần tử trong grid
     - className: class bổ sung cho wrapper
════════════════════════════════════════════════ */
function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal();

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`
        transition-all duration-700 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════
   SVG ICONS (inline — không phụ thuộc icon library)
════════════════════════════════════════════════ */
const IconBudget = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
  </svg>
);

const IconShield = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const IconClipboard = () => (
  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
  </svg>
);

const IconSearch = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 15.803 7.5 7.5 0 0 0 15.803 15.803z" />
  </svg>
);

const IconSparkles = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423z" />
  </svg>
);

const IconRocket = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
  </svg>
);

const IconChevronRight = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
  </svg>
);

const IconChevronDown = () => (
  <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
  </svg>
);

const IconCheck = () => (
  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd"
      d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
      clipRule="evenodd" />
  </svg>
);

/* ════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon: <IconBudget />,
    badge: 'Tối ưu chi phí',
    title: 'Tối ưu ngân sách R&D',
    description:
      'Tiếp cận năng lực chuyên gia hàng đầu theo mô hình thuê ngoài linh hoạt — không cần tuyển dụng toàn thời gian, không lãng phí nguồn lực nội bộ.',
    highlight: 'Tiết kiệm tới 60% so với tuyển dụng trực tiếp',
  },
  {
    icon: <IconShield />,
    badge: 'Bảo mật tuyệt đối',
    title: 'Bảo mật 100% thông tin',
    description:
      'Mọi dự án được bảo vệ bởi hợp đồng MOU/NDA ràng buộc pháp lý chặt chẽ. Ý tưởng và dữ liệu kinh doanh của bạn luôn được giữ kín tuyệt đối.',
    highlight: 'NDA ký kết trước khi bắt đầu bất kỳ trao đổi nào',
  },
  {
    icon: <IconClipboard />,
    badge: 'Minh bạch & kiểm soát',
    title: 'Quản lý trọn gói',
    description:
      'Theo dõi tiến độ theo từng Milestone minh bạch, dashboard thời gian thực và đội ngũ hỗ trợ tận tâm từ khởi động đến nghiệm thu bàn giao.',
    highlight: 'Milestone rõ ràng — thanh toán theo kết quả thực tế',
  },
];

const STEPS = [
  {
    num: '01',
    icon: <IconSearch />,
    title: 'Đánh giá nhu cầu',
    description:
      'Hoàn thành bảng đánh giá nhu cầu đổi mới trong 15 phút. Hệ thống phân tích bối cảnh, khoảng trống công nghệ và mức độ ưu tiên của doanh nghiệp.',
    color: 'from-indigo-500 to-blue-600',
    shadowColor: 'shadow-indigo-200',
  },
  {
    num: '02',
    icon: <IconSparkles />,
    title: 'Ghép nối thông minh',
    description:
      'Thuật toán đề xuất danh sách chuyên gia và ohòng Lab phù hợp nhất với tiêu chí kỹ thuật, ngân sách và timeline của bạn.',
    color: 'from-blue-500 to-cyan-500',
    shadowColor: 'shadow-blue-200',
  },
  {
    num: '03',
    icon: <IconRocket />,
    title: 'Thực thi & nghiệm thu',
    description:
      'Ký hợp đồng điện tử, quản lý dự án theo cột mốc và nghiệm thu kết quả — tất cả trên một nền tảng duy nhất, không phân tán.',
    color: 'from-violet-500 to-indigo-600',
    shadowColor: 'shadow-violet-200',
  },
];

const STATS = [
  {
    value: '50+',
    label: 'Chuyên gia hàng đầu',
    sub: 'Từ viện nghiên cứu & trường đại học uy tín',
  },
  {
    value: '15+',
    label: 'Viện / Phòng Lab',
    sub: 'Trang thiết bị công nghệ tiên tiến bậc nhất',
  },
  {
    value: '100%',
    label: 'Bảo mật thông tin',
    sub: 'Cam kết MOU / NDA ràng buộc pháp lý',
  },
];

const TRUST_BADGES = [
  'Không cam kết dài hạn',
  'NDA ký kết ngay lập tức',
  'Đánh giá nhu cầu miễn phí',
];

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
export default function Home() {
  const navigate = useNavigate();

  return (
    <main className="font-sans antialiased text-gray-800 overflow-x-hidden">

      {/* ──────────────────────────────────────────────
         1. HERO SECTION
      ────────────────────────────────────────────── */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        
        {/* Background Image với hiệu ứng Zoom chậm */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-slow-zoom"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1920&q=80')" 
          }}
        />
        
        {/* Overlay phủ mờ */}
        <div className="absolute inset-0 z-0 bg-slate-900/75 mix-blend-multiply" />

        {/* Nội dung chính */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          
          <Reveal delay={100}>
            <span className="inline-block py-1.5 px-4 mb-6 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-xs md:text-sm font-semibold tracking-wider uppercase backdrop-blur-sm">
              Nền tảng B2B Tech-Marketplace
            </span>
          </Reveal>

          <Reveal delay={300}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Giải phóng năng lực đổi mới sáng tạo.<br className="hidden md:block" />
              <span className="text-blue-400"> Bứt phá bằng trí tuệ hàn lâm.</span>
            </h1>
          </Reveal>

          <Reveal delay={500}>
            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed font-light">
              Broker 4.0 kết nối doanh nghiệp SME với mạng lưới Chuyên gia và Phòng Lab hàng đầu — nhanh chóng, bảo mật tuyệt đối và minh bạch từng bước.
            </p>
          </Reveal>

          <Reveal delay={700}>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
              <Button 
                onClick={() => navigate('/audit')}
                className="text-base px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1 border-none"
              >
                Bắt đầu ngay
              </Button>
              <Button 
                onClick={() => navigate('/matching')}
                className="text-base px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 backdrop-blur-md transition-all hover:-translate-y-1"
              >
                Khám phá chuyên gia
              </Button>
            </div>
          </Reveal>

        </div>

        {/* Nút cuộn xuống (Đã sửa lỗi lệch tâm) */}
        <div className="absolute bottom-8 left-0 w-full z-10 flex flex-col items-center justify-center pointer-events-none">
          <div className="animate-bounce flex flex-col items-center text-slate-400">
            <span className="text-[10px] uppercase tracking-[0.2em] mb-2 font-medium">Cuộn xuống</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          2. FEATURES — Khó khăn & Giải pháp
      ────────────────────────────────────────────── */}
      <section className="py-24 bg-white" aria-label="Tính năng nổi bật">
        <div className="max-w-6xl mx-auto px-6">

          {/* Section header */}
          <Reveal className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">
              Giải pháp toàn diện
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Giải quyết đúng nỗi đau của doanh nghiệp SME
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Chúng tôi hiểu những thách thức khi muốn đổi mới — và thiết kế giải pháp
              để vượt qua từng rào cản về nhân sự, chi phí và rủi ro bảo mật.
            </p>
          </Reveal>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feat, i) => (
              <Reveal key={feat.title} delay={i * 120}>
                <Card
                  className="
                    group h-full p-8 rounded-2xl
                    border border-gray-100
                    hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-50/80
                    transition-all duration-500 cursor-default
                    flex flex-col
                  "
                >
                  {/* Icon */}
                  <div
                    className="
                      w-16 h-16 rounded-2xl mb-6 flex items-center justify-center
                      bg-indigo-50 text-indigo-600
                      group-hover:bg-indigo-100 group-hover:scale-105
                      transition-all duration-300
                    "
                  >
                    {feat.icon}
                  </div>

                  {/* Badge */}
                  <span className="inline-block text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-2">
                    {feat.badge}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>

                  {/* Description */}
                  <p className="text-gray-500 leading-relaxed mb-5 flex-1">{feat.description}</p>

                  {/* Highlight pill */}
                  <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mt-auto">
                    <IconCheck />
                    <span className="font-medium">{feat.highlight}</span>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          3. HOW IT WORKS — Cách thức hoạt động
      ────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50" aria-label="Cách thức hoạt động">
        <div className="max-w-6xl mx-auto px-6">

          {/* Section header */}
          <Reveal className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-3">
              Quy trình làm việc
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Chỉ 3 bước để bắt đầu dự án đổi mới
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Broker 4.0 đơn giản hoá toàn bộ quy trình — từ xác định nhu cầu đến triển
              khai thực tế — thành một hành trình liền mạch, không phức tạp.
            </p>
          </Reveal>

          {/* Steps */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">

            {/* Connecting line giữa các bước (chỉ hiện trên desktop) */}
            <div
              className="
                hidden md:block absolute top-12
                left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)]
                h-px z-0
              "
              style={{
                background:
                  'linear-gradient(90deg, #a5b4fc 0%, #93c5fd 50%, #a5b4fc 100%)',
              }}
            />

            {STEPS.map((step, i) => (
              <Reveal key={step.num} delay={i * 150}>
                <div className="relative z-10 flex flex-col items-center text-center">

                  {/* Step icon block */}
                  <div
                    className={`
                      w-24 h-24 rounded-2xl
                      bg-gradient-to-br ${step.color}
                      flex flex-col items-center justify-center gap-0.5
                      text-white shadow-lg ${step.shadowColor}
                      mb-6 transition-transform duration-300 hover:scale-105
                    `}
                  >
                    <span className="text-[10px] font-bold tracking-widest opacity-70">
                      {step.num}
                    </span>
                    {step.icon}
                  </div>

                  {/* Step label */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* CTA inline */}
          <Reveal className="text-center mt-14">
            <Button
              variant="primary"
              onClick={() => navigate('/audit')}
              className="
                inline-flex items-center gap-2
                px-7 py-3 rounded-xl text-sm font-semibold
                bg-indigo-600 hover:bg-indigo-500 text-white
                transition-all duration-300 hover:shadow-lg hover:shadow-indigo-200
                hover:-translate-y-0.5
              "
            >
              Thử đánh giá nhu cầu ngay
              <IconChevronRight />
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          4. STATS — Chỉ số niềm tin
      ────────────────────────────────────────────── */}
      <section
        className="py-20 bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600"
        aria-label="Chỉ số niềm tin"
      >
        {/* Decorative top edge */}
        <div
          className="absolute left-0 right-0 -mt-20 h-20 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(79, 70, 229, 0) 100%)',
          }}
        />

        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Con số nói lên tất cả
            </h2>
            <p className="text-indigo-200 text-base">
              Hệ sinh thái đổi mới sáng tạo đang không ngừng lớn mạnh từng ngày
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-indigo-500/30">
            {STATS.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 100}>
                <div className="text-center px-6 py-4">
                  <div className="text-5xl sm:text-6xl font-black text-white mb-2 tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-base font-semibold text-indigo-100 mb-1">
                    {stat.label}
                  </div>
                  <div className="text-sm text-indigo-300 leading-relaxed">
                    {stat.sub}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────
          5. BOTTOM CTA
      ────────────────────────────────────────────── */}
      <section className="py-28 bg-white" aria-label="Kêu gọi hành động">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Reveal>
            {/* Decorative icon */}
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 mb-6">
              <IconRocket />
            </div>

            <span className="block text-sm font-semibold text-indigo-600 uppercase tracking-widest mb-4">
              Bắt đầu hành trình của bạn
            </span>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-5 leading-snug">
              Sẵn sàng đổi mới cùng Broker 4.0?
            </h2>

            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Hoàn thành bản đánh giá nhu cầu miễn phí trong 15 phút và nhận đề xuất
              ghép nối phù hợp nhất cho doanh nghiệp của bạn — không ràng buộc, không rủi ro.
            </p>

            {/* Primary CTA + Secondary link */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                variant="primary"
                onClick={() => navigate('/audit')}
                className="
                  group inline-flex items-center justify-center gap-2
                  w-full sm:w-auto px-10 py-4 rounded-xl text-base font-semibold
                  bg-indigo-600 hover:bg-indigo-500 text-white
                  transition-all duration-300
                  hover:shadow-2xl hover:shadow-indigo-200 hover:-translate-y-0.5
                "
              >
                Đánh giá nhu cầu miễn phí
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                  <IconChevronRight />
                </span>
              </Button>

              <button
                type="button"
                onClick={() => navigate('/matching')}
                className="
                  inline-flex items-center gap-1.5 font-semibold text-indigo-600
                  hover:text-indigo-500 transition-colors duration-200
                  group
                "
              >
                Xem danh sách chuyên gia
                <span className="group-hover:translate-x-1 transition-transform duration-200">
                  <IconChevronRight />
                </span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
              {TRUST_BADGES.map((badge) => (
                <span key={badge} className="inline-flex items-center gap-1.5">
                  <IconCheck />
                  {badge}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

    </main>
  );
}