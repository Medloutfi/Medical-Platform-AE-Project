import { Home, Calendar, Clock, User, Users, BarChart3, MapPin, LogOut, Menu, Map } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { cn } from "./ui/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";

interface MobileSidebarProps {
  role: "patient" | "doctor" | "admin";
}

export function MobileSidebar({ role }: MobileSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

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

  const roleConfig = {
    patient: { label: "Patient", accent: "from-cyan-500 to-blue-600" },
    doctor: { label: "Médecin", accent: "from-emerald-500 to-teal-600" },
    admin: { label: "Administrateur", accent: "from-violet-500 to-purple-600" }
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-gradient-sidebar border-0">
        <div className="h-full flex flex-col">
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

          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
