// src/layouts/MainLayout.jsx
import React, { useContext, useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

const NAV_LINKS = [
  { to: "/audit", label: "Đánh giá nhu cầu" },
  { to: "/matching", label: "Trung tâm kết nối" },
  { to: "/history", label: "Dự án của tôi" },
  { to: "/community", label: "Cộng đồng" },
];

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shadow-sm">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </span>
              <span className="text-xl font-bold text-gray-800 tracking-tight">
                Broker
                <span className="text-blue-600">4.0</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    [
                      "px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    ].join(" ")
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={logout}
                    className="px-4 py-2 rounded-md border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors duration-150"
                  >
                    Đăng xuất
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150"
                  >
                    Dashboard
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/auth/login"
                    className="px-4 py-2 rounded-md text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100 transition-colors duration-150"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/auth/register"
                    className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-3 pt-2 space-y-1">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    "block px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100",
                  ].join(" ")
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-gray-500">
            © 2025 Broker4.0 · Tech-Marketplace for SMEs & Academia
          </p>
          <div className="flex gap-4 text-sm text-blue-600">
            <a href="#" className="hover:underline">
              Chính sách
            </a>
            <a href="#" className="hover:underline">
              Liên hệ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}