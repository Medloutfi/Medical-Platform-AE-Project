import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { User, Lock, Shield, Stethoscope, Heart, ArrowRight } from "lucide-react";
import { supabase, api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor" | "admin">("patient");
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (!supabase) {
      toast.error("Supabase n'est pas configuré");
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        // Sign Up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Create user record in our public table
          const newUser = await api.post<any>('/users', {
            auth_id: authData.user.id,
            email,
            name,
            role,
            username: email.split('@')[0], // fallback
          });
          login(newUser);
          toast.success("Compte créé avec succès!");
          navigate(`/${role}`);
        }
      } else {
        // Sign In
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Fetch user profile from public table
          const users = await api.get<any[]>(`/users?auth_id=${authData.user.id}`);
          if (users && users.length > 0) {
            login(users[0]);
            toast.success(`Bienvenue, ${users[0].name}`);
            navigate(`/${users[0].role}`);
          } else {
            // Fallback for legacy test accounts
            const legacyUsers = await api.get<any[]>(`/users?username=${email}`);
            if (legacyUsers && legacyUsers.length > 0) {
              login(legacyUsers[0]);
              navigate(`/${legacyUsers[0].role}`);
            } else {
              toast.error("Profil utilisateur introuvable");
            }
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Erreur d'authentification");
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (uname: string) => {
    // For legacy mock login only
    setIsLoading(true);
    try {
      const users = await api.get<any[]>(`/users?username=${uname}`);
      if (users && users.length > 0) {
        login(users[0]);
        toast.success(`Connecté via compte test: ${users[0].name}`);
        navigate(`/${users[0].role}`);
      }
    } catch (error) {
      toast.error("Erreur de connexion");
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
            <CardTitle className="text-xl text-white">
              {isSignUp ? "Créer un compte" : "Connexion Sécurisée"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {isSignUp ? "Rejoignez la plateforme MediCare" : "Saisissez vos identifiants pour continuer"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <User className="w-4 h-4 text-cyan-400" /> Nom complet
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: Dr. Ahmed Tazi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:border-cyan-400 focus:ring-cyan-400/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan-400" /> Je suis un...
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole("patient")}
                        className={`p-2 rounded-xl text-sm font-medium border transition-colors ${role === "patient" ? "bg-cyan-500/20 border-cyan-500 text-cyan-400" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}
                      >
                        Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("doctor")}
                        className={`p-2 rounded-xl text-sm font-medium border transition-colors ${role === "doctor" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"}`}
                      >
                        Médecin
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" /> Email
                </label>
                <Input
                  type="email"
                  placeholder="Ex: contact@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {isLoading ? "Traitement..." : (
                  <>
                    {isSignUp ? "Créer mon compte" : "Se connecter"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-slate-300 hover:text-white transition-colors text-sm"
          >
            {isSignUp ? "Déjà un compte ? Connectez-vous" : "Pas encore de compte ? S'inscrire"}
          </button>
        </div>

        {/* Quick Login */}
        <div className="mt-6 space-y-3">
          <p className="text-center text-sm text-slate-500 font-medium">Accès rapide (comptes de test)</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Admin", username: "admin1", icon: Shield, color: "from-violet-500 to-purple-600" },
              { label: "Médecin", username: "doctor1", icon: Stethoscope, color: "from-emerald-500 to-teal-600" },
              { label: "Patient", username: "patient1", icon: Heart, color: "from-cyan-500 to-blue-600" },
            ].map((account) => {
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
