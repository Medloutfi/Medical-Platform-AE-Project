import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Clock, Calendar, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function PatientHistory() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inv, appts, docs, clins] = await Promise.all([
          api.get<any[]>('/interventions'),
          api.get<any[]>('/appointments'),
          api.get<any[]>('/doctors'),
          api.get<any[]>('/clinics')
        ]);
        setInterventions(inv);
        setAppointments(appts);
        setDoctors(docs);
        setClinics(clins);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any; className: string; icon: any }> = {
      pending: { label: "En attente", variant: "secondary", className: "bg-amber-100 text-amber-700 border-0", icon: Clock },
      accepted: { label: "En cours", variant: "default", className: "bg-blue-100 text-blue-700 border-0", icon: AlertCircle },
      completed: { label: "Terminé", variant: "outline", className: "bg-emerald-100 text-emerald-700 border-0", icon: CheckCircle },
      confirmed: { label: "Confirmé", variant: "default", className: "bg-cyan-100 text-cyan-700 border-0", icon: Calendar }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  return (
    <DashboardLayout role="patient" userName="Ahmed Tazi" notificationCount={3}>
      <div className="space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Historique</h1>
          <p className="text-slate-500">Consultez l'historique de vos interventions et rendez-vous</p>
        </div>

        <Tabs defaultValue="interventions" className="w-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-slate-100 p-1 rounded-xl h-12">
            <TabsTrigger value="interventions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">
              Interventions
            </TabsTrigger>
            <TabsTrigger value="appointments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">
              Rendez-vous
            </TabsTrigger>
          </TabsList>

          <TabsContent value="interventions" className="mt-6">
            <div className="space-y-4 stagger-children">
              {interventions.map((intervention) => (
                <Card key={intervention.id} className="border-0 shadow-md hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{intervention.type}</h3>
                        <p className="text-sm text-slate-500">{intervention.patientName}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {intervention.urgency && (
                          <Badge className="bg-red-100 text-red-700 border-0">⚡ Urgente</Badge>
                        )}
                        {getStatusBadge(intervention.status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{intervention.date} à {intervention.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="truncate">{intervention.address}</span>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-4">{intervention.description}</p>

                    {intervention.doctorId && (
                      <div className="bg-blue-50 p-3 rounded-xl flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs">🩺</span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Médecin assigné</p>
                          <p className="text-sm font-semibold text-slate-900">{doctors.find(d => d.id === intervention.doctorId)?.name}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {interventions.length === 0 && (
                <div className="text-center py-16">
                  <Clock className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400">Aucune intervention dans l'historique</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="mt-6">
            <div className="space-y-4 stagger-children">
              {appointments.map((appointment) => {
                const doctor = doctors.find(d => d.id === appointment.doctorId);
                const clinic = clinics.find(c => c.id === appointment.clinicId);
                
                return (
                  <Card key={appointment.id} className="border-0 shadow-md hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{doctor?.name}</h3>
                          <p className="text-sm text-slate-500">{doctor?.specialty}</p>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{appointment.date} à {appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="truncate">{clinic?.name}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-4">
                        <strong className="text-slate-700">Motif:</strong> {appointment.reason}
                      </p>

                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-xs text-slate-400">{clinic?.address}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {appointments.length === 0 && (
                <div className="text-center py-16">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400">Aucun rendez-vous dans l'historique</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
