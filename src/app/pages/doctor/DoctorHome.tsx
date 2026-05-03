import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { StatCard } from "../../components/StatCard";
import { Calendar, Clock, CheckCircle, Users, ArrowRight, MapPin, Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { api } from "../../services/api";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { DirectChat } from "../../components/DirectChat";
import { BillingModal } from "../../components/BillingModal";
import { Phone, Ticket, CreditCard } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function DoctorHome() {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [billingOpen, setBillingOpen] = useState(false);

  const fetchDoctorData = async () => {
    if (!user) return;
    try {
      const queryId = user.doctorId || user.id;
      const [invs, apps, docs] = await Promise.all([
        api.get<any[]>(`/interventions`),
        api.get<any[]>(`/appointments`),
        api.get<any[]>('/doctors')
      ]);
      
      setInterventions(invs.filter(i => i.doctorId === queryId || i.status === "pending"));
      setAppointments(apps.filter(a => a.doctorId === queryId));
      
      const myProfile = docs.find(d => d.id === queryId) || { id: queryId, name: user.name, rating: "N/A", experience: "N/A", status: "Disponible" };
      setDoctorProfile(myProfile);
      if (myProfile.available !== undefined) setIsAvailable(myProfile.available);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  const handleArrived = async (id: number) => {
    try {
      await api.patch(`/interventions/${id}`, { status: "arrived" });
      setInterventions(prev => prev.map(i => i.id === id ? { ...i, status: "arrived" } : i));
      toast.success("Statut mis à jour : Arrivé sur place");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleCompleteMission = async (id: number) => {
    try {
      await api.patch(`/interventions/${id}`, { status: "completed" });
      setInterventions(prev => prev.map(i => i.id === id ? { ...i, status: "completed" } : i));
      toast.success("Intervention marquée comme terminée !");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleToggleAvailability = async (checked: boolean) => {
    setIsAvailable(checked);
    if (doctorProfile) {
      try {
        await api.patch(`/doctors/${doctorProfile.id}`, { available: checked });
        toast.info(checked ? "Vous êtes maintenant en ligne" : "Vous êtes maintenant hors ligne");
      } catch (error) {
        toast.error("Erreur lors de la mise à jour du statut");
        setIsAvailable(!checked); // revert on failure
      }
    }
  };

  const pendingRequests = interventions.filter(i => i.status === "pending");
  const activeRequest = interventions.find(i => i.status === "accepted" || i.status === "arrived");

  return (
    <DashboardLayout role="doctor" userName={user?.name || "Médecin"} notificationCount={2}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Tableau de bord</h1>
            <p className="text-slate-500">Gérez vos consultations et demandes d'intervention</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Wallet Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white min-w-[200px]">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-indigo-100 font-medium">Mon Portefeuille</p>
                  <Ticket className="w-4 h-4 text-indigo-200" />
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      {doctorProfile?.subscriptionPlan === 'premium' ? '∞' : (doctorProfile?.credits || 0)}
                    </span>
                    <span className="text-xs text-indigo-200">passes</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="h-7 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
                    onClick={() => setBillingOpen(true)}
                  >
                    Recharger
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg min-w-[200px]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Disponibilité</p>
                    <p className={`font-bold ${isAvailable ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {isAvailable ? "✓ En ligne" : "Occupé(e)"}
                    </p>
                  </div>
                  <div className="relative mt-2">
                    <Switch
                      checked={isAvailable}
                      onCheckedChange={handleToggleAvailability}
                    />
                    {isAvailable && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse-soft" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          <StatCard
            title="Demandes en attente"
            value={pendingRequests.length}
            icon={Clock}
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
            delay={0}
          />
          <StatCard
            title="Intervention active"
            value={activeRequest ? 1 : 0}
            icon={Users}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            delay={100}
          />
          <StatCard
            title="RDV aujourd'hui"
            value={appointments.length}
            icon={Calendar}
            iconBgColor="bg-emerald-100"
            iconColor="text-emerald-600"
            delay={200}
          />
          <StatCard
            title="Consultations ce mois"
            value={interventions.filter(i => i.status === "completed").length}
            icon={CheckCircle}
            iconBgColor="bg-violet-100"
            iconColor="text-violet-600"
            delay={300}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile */}
          <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <CardHeader>
              <CardTitle className="text-base">Profil médecin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                  <Avatar className="w-20 h-20 shadow-lg">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-600 text-white text-2xl font-bold">SA</AvatarFallback>
                  </Avatar>
                  {isAvailable && (
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-400 rounded-full border-3 border-white animate-pulse-soft" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">{doctorProfile?.name || user?.name}</h3>
                  <p className="text-slate-500 mb-3">{doctorProfile?.specialty || "Médecin"}</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={isAvailable ? "bg-emerald-100 text-emerald-700 border-0" : "bg-slate-100 text-slate-600 border-0"}>
                      {isAvailable ? "✓ Disponible" : "Occupé(e)"}
                    </Badge>
                    <Badge variant="outline" className="border-slate-200 text-slate-600">{doctorProfile?.experience || "0 ans"} d'expérience</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl">
                  <p className="text-sm text-slate-500 mb-1">Note moyenne</p>
                  <p className="text-3xl font-bold text-blue-600">{doctorProfile?.rating || "0.0"}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl">
                  <p className="text-sm text-slate-500 mb-1">Patients traités</p>
                  <p className="text-3xl font-bold text-emerald-600">{new Set(interventions.filter(i => i.status === 'completed').map(i => i.patientId)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Mission or Map CTA */}
          {activeRequest ? (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="text-blue-900 flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                  Mission active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl space-y-3">
                    <div>
                      <p className="text-xs text-slate-500">Patient</p>
                      <p className="font-bold text-slate-900">{activeRequest.patientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Type d'intervention</p>
                      <p className="font-semibold text-slate-900">{activeRequest.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Adresse</p>
                      <p className="text-sm text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {activeRequest.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Heure prévue</p>
                      <p className="font-bold text-slate-900">{activeRequest.time}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl shadow-lg" 
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${activeRequest.lat},${activeRequest.lng}`, '_blank')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Y aller
                    </Button>
                    <a href="tel:0600000000">
                      <Button 
                        className="h-12 w-12 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-xl shadow-sm" 
                        variant="outline"
                        title="Appeler le patient"
                      >
                        <Phone className="w-5 h-5" />
                      </Button>
                    </a>
                  </div>
                  <div className="flex gap-2">
                    {activeRequest.status === 'accepted' && (
                      <Button 
                        className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg" 
                        onClick={() => handleArrived(activeRequest.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Arrivé sur place
                      </Button>
                    )}
                    {(activeRequest.status === 'arrived' || activeRequest.status === 'accepted') && (
                      <Button 
                        className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl shadow-lg" 
                        onClick={() => handleCompleteMission(activeRequest.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Terminer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-lg animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-5" />
              <CardHeader>
                <CardTitle className="text-base">Vue cartographique</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 text-center">
                  <Map className="w-14 h-14 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-4">Visualisez les demandes d'intervention sur la carte interactive</p>
                  <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-md" onClick={() => navigate("/doctor/map")}>
                    <Map className="w-4 h-4 mr-2" />
                    Ouvrir la carte
                  </Button>
                </div>
                <Button className="w-full rounded-xl" variant="outline" onClick={() => navigate("/doctor/requests")}>
                  Voir les demandes ({pendingRequests.length})
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Requests */}
        <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Demandes récentes</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate("/doctor/requests")} className="text-emerald-600 hover:text-emerald-700">
              Voir tout <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 stagger-children">
              {pendingRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:shadow-md hover:border-slate-200 transition-all">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{request.patientName}</h4>
                    <p className="text-sm text-slate-500">{request.type}</p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {request.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={request.urgency ? "destructive" : "secondary"} className={request.urgency ? "bg-red-100 text-red-700 border-0" : ""}>
                      {request.urgency ? "🔴 Urgent" : "Normal"}
                    </Badge>
                    <p className="text-sm text-slate-500">{request.time}</p>
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <div className="text-center py-10">
                  <CheckCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400">Aucune demande en attente</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DIRECT CHAT TRIGGER */}
      {activeRequest && (
        <DirectChat 
          interventionId={activeRequest.id} 
          currentUserRole="doctor" 
        />
      )}

      {/* BILLING MODAL */}
      <BillingModal 
        open={billingOpen} 
        onOpenChange={setBillingOpen} 
        doctorProfile={doctorProfile}
        onSuccess={fetchDoctorData}
      />
    </DashboardLayout>
  );
}
