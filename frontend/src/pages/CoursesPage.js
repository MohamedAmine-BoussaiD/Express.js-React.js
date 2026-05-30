import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import CourseModal from "../components/courses/CourseModal";
import CourseService from "../services/courseService";

const CoursesPage = () => {
  const navigate = useNavigate();

  const [courses, setCourses]     = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]     = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage]           = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CourseService.getAll({
        page, limit: 12,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setCourses(data.courses);
      setPagination(data.pagination);
    } catch {
      showToast("Failed to load courses.", "error");
    } finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleCreate = async (data) => {
    await CourseService.create(data);
    showToast("Course created! 🎉");
    fetchCourses();
  };

  const handleUpdate = async (data) => {
    await CourseService.update(editCourse.id, data);
    showToast("Course updated.");
    fetchCourses();
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Delete "${course.name}"? This will also remove all enrollments.`)) return;
    try {
      await CourseService.delete(course.id);
      showToast("Course deleted.");
      fetchCourses();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete.", "error");
    }
  };

  const pctFull = (c) => Math.round((c.enrolled_count / c.capacity) * 100);

  const capacityColor = (c) => {
    const p = pctFull(c);
    if (p >= 90) return "#F43F5E";
    if (p >= 70) return "#F59E0B";
    return "#10B981";
  };

  return (
    <Layout>
      {toast && <div className={`toast toast--${toast.type}`}>{toast.msg}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Courses</h1>
          <p className="page-subtitle">{pagination.total} course{pagination.total !== 1 ? "s" : ""} total</p>
        </div>
        <button className="btn btn-primary" style={{width:"auto"}}
          onClick={() => setShowCreate(true)}>
          + New Course
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <span>🔍</span>
          <input placeholder="Search by name or code…"
            value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          {searchInput && <button onClick={() => setSearchInput("")}>✕</button>}
        </div>
        <select className="filter-select" value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="table-loading"><div className="spinner" /><p>Loading courses…</p></div>
      ) : courses.length === 0 ? (
        <div className="table-empty">
          <p style={{fontSize:"2.5rem", marginBottom:10}}>📚</p>
          <p style={{marginBottom:4}}>No courses found.</p>
          <button className="btn btn-primary" style={{width:"auto", marginTop:14}}
            onClick={() => setShowCreate(true)}>
            Create your first course
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(c => (
            <div key={c.id} className="course-card"
              onClick={() => navigate(`/courses/${c.id}`)}>

              {/* Card header */}
              <div className="course-card-header">
                <div className="course-card-icon">📚</div>
                <div style={{flex:1, minWidth:0}}>
                  <div className="course-code">{c.code}</div>
                  <span className={`status-pill status-pill--${c.status}`}>{c.status}</span>
                </div>
                <div className="course-card-actions" onClick={e => e.stopPropagation()}>
                  <button className="action-btn action-btn--edit"
                    onClick={() => setEditCourse(c)} title="Edit">✏️</button>
                  <button className="action-btn action-btn--delete"
                    onClick={() => handleDelete(c)} title="Delete">🗑️</button>
                </div>
              </div>

              {/* Card body */}
              <div className="course-card-body">
                <h3 className="course-name">{c.name}</h3>
                {c.description && (
                  <p className="course-desc">{c.description}</p>
                )}
              </div>

              {/* Card footer */}
              <div className="course-card-footer">
                <div className="course-meta">
                  <span>⭐ {c.credits} credits</span>
                  <span>💺 {c.enrolled_count}/{c.capacity}</span>
                </div>
                <div className="progress-bar" style={{marginTop:10}}>
                  <div className="progress-fill" style={{
                    width: `${pctFull(c)}%`,
                    background: capacityColor(c),
                  }} />
                </div>
                <div style={{
                  fontSize:"0.73rem", color: capacityColor(c),
                  fontWeight:700, marginTop:5, textAlign:"right"
                }}>
                  {pctFull(c)}% full
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1}
            onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span className="page-info">Page {page} of {pagination.pages}</span>
          <button className="page-btn" disabled={page === pagination.pages}
            onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {showCreate && (
        <CourseModal onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}
      {editCourse && (
        <CourseModal course={editCourse}
          onClose={() => setEditCourse(null)} onSave={handleUpdate} />
      )}
    </Layout>
  );
};

export default CoursesPage;
