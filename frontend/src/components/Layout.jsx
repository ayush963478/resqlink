import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_BY_ROLE = {
  requester: [
    { to: "/app", label: "My requests", end: true },
    { to: "/app/requests/new", label: "New request" },
    { to: "/app/resources", label: "Browse resources" },
    { to: "/app/notifications", label: "Notifications" },
    { to: "/app/history", label: "History" },
  ],
  provider: [
    { to: "/app", label: "My resources", end: true },
    { to: "/app/notifications", label: "Notifications" },
    { to: "/app/history", label: "History" },
  ],
  coordinator: [
    { to: "/app", label: "Active requests", end: true },
    { to: "/app/notifications", label: "Notifications" },
    { to: "/app/history", label: "History" },
  ],
  administrator: [
    { to: "/app", label: "Admin panel", end: true },
    { to: "/app/notifications", label: "Notifications" },
    { to: "/app/history", label: "History" },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const items = NAV_BY_ROLE[user?.role] || [];

  return (
    <div className="min-h-screen flex bg-ink">
      <aside className="w-60 shrink-0 border-r border-line flex flex-col">
        <div className="px-5 py-5 border-b border-line">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-display font-semibold text-lg tracking-tight">ResQLink</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Coordination console</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? "nav-link-active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-line">
          <p className="text-sm text-slate-200 truncate">{user?.name}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-mono">{user?.role}</p>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="btn-ghost mt-3 w-full justify-center text-xs"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
