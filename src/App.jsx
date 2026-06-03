// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import InnovationAudit from "./pages/Projects/InnovationAudit";
import MatchingCenter from "./pages/Matching/MatchingCenter";
import ProjectDashboard from "./pages/Projects/ProjectDashboard";
import ProjectHistory from "./pages/Projects/ProjectHistory";
import Home from "./pages/Home/Home";

// Placeholder pages (to be built in next sessions)
const Placeholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-gray-400">
    <p className="text-6xl">🚧</p>
    <p className="text-xl font-semibold">{title}</p>
    <p className="text-sm">Đang phát triển trong phiên tiếp theo</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Trả lại vị trí trang chủ cho đường dẫn gốc */}
          <Route index element={<Home />} /> 
          <Route path="audit" element={<InnovationAudit />} />
          <Route path="matching" element={<MatchingCenter />} />
          <Route path="dashboard" element={<ProjectDashboard />} />
          <Route path="history" element={<ProjectHistory />} />
          <Route path="community" element={<Placeholder title="Community & Blog" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}