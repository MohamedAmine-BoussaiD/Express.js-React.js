import React, { useState } from "react";

const DeleteModal = ({ student, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try { await onConfirm(); onClose(); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2>Delete Student</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div style={{ textAlign: "center", padding: "8px 0 24px" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <p style={{ fontSize: "1rem", color: "var(--text)", marginBottom: 8 }}>
              Are you sure you want to deactivate
            </p>
            <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              {student.first_name} {student.last_name}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 8 }}>
              Student code: {student.student_code}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 16 }}>
              The account will be deactivated and hidden from the list.
            </p>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-danger" onClick={handleConfirm} disabled={loading}
              style={{width:"auto"}}>
              {loading ? "Deleting…" : "Yes, deactivate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
