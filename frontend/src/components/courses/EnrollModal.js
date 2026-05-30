import React, { useState, useEffect } from "react";
import CourseService from "../../services/courseService";

const EnrollModal = ({ course, onClose, onEnrolled }) => {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    CourseService.getAvailableStudents(course.id)
      .then(setStudents)
      .catch(() => setError("Failed to load students."))
      .finally(() => setFetching(false));
  }, [course.id]);

  const handleEnroll = async () => {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      await CourseService.enroll(course.id, selected);
      onEnrolled();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Enrollment failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{maxWidth:460}}>
        <div className="modal-header">
          <h2>🎓 Enroll Student</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <p style={{color:"var(--text-2)", fontSize:"0.88rem", marginBottom:18}}>
            Adding student to <strong style={{color:"var(--text)"}}>{course.name}</strong>
            &nbsp;·&nbsp;
            <span style={{color:"var(--text-3)"}}>
              {course.enrolled_count}/{course.capacity} seats filled
            </span>
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          {fetching ? (
            <div style={{textAlign:"center", padding:"20px 0"}}>
              <div className="spinner" style={{margin:"0 auto"}} />
            </div>
          ) : students.length === 0 ? (
            <div style={{textAlign:"center", padding:"20px 0", color:"var(--text-3)"}}>
              <p style={{fontSize:"2rem", marginBottom:8}}>✅</p>
              <p>All active students are already enrolled in this course.</p>
            </div>
          ) : (
            <div className="form-group">
              <label>Select Student</label>
              <select value={selected} onChange={e => setSelected(e.target.value)}
                style={{width:"100%", padding:"10px 12px",
                  background:"var(--surface-2)", border:"1.5px solid var(--border-2)",
                  borderRadius:"var(--radius)", fontFamily:"var(--font)",
                  fontSize:"0.88rem", color:"var(--text)", outline:"none"}}>
                <option value="">— Choose a student —</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name} · {s.student_code}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleEnroll}
              disabled={!selected || loading} style={{width:"auto"}}>
              {loading ? "Enrolling…" : "Enroll Student"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollModal;
