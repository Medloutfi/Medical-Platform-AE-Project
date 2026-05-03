import { DashboardLayout } from "../../components/DashboardLayout";
import { StatCard } from "../../components/StatCard";
import { Calendar, Clock, CheckCircle, AlertCircle, ArrowRight, MapPin, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { api } from "../../services/api";
import { DirectChat } from "../../components/DirectChat";
import { Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { useAuth } from "../../contexts/AuthContext";

export default function PatientHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [myInterventions, setMyInterventions] = useState<any[]>([]);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Handle both legacy (patientId=1) and new users (patientId=user.id)
        const queryId = user.patientId || user.id;
        const interventions = await api.get<any[]>(`/interventions?patientId=${queryId}`);
        const appointments = await api.get<any[]>(`/appointments?patientId=${queryId}`);
        const docs = await api.get<any[]>(`/doctors`);
        setMyInterventions(interventions);
        setMyAppointments(appointments);
        setDoctors(docs);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, [user]);

  const handleCancelIntervention = async (id: number) => {
    try {
      await api.delete(`/interventions/${id}`);
      setMyInterventions(prev => prev.filter(i => i.id !== id));
      toast.success("Intervention annulée avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'annulation");
    }
  };

  const handleCancelAppointment = async (id: number) => {
    try {
      await api.delete(`/appointments/${id}`);
      setMyAppointments(prev => prev.filter(a => a.id !== id));
      toast.success("Rendez-vous annulé avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'annulation");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; className: string }> = {
      pending: { label: "En attente", variant: "secondary", className: "bg-amber-100 text-amber-700 border-0" },
      accepted: { label: "En cours", variant: "default", className: "bg-blue-100 text-blue-700 border-0" },
      completed: { label: "Terminé", variant: "outline", className: "bg-emerald-100 text-emerald-700 border-0" },
      confirmed: { label: "Confirmé", variant: "default", className: "bg-cyan-100 text-cyan-700 border-0" }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout role="patient" userName={user?.name || "Patient"} notificationCount={3}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Tableau de bord</h1>
          <p className="text-slate-500">Gérez vos interventions et rendez-vous médicaux</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          <StatCard
            title="Interventions actives"
            value={myInterventions.filter(i => i.status === 'accepted' || i.status === 'pending').length}
            icon={Clock}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            delay={0}
          />
          <StatCard
            title="Rendez-vous à venir"
            value={myAppointments.filter(a => a.status === 'confirmed').length}
            icon={Calendar}
            iconBgColor="bg-emerald-100"
            iconColor="text-emerald-600"
            delay={100}
          />
          <StatCard
            title="Interventions terminées"
            value={myInterventions.filter(i => i.status === 'completed').length}
            icon={CheckCircle}
            iconBgColor="bg-violet-100"
            iconColor="text-violet-600"
            delay={200}
          />
          <StatCard
            title="Demandes urgentes"
            value={myInterventions.filter(i => i.urgency).length}
            icon={AlertCircle}
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
            delay={300}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Interventions récentes</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/patient/history")} className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50">
                Voir tout <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myInterventions.slice(0, 3).map((intervention) => {
                  const assignedDoctor = intervention.doctorId ? doctors.find(d => d.id === intervention.doctorId) : null;
                  
                  return (
                  <div key={intervention.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md hover:border-slate-200 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900">{intervention.type}</h4>
                        <p className="text-sm text-slate-500">{intervention.date} à {intervention.time}</p>
                      </div>
                      {getStatusBadge(intervention.status)}
                    </div>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-1">{intervention.description}</p>
                    
                    {/* EN ROUTE UI */}
                    {(intervention.status === 'accepted' || intervention.status === 'arrived') && assignedDoctor && (
                      <div className="my-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div 
                            className="flex items-center gap-3 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedDoctor(assignedDoctor)}
                          >
                            <img src={assignedDoctor.image} alt={assignedDoctor.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" />
                            <div>
                              <p className="font-bold text-slate-900 text-sm hover:underline">{assignedDoctor.name}</p>
                              <p className="text-xs text-blue-600 font-medium mt-0.5">
                                {intervention.status === 'arrived' ? '📍 Arrivé sur place' : '🚗 En route (ETA: 12 min)'}
                              </p>
                            </div>
                          </div>
                          <a href={`tel:${assignedDoctor.phone || '0600000000'}`}>
                            <Button size="icon" variant="outline" className="rounded-full bg-white text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                              <Phone className="w-4 h-4" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {intervention.address}
                      </p>
                      {intervention.status === 'pending' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCancelIntervention(intervention.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                )})}
                {myInterventions.length === 0 && (
                  <div className="text-center py-10">
                    <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400">Aucune intervention récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Prochains rendez-vous</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/patient/appointment")} className="text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50">
                Nouveau <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md hover:border-slate-200 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900">{appointment.patientName}</h4>
                        <p className="text-sm text-slate-500">{appointment.date} à {appointment.time}</p>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-slate-600">{appointment.reason}</p>
                      {appointment.status === 'confirmed' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleCancelAppointment(appointment.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {myAppointments.length === 0 && (
                  <div className="text-center py-10">
                    <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400">Aucun rendez-vous prévu</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div 
            className="group cursor-pointer rounded-2xl overflow-hidden relative shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01]"
            onClick={() => navigate("/patient/intervention")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-500 to-blue-600 animate-gradient" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
            <div className="relative p-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Demander une intervention</h3>
              <p className="text-blue-100 mb-5">Service à domicile avec localisation GPS — disponible 24/7</p>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors">
                Nouvelle demande <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div 
            className="group cursor-pointer rounded-2xl overflow-hidden relative shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01]"
            onClick={() => navigate("/patient/appointment")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-teal-600 animate-gradient" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
            <div className="relative p-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Réserver un rendez-vous</h3>
              <p className="text-emerald-100 mb-5">Consultez nos médecins en clinique — réservation en 3 étapes</p>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors">
                Prendre RDV <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* DIRECT CHAT TRIGGER */}
      {myInterventions.filter(i => i.status === 'accepted' || i.status === 'arrived').length > 0 && (
        <DirectChat 
          interventionId={myInterventions.find(i => i.status === 'accepted' || i.status === 'arrived').id} 
          currentUserRole="patient" 
        />
      )}

      {/* Doctor Public Profile Modal */}
      <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profil Médecin</DialogTitle>
            <DialogDescription>Informations publiques du médecin assigné</DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <div className="flex flex-col items-center p-4 space-y-4">
              <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-lg">
                <AvatarImage src={selectedDoctor.image} />
                <AvatarFallback className="text-2xl">{selectedDoctor.name?.[0] || 'M'}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900">{selectedDoctor.name}</h3>
                <p className="text-sm text-cyan-600 font-semibold">{selectedDoctor.specialty || "Médecin généraliste"}</p>
              </div>
              <div className="w-full grid grid-cols-2 gap-3 mt-2">
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-500 mb-1">Expérience</p>
                  <p className="font-semibold text-slate-900">{selectedDoctor.experience || "Non spécifié"}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-500 mb-1">Évaluation</p>
                  <p className="font-semibold text-slate-900">⭐ {selectedDoctor.rating || "N/A"}</p>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={() => setSelectedDoctor(null)}>
                Fermer
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
