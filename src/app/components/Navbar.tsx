import { Bell, User, LogOut, Search, Activity, FileText } from "lucide-react";
import { Badge } from "./ui/badge";
import { MobileSidebar } from "./MobileSidebar";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useState, useEffect } from "react";
import { api } from "../services/api";
interface NavbarProps {
  userName: string;
  role: "patient" | "doctor" | "admin";
  notificationCount?: number;
}

export function Navbar({ userName, role, notificationCount = 0 }: NavbarProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{title: string, type: string, url: string}[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const invs = await api.get<any[]>('/interventions');
        let filtered = [];
        if (role === 'admin') {
          filtered = invs.filter(i => i.status === 'pending' || i.status === 'accepted');
        } else if (role === 'doctor') {
          filtered = invs.filter(i => i.status === 'pending');
        } else {
          filtered = invs.filter(i => i.patientId === user?.patientId && (i.status === 'accepted' || i.status === 'completed'));
        }
        setNotifications(filtered.reverse().slice(0, 5));
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };
    if (user) fetchNotifications();
  }, [role, user]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const doSearch = async () => {
      try {
        const [pats, docs, invs] = await Promise.all([
          api.get<any[]>('/patients'),
          api.get<any[]>('/doctors'),
          api.get<any[]>('/interventions')
        ]);
        const results: any[] = [];
        const q = searchQuery.toLowerCase();
        
        pats.forEach(p => {
          if (p.name.toLowerCase().includes(q)) results.push({ title: p.name, type: 'Patient', url: role === 'admin' ? '/admin/patients' : '#' });
        });
        docs.forEach(d => {
          if (d.name.toLowerCase().includes(q) || d.specialty?.toLowerCase().includes(q)) results.push({ title: d.name, type: 'Médecin', url: role === 'admin' ? '/admin/doctors' : '#' });
        });
        invs.forEach(i => {
          if (i.patientName.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)) {
            results.push({ title: `${i.type} - ${i.patientName}`, type: 'Intervention', url: `/${role}` });
          }
        });
        setSearchResults(results.slice(0, 6));
      } catch (error) {
        console.error("Failed to search", error);
      }
    };
    const debounceId = setTimeout(doSearch, 300);
    return () => clearTimeout(debounceId);
  }, [searchQuery, role]);

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
          <Dialog>
            <DialogTrigger asChild>
              <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors hidden md:flex">
                <Search className="w-5 h-5 text-slate-500" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
              <div className="flex items-center px-4 border-b border-slate-100">
                <Search className="w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher un patient, médecin ou intervention..." 
                  className="w-full p-4 focus:outline-none text-slate-700 bg-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto p-2">
                {searchQuery && searchResults.length === 0 ? (
                  <p className="text-center text-slate-500 py-6">Aucun résultat trouvé pour "{searchQuery}"</p>
                ) : (
                  <div className="space-y-1">
                    {searchResults.map((result, idx) => (
                      <div key={idx} onClick={() => { if (result.url !== '#') navigate(result.url); }} className="p-3 hover:bg-slate-50 rounded-xl cursor-pointer flex justify-between items-center transition-colors">
                        <span className="font-medium text-slate-800">{result.title}</span>
                        <Badge variant="outline" className="text-xs bg-white">{result.type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                {!searchQuery && (
                  <p className="text-center text-slate-400 py-6 text-sm">Commencez à taper pour rechercher...</p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative">
                <Bell className="w-5 h-5 text-slate-600" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-gradient-to-br from-red-500 to-rose-600 border-2 border-white animate-bounce-in">
                    {notifications.length}
                  </Badge>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 overflow-hidden shadow-xl border-slate-100 rounded-2xl">
              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex justify-between items-center backdrop-blur-sm">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                <Badge variant="secondary" className="bg-white text-xs">{notifications.length} nouvelles</Badge>
              </div>
              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">Aucune notification</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-4 hover:bg-blue-50/50 transition-colors cursor-pointer flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{notif.type}</p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">Patient: {notif.patientName}</p>
                          <p className="text-xs text-blue-600 mt-1 font-medium">{notif.status === 'pending' ? 'En attente' : 'Mise à jour'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-slate-100 bg-slate-50">
                <button className="w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                  Voir tout
                </button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-slate-200" />

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div 
              className="text-right hidden sm:block cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/settings")}
            >
              <p className="text-sm font-semibold text-slate-800">{userName}</p>
              <p className="text-xs text-slate-500 capitalize">{role}</p>
            </div>
            <div 
              className={`w-10 h-10 bg-gradient-to-br ${roleColors[role]} rounded-xl flex items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-all hover:scale-105`}
              onClick={() => navigate("/settings")}
              title="Paramètres du profil"
            >
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