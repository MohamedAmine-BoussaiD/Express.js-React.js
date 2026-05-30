import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import StudentService from "../services/studentService";

const StatCard = ({ icon, label, value, color, onClick }) => (
  <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
    <div className="stat-icon" style={{ background: color }}>{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: "…" });

  useEffect(() => {
    StudentService.getAll({ limit: 1 })
      .then(d => setStats({ total: d.pagination.total }))
      .catch(() => {});
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
        <StatCard icon="🎓" label="Total Students" value={stats.total}
          color="rgba(79,110,247,0.12)" onClick={() => navigate("/students")} />
        <StatCard icon="📚" label="Courses" value="—" color="rgba(15,196,161,0.12)" />
        <StatCard icon="📊" label="Grades Entered" value="—" color="rgba(245,166,35,0.12)" />
        <StatCard icon="📅" label="Attendance Rate" value="—" color="rgba(46,204,113,0.12)" />
      </div>

      <div className="dashboard-hint">
        <p>💡 Click <strong>Students</strong> in the sidebar to manage student records.</p>
      </div>
    </Layout>
  );
};

export default DashboardPage;
