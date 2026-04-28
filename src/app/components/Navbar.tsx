import { Bell, User, LogOut, Search } from "lucide-react";
import { Badge } from "./ui/badge";
import { MobileSidebar } from "./MobileSidebar";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";

interface NavbarProps {
  userName: string;
  role: "patient" | "doctor" | "admin";
  notificationCount?: number;
}

export function Navbar({ userName, role, notificationCount = 0 }: NavbarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const roleColors: Record<string, string> = {
    patient: "from-cyan-500 to-blue-600",
    doctor: "from-emerald-500 to-teal-600",
    admin: "from-violet-500 to-purple-600"
  };

  return (
    <div className="h-16 glass fixed top-0 right-0 left-0 lg:left-64 z-10 border-b border-white/20">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MobileSidebar role={role} />
          <div>
            <h2 className="text-base lg:text-lg font-semibold text-slate-800">
              Bienvenue, <span className="gradient-text">{userName}</span>
            </h2>
            <p className="text-xs text-slate-500 hidden sm:block">
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          {/* Search */}
          <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors hidden md:flex">
            <Search className="w-5 h-5 text-slate-500" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600" />
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-br from-red-500 to-rose-600 border-2 border-white animate-bounce-in">
                  {notificationCount}
                </Badge>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-slate-200" />

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{userName}</p>
              <p className="text-xs text-slate-500 capitalize">{role}</p>
            </div>
            <div className={`w-10 h-10 bg-gradient-to-br ${roleColors[role]} rounded-xl flex items-center justify-center shadow-md`}>
              <span className="text-white text-sm font-bold">{getInitials(userName)}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-1 p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}