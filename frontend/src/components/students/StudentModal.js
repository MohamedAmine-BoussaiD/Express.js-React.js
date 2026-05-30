import React, { useState, useEffect } from "react";

const YEARS = [1, 2, 3, 4, 5, 6, 7];

const emptyForm = {
  first_name: "", last_name: "", email: "", password: "",
  phone: "", date_of_birth: "", major: "", year_of_study: "1", address: "",
};

const StudentModal = ({ student, onClose, onSave }) => {
  const isEdit = !!student;
  const [form, setForm]     = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (isEdit) {
      setForm({
        first_name:    student.first_name    || "",
        last_name:     student.last_name     || "",
        email:         student.email         || "",
        password:      "",
        phone:         student.phone         || "",
        date_of_birth: student.date_of_birth ? student.date_of_birth.split("T")[0] : "",
        major:         student.major         || "",
        year_of_study: String(student.year_of_study || "1"),
        address:       student.address       || "",
      });
    }
  }, [isEdit, student]);

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "Required";
    if (!form.last_name.trim())  e.last_name  = "Required";
    if (!form.email)             e.email      = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!isEdit && !form.password) e.password = "Required";
    if (!isEdit && form.password && form.password.length < 6)
      e.password = "Min 6 characters";
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
      const payload = { ...form };
      if (isEdit && !payload.password) delete payload.password;
      await onSave(payload);
      onClose();
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? "Edit Student" : "Add New Student"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {apiError && <div className="alert alert-error" style={{margin:"0 24px 0"}}>{apiError}</div>}

        <form onSubmit={handleSubmit} className="modal-body" noValidate>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input name="first_name" value={form.first_name}
                onChange={handleChange} placeholder="John"
                className={errors.first_name ? "error" : ""} />
              {errors.first_name && <p className="field-error">{errors.first_name}</p>}
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input name="last_name" value={form.last_name}
                onChange={handleChange} placeholder="Doe"
                className={errors.last_name ? "error" : ""} />
              {errors.last_name && <p className="field-error">{errors.last_name}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input name="email" type="email" value={form.email}
                onChange={handleChange} placeholder="john@school.com"
                className={errors.email ? "error" : ""} />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
            <div className="form-group">
              <label>{isEdit ? "New Password (optional)" : "Password *"}</label>
              <input name="password" type="password" value={form.password}
                onChange={handleChange} placeholder={isEdit ? "Leave blank to keep" : "Min 6 chars"}
                className={errors.password ? "error" : ""} />
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone}
                onChange={handleChange} placeholder="+212 6XX XXX XXX" />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input name="date_of_birth" type="date" value={form.date_of_birth}
                onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Major</label>
              <input name="major" value={form.major}
                onChange={handleChange} placeholder="Computer Science" />
            </div>
            <div className="form-group">
              <label>Year of Study</label>
              <select name="year_of_study" value={form.year_of_study} onChange={handleChange}
                style={{width:"100%",padding:"10px 12px",border:"1.5px solid var(--border)",
                  borderRadius:"var(--radius)",fontFamily:"var(--font)",fontSize:"0.95rem",
                  color:"var(--text)",background:"var(--surface)"}}>
                {YEARS.map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <input name="address" value={form.address}
              onChange={handleChange} placeholder="Street, City, Country" />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{width:"auto"}}>
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
