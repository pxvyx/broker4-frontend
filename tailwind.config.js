// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
        keyframes: {
          fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
          slowZoom: {
            '0%': { transform: 'scale(1)' },
            '100%': { transform: 'scale(1.08)' },
          }
        },
        animation: {
          'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          'slow-zoom': 'slowZoom 25s ease-in-out infinite alternate',
        },
        fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

// ─── Chỉ phần cần paste vào theme.extend ───
