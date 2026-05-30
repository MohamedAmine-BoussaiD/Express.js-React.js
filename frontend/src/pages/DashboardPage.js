import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import StudentService from "../services/studentService";
import CourseService from "../services/courseService";

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div className="stat-card stat-card--clickable" onClick={onClick}
    style={{ "--stat-color": color, cursor: onClick ? "pointer" : "default" }}>
    <div className="stat-icon-wrap" style={{ background: color + "22" }}>
      {icon}
    </div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: "…", courses: "…" });

  useEffect(() => {
    Promise.all([
      StudentService.getAll({ limit: 1 }),
      CourseService.getAll({ limit: 1 }),
    ]).then(([s, c]) => {
      setStats({
        students: s.pagination.total,
        courses:  c.pagination.total,
      });
    }).catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.first_name}!</p>
        </div>
        <span className={`badge badge-${user?.role}`}>{user?.role}</span>
      </div>

      <div className="stats-grid">
        <StatCard icon="🎓" label="Total Students" value={stats.students}
          color="#6366F1" onClick={() => navigate("/students")} />
        <StatCard icon="📚" label="Courses"        value={stats.courses}
          color="#10B981" onClick={() => navigate("/courses")} />
        <StatCard icon="📊" label="Grades Entered" value="—"  color="#F59E0B" />
        <StatCard icon="📅" label="Attendance Rate" value="—" color="#0EA5E9" />
      </div>

      <div className="dashboard-hint">
        💡 Click any card to navigate to that section.
      </div>
    </Layout>
  );
};

export default DashboardPage;