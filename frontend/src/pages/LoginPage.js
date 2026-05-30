import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm]           = useState({ email: "", password: "" });
  const [errors, setErrors]       = useState({});
  const [apiError, setApiError]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  const sessionExpired = new URLSearchParams(location.search).get("session") === "expired";
  const from = location.state?.from?.pathname || "/dashboard";

  const validate = () => {
    const e = {};
    if (!form.email)                        e.email    = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password)                     e.password = "Password is required.";
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
    setApiError("");
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setApiError(
        err.response?.data?.message || "Login failed. Please try again."
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
          A complete student management system for modern educational institutions.
        </p>
        <div className="brand-features">
          {[
            { icon: "", label: "Real-time grade tracking" },
            { icon: "", label: "Attendance & scheduling" },
            { icon: "", label: "Student & faculty portal" },
            { icon: "", label: "Analytics & reporting" },
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
            <h1>Welcome back 👋</h1>
            <p>Sign in to access your portal</p>
          </div>

          {sessionExpired && (
            <div className="alert alert-error">
              ⚠️ Your session expired. Please sign in again.
            </div>
          )}

          {apiError && (
            <div className="alert alert-error">
              ❌ {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
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
                <span className="input-icon"></span>
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className={errors.password ? "error" : ""}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPass((s) => !s)}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? "👁️" : "👁️"}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  Signing in…
                </>
              ) : (
                "Sign in →"
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
