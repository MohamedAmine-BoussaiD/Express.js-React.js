import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/students",  icon: "🎓", label: "Students" },
  // future:
  // { to: "/courses",   icon: "📚", label: "Courses" },
  // { to: "/grades",    icon: "📊", label: "Grades" },
];

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className={`layout ${collapsed ? "layout--collapsed" : ""}`}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo">🎓</span>
          {!collapsed && <span className="sidebar-title">EduManage</span>}
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "sidebar-link--active" : ""}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            {!collapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">
                  {user?.first_name} {user?.last_name}
                </span>
                <span className="sidebar-user-role">{user?.role}</span>
              </div>
            )}
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Sign out">
            🚪
          </button>
        </div>

        <button
          className="sidebar-toggle"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
