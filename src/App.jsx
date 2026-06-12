// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import InnovationAudit from "./pages/Projects/InnovationAudit";
import MatchingCenter from "./pages/Matching/MatchingCenter";
import ProjectDashboard from "./pages/Projects/ProjectDashboard";
import ProjectHistory from "./pages/Projects/ProjectHistory";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import CommunityFeed from "./pages/Community/CommunityFeed";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Trả lại vị trí trang chủ cho đường dẫn gốc */}
            <Route index element={<Home />} /> 
            <Route path="audit" element={<InnovationAudit />} />
            <Route path="matching" element={<MatchingCenter />} />
            <Route path="dashboard" element={<ProjectDashboard />} />
            <Route path="history" element={<ProjectHistory />} />
            <Route path="community" element={<CommunityFeed />} />
            <Route path="auth/login" element={<Login />} />
            <Route path="auth/register" element={<Register />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}