import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Password strength helper
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8)            score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthMeta = {
  0: { label: "",        color: "transparent", width: "0%" },
  1: { label: "Weak",    color: "#F25C5C",     width: "25%" },
  2: { label: "Fair",    color: "#F5A623",     width: "50%" },
  3: { label: "Good",    color: "#4F6EF7",     width: "75%" },
  4: { label: "Strong",  color: "#0FC4A1",     width: "100%" },
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const strength = getStrength(form.password);
  const meta     = strengthMeta[strength];

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "First name is required.";
    if (!form.last_name.trim())  e.last_name  = "Last name is required.";
    if (!form.email)             e.email      = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password)          e.password   = "Password is required.";
    else if (form.password.length < 8)  e.password = "At least 8 characters.";
    else if (!/[A-Z]/.test(form.password)) e.password = "Must contain an uppercase letter.";
    else if (!/[0-9]/.test(form.password)) e.password = "Must contain a number.";
    if (form.password !== form.confirm_password)
      e.confirm_password = "Passwords do not match.";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
    if (apiError) setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { first_name, last_name, email, password } = form;
      await register({ first_name, last_name, email, password });
      navigate("/dashboard");
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* ── Brand Panel ── */}
      <div className="auth-brand">
        <div className="brand-logo">🎓</div>
        <h2 className="brand-title">EduManage</h2>
        <p className="brand-subtitle">
          Join thousands of students managing their academic journey in one place.
        </p>
        <div className="brand-features">
          {[
            { icon: "✅", label: "Free student registration" },
            { icon: "📚", label: "Access course materials" },
            { icon: "📝", label: "Submit assignments online" },
            { icon: "🔔", label: "Get instant notifications" },
          ].map((f) => (
            <div className="brand-feature" key={f.label}>
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-form-header">
            <h1>Create your account</h1>
            <p>Start your academic journey today</p>
          </div>

          {apiError && (
            <div className="alert alert-error">❌ {apiError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Name row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="John"
                    value={form.first_name}
                    onChange={handleChange}
                    className={errors.first_name ? "error" : ""}
                  />
                </div>
                {errors.first_name && <p className="field-error">{errors.first_name}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Last name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Doe"
                    value={form.last_name}
                    onChange={handleChange}
                    className={errors.last_name ? "error" : ""}
                  />
                </div>
                {errors.last_name && <p className="field-error">{errors.last_name}</p>}
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@school.com"
                  value={form.email}
                  onChange={handleChange}
                  className={errors.email ? "error" : ""}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 chars, 1 uppercase, 1 number"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPass((s) => !s)}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
              {form.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{ width: meta.width, background: meta.color }}
                    />
                  </div>
                  <span className="strength-label" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirm_password">Confirm password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔑</span>
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showPass ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  className={errors.confirm_password ? "error" : ""}
                  autoComplete="new-password"
                />
              </div>
              {errors.confirm_password && (
                <p className="field-error">{errors.confirm_password}</p>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Creating account…
                </>
              ) : (
                "Create account →"
              )}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
