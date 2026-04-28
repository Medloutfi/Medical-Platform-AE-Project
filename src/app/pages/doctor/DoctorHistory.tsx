import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { TrendingUp, Users, Award, Clock, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../services/api";

export default function DoctorHistory() {
  const [completedInterventions, setCompletedInterventions] = useState<any[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [invs, docs] = await Promise.all([
          api.get<any[]>('/interventions'),
          api.get<any[]>('/doctors')
        ]);
        setCompletedInterventions(invs.filter(i => i.status === "completed"));
        setDoctorProfile(docs[0]);
      } catch (error) {
        console.error("Failed to load history:", error);
      }
    };
    fetchHistory();
  }, []);

  // Compute performanceData from completed interventions based on date
  const monthlyStats = completedInterventions.reduce((acc: any, inv) => {
    const month = new Date(inv.date).toLocaleString('fr-FR', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, consultations: 0, rating: doctorProfile?.rating || 0 };
    }
    acc[month].consultations += 1;
    return acc;
  }, {});
  
  const performanceData = Object.values(monthlyStats);

  const totalInterventions = completedInterventions.length;
  const patientsTraites = new Set(completedInterventions.map(i => i.patientId)).size;
  const noteMoyenne = doctorProfile?.rating || "0";
  const anneesExp = doctorProfile?.experience ? doctorProfile.experience.split(' ')[0] : "0";

  return (
    <DashboardLayout role="doctor" userName="Dr. Sarah Alami" notificationCount={2}>
      <div className="space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Historique & Performance</h1>
          <p className="text-slate-500">Consultez vos statistiques et interventions passées</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 stagger-children">
          {[
            { icon: TrendingUp, label: "Total interventions", value: totalInterventions, gradient: "from-blue-500 to-cyan-500" },
            { icon: Users, label: "Patients traités", value: patientsTraites, gradient: "from-emerald-500 to-teal-500" },
            { icon: Award, label: "Note moyenne", value: noteMoyenne, gradient: "from-amber-500 to-orange-500" },
            { icon: Clock, label: "Années d'exp.", value: anneesExp, gradient: "from-violet-500 to-purple-500" },
          ].map((stat, idx) => (
            <Card key={idx} className={`border-0 shadow-xl bg-gradient-to-br ${stat.gradient} text-white overflow-hidden relative`}>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.06%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
              <CardContent className="p-6 relative">
                <stat.icon className="w-8 h-8 mb-3 opacity-80" />
                <p className="text-3xl font-bold mb-1">{stat.value}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-base">Activité mensuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorConsultations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="consultations" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorConsultations)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <CardHeader>
              <CardTitle className="text-base">Évolution des notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis domain={[4.5, 5]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-base">Interventions terminées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 stagger-children">
              {completedInterventions.map((intervention) => (
                <div key={intervention.id} className="p-4 border border-slate-100 rounded-xl hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{intervention.patientName}</h4>
                      <p className="text-sm text-slate-500">{intervention.type}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-0">✓ Terminé</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {intervention.date} à {intervention.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {intervention.address}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{intervention.description}</p>
                </div>
              ))}
              {completedInterventions.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400">Aucune intervention terminée</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
