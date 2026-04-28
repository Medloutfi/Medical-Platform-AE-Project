import { DashboardLayout } from "../../components/DashboardLayout";
import { StatCard } from "../../components/StatCard";
import { Activity, Users, UserCheck, Clock, ArrowRight, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invs, docs, pats, cData] = await Promise.all([
          api.get<any[]>('/interventions'),
          api.get<any[]>('/doctors'),
          api.get<any[]>('/patients'),
          api.get<any[]>('/chartData')
        ]);
        setInterventions(invs);
        setDoctors(docs);
        setPatients(pats);
        setChartData(cData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  const activeInterventions = interventions.filter(i => i.status === "accepted").length;
  const pendingRequests = interventions.filter(i => i.status === "pending").length;
  const availableDoctors = doctors.filter(d => d.available).length;
  
  const recentActivity = [
    { id: 1, type: "Nouvelle intervention", patient: "Ahmed Tazi", time: "Il y a 5 min", status: "pending" },
    { id: 2, type: "RDV confirmé", patient: "Leila Benjelloun", time: "Il y a 12 min", status: "confirmed" },
    { id: 3, type: "Intervention terminée", patient: "Omar Chraibi", time: "Il y a 23 min", status: "completed" },
    { id: 4, type: "Nouveau médecin", patient: "Dr. Karim El Fassi", time: "Il y a 1h", status: "info" }
  ];

  const getActivityColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-500",
      confirmed: "bg-blue-500",
      completed: "bg-emerald-500",
      info: "bg-violet-500"
    };
    return colors[status] || colors.info;
  };

  return (
    <DashboardLayout role="admin" userName="Admin" notificationCount={5}>
      <div className="space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Dashboard Administrateur</h1>
          <p className="text-slate-500">Vue d'ensemble en temps réel de la plateforme</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
          <StatCard
            title="Interventions actives"
            value={activeInterventions}
            icon={Activity}
            trend="+12% vs hier"
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            delay={0}
          />
          <StatCard
            title="Médecins disponibles"
            value={availableDoctors}
            icon={UserCheck}
            trend={`${availableDoctors}/${doctors.length} en ligne`}
            iconBgColor="bg-emerald-100"
            iconColor="text-emerald-600"
            delay={100}
          />
          <StatCard
            title="Demandes en attente"
            value={pendingRequests}
            icon={Clock}
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
            delay={200}
          />
          <StatCard
            title="Patients actifs"
            value={patients.length}
            icon={Users}
            trend="+8% ce mois"
            iconBgColor="bg-violet-100"
            iconColor="text-violet-600"
            delay={300}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-base">Activité de la semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorInterventions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="interventions" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorInterventions)" />
                  <Area type="monotone" dataKey="appointments" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorAppointments)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-500">Interventions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm text-slate-500">Rendez-vous</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Activité récente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className={`w-2.5 h-2.5 rounded-full mt-2 ${getActivityColor(activity.status)} group-hover:scale-125 transition-transform`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm">{activity.type}</p>
                      <p className="text-sm text-slate-500 truncate">{activity.patient}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Médecins en ligne</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/doctors")} className="text-emerald-600">
                Voir tout
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {doctors.filter(d => d.available).map((doctor) => (
                  <div key={doctor.id} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {doctor.name.split(' ').pop()?.[0]}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{doctor.name}</p>
                        <p className="text-xs text-slate-500">{doctor.specialty}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">En ligne</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Interventions en cours</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/tracking")} className="text-blue-600">
                Carte <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {interventions.filter(i => i.status === "accepted").map((intervention) => {
                  const doctor = doctors.find(d => d.id === intervention.doctorId);
                  return (
                    <div key={intervention.id} className="p-4 border-2 border-blue-200 bg-blue-50/50 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-slate-900">{intervention.patientName}</p>
                          <p className="text-sm text-slate-500">{intervention.type}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700 border-0">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-1.5 animate-pulse" />
                          En cours
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                        <MapPin className="w-3 h-3" /> {intervention.address}
                      </p>
                      {doctor && (
                        <p className="text-xs text-blue-700 font-medium">🩺 {doctor.name}</p>
                      )}
                    </div>
                  );
                })}
                {interventions.filter(i => i.status === "accepted").length === 0 && (
                  <div className="text-center py-10">
                    <Activity className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400">Aucune intervention en cours</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
