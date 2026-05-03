import { DashboardLayout } from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { User, Shield, Key, Mail, Phone, MapPin, Save, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { api } from "../services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function Settings() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        username: user.username,
        email: user.email || "",
      }));
      
      // Fetch additional profile data based on role
      const fetchProfileData = async () => {
        try {
          if (user.role === "patient" && user.patientId) {
            const data = await api.get<any>(`/patients/${user.patientId}`);
            setFormData(prev => ({ ...prev, email: data.email || "", phone: data.phone || "", address: data.address || "" }));
          } else if (user.role === "doctor" && user.doctorId) {
            const data = await api.get<any>(`/doctors/${user.doctorId}`);
            setFormData(prev => ({ ...prev, phone: data.phone || "", address: data.address || "" }));
          }
        } catch (error) {
          console.error("Error fetching profile details:", error);
        }
      };
      fetchProfileData();
    }
  }, [user]);

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // If user typed a new password, update it securely in Supabase Auth
      if (formData.password) {
        const { error: authError } = await supabase.auth.updateUser({ password: formData.password });
        if (authError) {
          toast.error("Erreur de sécurité lors de la mise à jour du mot de passe.");
          setLoading(false);
          return;
        }
      }

      // Update user account details (public profile)
      const userUpdate = { ...user, name: formData.name, username: formData.username };
      // We don't overwrite password in the `users` table anymore (it stays [SECURED_BY_SUPABASE])
      await api.put(`/users/${user.id}`, userUpdate);
      
      // Update role-specific details
      if (user.role === "patient" && user.patientId) {
        const patientData = await api.get<any>(`/patients/${user.patientId}`);
        await api.put(`/patients/${user.patientId}`, {
          ...patientData,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address
        });
      } else if (user.role === "doctor" && user.doctorId) {
        const doctorData = await api.get<any>(`/doctors/${user.doctorId}`);
        await api.put(`/doctors/${user.doctorId}`, {
          ...doctorData,
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        });
      }

      // Update auth context
      login(userUpdate);
      toast.success("Paramètres enregistrés avec succès !");
      if (formData.password) {
        setFormData(prev => ({ ...prev, password: "" }));
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde des paramètres.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role={user.role} userName={user.name} notificationCount={0}>
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Paramètres du profil</h1>
          <p className="text-slate-500">Gérez vos informations personnelles et préférences</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Tabs Menu */}
          <div className="w-full md:w-64 shrink-0 space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "profile" 
                  ? "bg-blue-50 text-blue-700 font-semibold" 
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <User className="w-5 h-5" />
              Informations générales
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === "security" 
                  ? "bg-blue-50 text-blue-700 font-semibold" 
                  : "hover:bg-slate-50 text-slate-600"
              }`}
            >
              <Shield className="w-5 h-5" />
              Sécurité & Mot de passe
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
                toast.info("Vous avez été déconnecté.");
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-red-50 text-red-600"
            >
              <LogOut className="w-5 h-5" />
              Se déconnecter
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-xl flex items-center gap-2">
                  {activeTab === "profile" ? (
                    <><User className="w-6 h-6 text-blue-500" /> Informations du compte</>
                  ) : (
                    <><Shield className="w-6 h-6 text-blue-500" /> Sécurité</>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6">
                
                {activeTab === "profile" && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" /> Nom complet
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" /> Nom d'utilisateur
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" /> Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed focus:outline-none transition-all"
                            title="L'email ne peut pas être modifié ici."
                          />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-400" /> Téléphone
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" /> Adresse
                          </label>
                          <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                )}

                {activeTab === "security" && (
                  <div className="space-y-5 animate-fade-in">
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
                      <Shield className="w-5 h-5 mt-0.5 text-amber-600 shrink-0" />
                      <p className="text-sm leading-relaxed">
                        Pour des raisons de sécurité, nous vous recommandons d'utiliser un mot de passe complexe, contenant des lettres, des chiffres et des caractères spéciaux.
                      </p>
                    </div>
                    
                    <div className="space-y-2 max-w-md">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <Key className="w-4 h-4 text-slate-400" /> Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        name="password"
                        placeholder="Laissez vide pour ne pas modifier"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <Button 
                    onClick={handleSave} 
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl px-8 h-12 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </div>
                
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
