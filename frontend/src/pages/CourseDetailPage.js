import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import EnrollModal from "../components/courses/EnrollModal";
import CourseService from "../services/courseService";

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [showEnroll, setShowEnroll] = useState(false);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCourse = useCallback(async () => {
    try {
      const result = await CourseService.getOne(id);
      setData(result);
    } catch {
      navigate("/courses");
    } finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { fetchCourse(); }, [fetchCourse]);

  const handleUnenroll = async (studentId, name) => {
    if (!window.confirm(`Remove ${name} from this course?`)) return;
    try {
      await CourseService.unenroll(id, studentId);
      showToast(`${name} removed from course.`);
      fetchCourse();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to unenroll.", "error");
    }
  };

  if (loading) return (
    <Layout>
      <div style={{display:"flex", alignItems:"center", justifyContent:"center", height:"60vh"}}>
        <div className="spinner" />
      </div>
    </Layout>
  );

  const { course, students } = data;
  const pct = Math.round((course.enrolled_count / course.capacity) * 100);

  return (
    <Layout>
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="page-header">
        <div style={{display:"flex", alignItems:"center", gap:14}}>
          <button onClick={() => navigate("/courses")}
            style={{background:"var(--surface-2)", border:"1px solid var(--border-2)",
              borderRadius:"var(--radius-sm)", padding:"8px 12px", cursor:"pointer",
              color:"var(--text-2)", fontSize:"0.85rem", fontFamily:"var(--font)"}}>
            ← Back
          </button>
          <div>
            <div style={{display:"flex", alignItems:"center", gap:10}}>
              <h1 className="page-title">{course.name}</h1>
              <span className={`status-pill status-pill--${course.status}`}>{course.status}</span>
            </div>
            <p className="page-subtitle">
              <span className="code-badge">{course.code}</span>
              &nbsp;·&nbsp;{course.credits} credits
            </p>
          </div>
        </div>
        <button className="btn btn-primary" style={{width:"auto"}}
          onClick={() => setShowEnroll(true)}
          disabled={course.enrolled_count >= course.capacity}>
          + Enroll Student
        </button>
      </div>

      {/* Info cards */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px,1fr))", gap:14, marginBottom:24}}>
        {[
          { label: "Enrolled",   value: course.enrolled_count, color: "#6366F1", bg: "rgba(99,102,241,0.1)" },
          { label: "Capacity",   value: course.capacity,       color: "#0EA5E9", bg: "rgba(14,165,233,0.1)" },
          { label: "Credits",    value: course.credits,        color: "#10B981", bg: "rgba(16,185,129,0.1)" },
          { label: "Seats Left", value: course.capacity - course.enrolled_count, color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
        ].map(c => (
          <div key={c.label} className="stat-card">
            <div className="stat-icon-wrap" style={{background: c.bg, fontSize:"1.2rem"}}>
              {c.label === "Enrolled" ? "🎓" : c.label === "Capacity" ? "💺" : c.label === "Credits" ? "⭐" : "🔓"}
            </div>
            <div>
              <div className="stat-value" style={{color: c.color}}>{c.value}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-body">
          <div className="progress-row" style={{marginBottom:0}}>
            <div className="progress-header">
              <span className="progress-label">Enrollment Capacity</span>
              <span className="progress-pct">{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{
                width: `${pct}%`,
                background: pct >= 90 ? "#F43F5E" : pct >= 70 ? "#F59E0B" : "#6366F1"
              }} />
            </div>
          </div>
          {course.description && (
            <p style={{color:"var(--text-2)", fontSize:"0.88rem", marginTop:16, lineHeight:1.7}}>
              {course.description}
            </p>
          )}
        </div>
      </div>

      {/* Enrolled students table */}
      <div className="table-card">
        <div className="card-header">
          <div>
            <div className="card-title">Enrolled Students</div>
            <div className="card-subtitle">{students.length} student{students.length !== 1 ? "s" : ""}</div>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="table-empty">
            <p style={{fontSize:"2rem", marginBottom:8}}>🎓</p>
            <p>No students enrolled yet.</p>
            <button className="btn btn-primary"
              style={{width:"auto", marginTop:14}}
              onClick={() => setShowEnroll(true)}>
              Enroll First Student
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Code</th>
                <th>Major</th>
                <th>Enrolled On</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="student-cell">
                      <div className="student-avatar">
                        {s.first_name[0]}{s.last_name[0]}
                      </div>
                      <div>
                        <div className="student-name">{s.first_name} {s.last_name}</div>
                        <div className="student-email">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="code-badge">{s.student_code}</span></td>
                  <td>{s.major || <span className="text-muted">—</span>}</td>
                  <td style={{fontFamily:"var(--font-mono)", fontSize:"0.78rem", color:"var(--text-3)"}}>
                    {new Date(s.enrolled_at).toLocaleDateString("en-GB")}
                  </td>
                  <td>
                    <button className="action-btn action-btn--delete"
                      onClick={() => handleUnenroll(s.id, `${s.first_name} ${s.last_name}`)}
                      title="Remove from course">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showEnroll && (
        <EnrollModal course={course} onClose={() => setShowEnroll(false)}
          onEnrolled={fetchCourse} />
      )}
    </Layout>
  );
};

export default CourseDetailPage;
