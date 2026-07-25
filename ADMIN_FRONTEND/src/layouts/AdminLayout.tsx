import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Film, Building2, Tv, Clock3, LayoutGrid, LogOut, Clapperboard } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/movies", label: "Movies", icon: Film, end: false },
  { to: "/theatres", label: "Theatres", icon: Building2, end: false },
  { to: "/screens", label: "Screens", icon: Tv, end: false },
  { to: "/shows", label: "Shows", icon: Clock3, end: false },
  { to: "/seats", label: "Seat Layout", icon: LayoutGrid, end: false },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#0b0d12] text-gray-200">
      <aside className="w-64 shrink-0 border-r border-white/5 bg-[#101319] flex flex-col">
        <div className="flex items-center gap-2 px-6 h-16 border-b border-white/5">
          <Clapperboard className="text-red-500" size={22} />
          <span className="font-semibold text-white tracking-tight">
            BookMyShow <span className="text-red-500">Admin</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-red-500/10 text-red-400"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5">
          <div className="px-3 py-2 mb-1">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}