import { Home, Calendar, Clock, User, Users, BarChart3, MapPin, LogOut, Map } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { cn } from "./ui/utils";
import { useAuth } from "../contexts/AuthContext";

interface SidebarProps {
  role: "patient" | "doctor" | "admin";
}

export function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const patientLinks = [
    { path: "/patient", label: "Accueil", icon: Home },
    { path: "/patient/intervention", label: "Intervention", icon: MapPin },
    { path: "/patient/appointment", label: "Rendez-vous", icon: Calendar },
    { path: "/patient/history", label: "Historique", icon: Clock }
  ];

  const doctorLinks = [
    { path: "/doctor", label: "Accueil", icon: Home },
    { path: "/doctor/requests", label: "Demandes", icon: Clock },
    { path: "/doctor/map", label: "Carte", icon: Map },
    { path: "/doctor/schedule", label: "Agenda", icon: Calendar },
    { path: "/doctor/history", label: "Historique", icon: BarChart3 }
  ];

  const adminLinks = [
    { path: "/admin", label: "Dashboard", icon: Home },
    { path: "/admin/tracking", label: "Suivi en direct", icon: MapPin },
    { path: "/admin/doctors", label: "Médecins", icon: Users },
    { path: "/admin/patients", label: "Patients", icon: User },
    { path: "/admin/analytics", label: "Analyses", icon: BarChart3 }
  ];

  const links = role === "patient" ? patientLinks : role === "doctor" ? doctorLinks : adminLinks;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const roleConfig = {
    patient: { label: "Patient", accent: "from-cyan-500 to-blue-600" },
    doctor: { label: "Médecin", accent: "from-emerald-500 to-teal-600" },
    admin: { label: "Administrateur", accent: "from-violet-500 to-purple-600" }
  };

  return (
    <div className="h-screen w-64 bg-gradient-sidebar flex flex-col fixed left-0 top-0 hidden lg:flex z-20">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleConfig[role].accent} flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">MediCare Pro</h1>
            <p className="text-xs text-slate-400 font-medium">{roleConfig[role].label}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3 px-4">Navigation</p>
        <ul className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                    isActive
                      ? "bg-white/10 text-white shadow-lg shadow-black/10"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {isActive && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b ${roleConfig[role].accent}`} />
                  )}
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  <span className="font-medium text-sm">{link.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 animate-pulse-soft" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          <span className="font-medium text-sm">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}