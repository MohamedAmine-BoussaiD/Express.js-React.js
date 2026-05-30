import React, { useState, useEffect } from "react";

const empty = {
  code: "", name: "", description: "",
  credits: "3", capacity: "30", status: "active",
};

const CourseModal = ({ course, onClose, onSave }) => {
  const isEdit = !!course;
  const [form, setForm]       = useState(empty);
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (isEdit) {
      setForm({
        code:        course.code        || "",
        name:        course.name        || "",
        description: course.description || "",
        credits:     String(course.credits  || 3),
        capacity:    String(course.capacity || 30),
        status:      course.status      || "active",
      });
    }
  }, [isEdit, course]);

  const validate = () => {
    const e = {};
    if (!form.code.trim()) e.code = "Required";
    if (!form.name.trim()) e.name = "Required";
    if (!form.credits || form.credits < 1) e.credits = "Min 1";
    if (!form.capacity || form.capacity < 1) e.capacity = "Min 1";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await onSave({ ...form, credits: Number(form.credits), capacity: Number(form.capacity) });
      onClose();
    } catch (err) {
      setApiError(err.response?.data?.message || "Something went wrong.");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? "✏️ Edit Course" : "➕ New Course"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {apiError && <div className="alert alert-error" style={{margin:"0 24px 12px"}}>{apiError}</div>}

        <form onSubmit={handleSubmit} className="modal-body" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label>Course Code *</label>
              <input name="code" value={form.code} onChange={handleChange}
                placeholder="CS101" className={errors.code ? "error" : ""}
                style={{textTransform:"uppercase"}} />
              {errors.code && <p className="field-error">{errors.code}</p>}
            </div>
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Course Name *</label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="Introduction to Computer Science"
              className={errors.name ? "error" : ""} />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <input name="description" value={form.description} onChange={handleChange}
              placeholder="Brief description of the course…" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Credits *</label>
              <input name="credits" type="number" min="1" max="10"
                value={form.credits} onChange={handleChange}
                className={errors.credits ? "error" : ""} />
              {errors.credits && <p className="field-error">{errors.credits}</p>}
            </div>
            <div className="form-group">
              <label>Capacity (seats) *</label>
              <input name="capacity" type="number" min="1"
                value={form.capacity} onChange={handleChange}
                className={errors.capacity ? "error" : ""} />
              {errors.capacity && <p className="field-error">{errors.capacity}</p>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{width:"auto"}}>
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
