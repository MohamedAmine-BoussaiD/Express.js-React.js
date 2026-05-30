import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/Layout";
import StudentModal from "../components/students/StudentModal";
import DeleteModal from "../components/students/DeleteModal";
import StudentService from "../services/studentService";
import "../students.css";

const StudentsPage = () => {
  const [students, setStudents]   = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [majorFilter, setMajorFilter] = useState("");
  const [majors, setMajors]       = useState([]);
  const [page, setPage]           = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteStudent, setDeleteStudent] = useState(null);
  const [toast, setToast]         = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await StudentService.getAll({
        page, limit: 10,
        search: search || undefined,
        major: majorFilter || undefined,
      });
      setStudents(data.students);
      setPagination(data.pagination);
    } catch {
      showToast("Failed to load students.", "error");
    } finally {
      setLoading(false);
    }
  }, [page, search, majorFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    StudentService.getMajors().then(setMajors).catch(() => {});
  }, []);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleCreate = async (data) => {
    await StudentService.create(data);
    showToast("Student created successfully! 🎉");
    fetchStudents();
  };

  const handleUpdate = async (data) => {
    await StudentService.update(editStudent.id, data);
    showToast("Student updated successfully.");
    fetchStudents();
  };

  const handleDelete = async () => {
    await StudentService.delete(deleteStudent.id);
    showToast("Student deactivated.");
    fetchStudents();
  };

  const yearLabel = (y) => {
    const s = ["st","nd","rd"];
    return `${y}${s[y-1] || "th"} Year`;
  };

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div className={`toast toast--${toast.type}`}>{toast.msg}</div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">
            {pagination.total} total student{pagination.total !== 1 ? "s" : ""}
          </p>
        </div>
        <button className="btn btn-primary" style={{ width: "auto" }}
          onClick={() => setShowCreate(true)}>
          + Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <span>🔍</span>
          <input
            placeholder="Search by name, email or student code…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(""); }}>✕</button>
          )}
        </div>

        <select
          className="filter-select"
          value={majorFilter}
          onChange={e => { setMajorFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Majors</option>
          {majors.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-card">
        {loading ? (
          <div className="table-loading">
            <div className="spinner" />
            <p>Loading students…</p>
          </div>
        ) : students.length === 0 ? (
          <div className="table-empty">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
            <p>No students found.</p>
            <button className="btn btn-primary" style={{ width: "auto", marginTop: 16 }}
              onClick={() => setShowCreate(true)}>
              Add your first student
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Code</th>
                <th>Major</th>
                <th>Year</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Actions</th>
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
                        <div className="student-name">
                          {s.first_name} {s.last_name}
                        </div>
                        <div className="student-email">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="code-badge">{s.student_code}</span></td>
                  <td>{s.major || <span className="text-muted">—</span>}</td>
                  <td>{s.year_of_study ? yearLabel(s.year_of_study) : "—"}</td>
                  <td>{s.phone || <span className="text-muted">—</span>}</td>
                  <td>{new Date(s.created_at).toLocaleDateString("en-GB")}</td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn action-btn--edit"
                        onClick={() => setEditStudent(s)} title="Edit">
                        ✏️
                      </button>
                      <button className="action-btn action-btn--delete"
                        onClick={() => setDeleteStudent(s)} title="Delete">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page === 1}
            onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span className="page-info">
            Page {page} of {pagination.pages}
          </span>
          <button className="page-btn" disabled={page === pagination.pages}
            onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <StudentModal onClose={() => setShowCreate(false)} onSave={handleCreate} />
      )}
      {editStudent && (
        <StudentModal student={editStudent}
          onClose={() => setEditStudent(null)} onSave={handleUpdate} />
      )}
      {deleteStudent && (
        <DeleteModal student={deleteStudent}
          onClose={() => setDeleteStudent(null)} onConfirm={handleDelete} />
      )}
    </Layout>
  );
};

export default StudentsPage;
