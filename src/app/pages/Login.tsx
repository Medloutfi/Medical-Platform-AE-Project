import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { User, Lock, Shield, Stethoscope, Heart, ArrowRight } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      const users = await api.get<any[]>(`/users?username=${username}&password=${password}`);
      if (users && users.length > 0) {
        const user = users[0];
        login(user);
        toast.success(`Bienvenue, ${user.name}`);
        navigate(`/${user.role}`);
      } else {
        toast.error("Nom d'utilisateur ou mot de passe incorrect");
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur. Assurez-vous que le backend est lancé.");
    } finally {
      setIsLoading(false);
    }
  };

  const testAccounts = [
    { label: "Admin", username: "admin1", icon: Shield, color: "from-violet-500 to-purple-600" },
    { label: "Médecin", username: "doctor1", icon: Stethoscope, color: "from-emerald-500 to-teal-600" },
    { label: "Patient", username: "patient1", icon: Heart, color: "from-cyan-500 to-blue-600" },
  ];

  const quickLogin = async (uname: string) => {
    setUsername(uname);
    setPassword("password");
    setIsLoading(true);
    try {
      const users = await api.get<any[]>(`/users?username=${uname}&password=password`);
      if (users && users.length > 0) {
        login(users[0]);
        toast.success(`Bienvenue, ${users[0].name}`);
        navigate(`/${users[0].role}`);
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl shadow-2xl shadow-cyan-500/30 mb-4">
            <span className="text-3xl font-black text-white">M</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
            Medi<span className="text-cyan-400">Care</span> Pro
          </h1>
          <p className="text-slate-400">Plateforme de gestion médicale intelligente</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-0 glass-dark bg-white/5 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl text-white">Connexion</CardTitle>
            <CardDescription className="text-slate-400">Saisissez vos identifiants pour continuer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" /> Nom d'utilisateur
                </label>
                <Input
                  type="text"
                  placeholder="Ex: patient1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-cyan-400 focus:ring-cyan-400/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-cyan-400" /> Mot de passe
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-cyan-400 focus:ring-cyan-400/20"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-13 text-base mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl shadow-lg shadow-cyan-500/25 transition-all hover:shadow-xl font-semibold"
              >
                {isLoading ? "Connexion en cours..." : (
                  <>
                    Se connecter
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Login */}
        <div className="mt-6 space-y-3">
          <p className="text-center text-sm text-slate-500 font-medium">Accès rapide (comptes de test)</p>
          <div className="grid grid-cols-3 gap-3">
            {testAccounts.map((account) => {
              const Icon = account.icon;
              return (
                <button
                  key={account.username}
                  onClick={() => quickLogin(account.username)}
                  disabled={isLoading}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:bg-white/10 transition-all hover:border-white/20 hover:scale-105"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${account.color} rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-white text-sm font-semibold">{account.label}</p>
                  <p className="text-slate-500 text-xs mt-0.5 font-mono">{account.username}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
