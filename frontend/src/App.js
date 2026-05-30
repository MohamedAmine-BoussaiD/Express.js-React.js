import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, GuestRoute } from "./components/ProtectedRoute";

import LoginPage        from "./pages/LoginPage";
import RegisterPage     from "./pages/RegisterPage";
import DashboardPage    from "./pages/DashboardPage";
import StudentsPage     from "./pages/StudentsPage";
import CoursesPage      from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";

import "./index.css";
import "./courses-extra.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Guest only */}
          <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

          <Route path="/students" element={
            <ProtectedRoute roles={["admin"]}><StudentsPage /></ProtectedRoute>
          } />

          <Route path="/courses" element={
            <ProtectedRoute roles={["admin"]}><CoursesPage /></ProtectedRoute>
          } />

          <Route path="/courses/:id" element={
            <ProtectedRoute roles={["admin"]}><CourseDetailPage /></ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
