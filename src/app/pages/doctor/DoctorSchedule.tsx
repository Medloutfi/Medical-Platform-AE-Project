import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Calendar } from "../../components/ui/calendar";
import { Badge } from "../../components/ui/badge";
import { Clock, MapPin, User, Calendar as CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

export default function DoctorSchedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await api.get<any[]>('/appointments');
        if (user?.doctorId) {
          setAppointments(data.filter(app => app.doctorId === user.doctorId));
        } else {
          setAppointments(data);
        }
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
      }
    };
    fetchAppointments();
  }, [user]);

  const getStatusBadge = (status: string) => {
    return status === "confirmed" 
      ? <Badge className="bg-emerald-100 text-emerald-700 border-0">Confirmé</Badge>
      : <Badge className="bg-amber-100 text-amber-700 border-0">En attente</Badge>;
  };

  return (
    <DashboardLayout role="doctor" userName="Dr. Sarah Alami" notificationCount={2}>
      <div className="space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Mon Agenda</h1>
          <p className="text-slate-500">Gérez votre emploi du temps et vos rendez-vous</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="text-base">Calendrier</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-xl border"
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-500">Rendez-vous confirmés</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-slate-500">En attente</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-slate-500">Terminé</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <CardHeader>
              <CardTitle className="text-base">Rendez-vous du jour</CardTitle>
              <p className="text-sm text-slate-500">
                {date ? date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 stagger-children">
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-14 h-14 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">Aucun rendez-vous prévu</p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <div key={appointment.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold px-3 py-2 rounded-xl text-sm shadow-md">
                            {appointment.time}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{appointment.patientName || appointment.patient}</h4>
                            <p className="text-sm text-slate-500">{appointment.reason || appointment.type}</p>
                          </div>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-slate-500 ml-[68px]">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{appointment.location || "Clinique Centrale"}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-700">{appointments.length}</p>
              <p className="text-sm text-slate-600 mt-1">RDV aujourd'hui</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-teal-50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-700">23</p>
              <p className="text-sm text-slate-600 mt-1">Cette semaine</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-violet-50 to-purple-50">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-violet-600" />
              </div>
              <p className="text-3xl font-bold text-violet-700">2</p>
              <p className="text-sm text-slate-600 mt-1">Interventions à domicile</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
