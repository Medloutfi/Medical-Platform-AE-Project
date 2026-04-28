import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from "recharts";
import { TrendingUp, Clock, Users, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../services/api";

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function AdminAnalytics() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cData, docs, invs] = await Promise.all([
          api.get<any[]>('/chartData'),
          api.get<any[]>('/doctors'),
          api.get<any[]>('/interventions')
        ]);
        setChartData(cData);
        setDoctors(docs);
        setInterventions(invs);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      }
    };
    fetchData();
  }, []);

  const typeDistribution = [
    { name: "Consultation", value: 35 },
    { name: "Prise de sang", value: 25 },
    { name: "Injection", value: 20 },
    { name: "Pansement", value: 12 },
    { name: "Autre", value: 8 },
  ];

  const monthlyTrend = [
    { month: "Jan", total: 120 },
    { month: "Fév", total: 135 },
    { month: "Mar", total: 158 },
    { month: "Avr", total: 180 },
  ];

  return (
    <DashboardLayout role="admin" userName="Admin" notificationCount={5}>
      <div className="space-y-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Analyses & Rapports</h1>
          <p className="text-slate-500">Statistiques détaillées de la plateforme</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 stagger-children">
          {[
            { icon: TrendingUp, label: "Taux de croissance", value: "+23%", gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50" },
            { icon: Clock, label: "Temps moyen réponse", value: "8 min", gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50" },
            { icon: Users, label: "Satisfaction", value: "96%", gradient: "from-violet-500 to-purple-500", bg: "bg-violet-50" },
            { icon: Activity, label: "Interventions/jour", value: "18", gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50" },
          ].map((stat, idx) => (
            <Card key={idx} className={`border-0 shadow-lg overflow-hidden`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 mb-2">{stat.label}</p>
                    <p className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-3 rounded-2xl`}>
                    <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.gradient} bg-clip-text`} style={{ color: COLORS[idx] }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity Chart */}
          <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="text-base">Activité hebdomadaire</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="interventions" name="Interventions" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="appointments" name="Rendez-vous" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Type Distribution */}
          <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <CardHeader>
              <CardTitle className="text-base">Répartition par type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {typeDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {typeDistribution.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[index] }} />
                    <span className="text-slate-600">{entry.name}</span>
                    <span className="font-bold text-slate-900">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="text-base">Tendance mensuelle</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyTrend}>
                  <defs>
                    <linearGradient id="gradientArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} fill="url(#gradientArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance des médecins */}
          <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <CardHeader>
              <CardTitle className="text-base">Performance des médecins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctors.map((doctor, idx) => (
                  <div key={doctor.id} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="font-semibold text-slate-900 text-sm truncate">{doctor.name}</p>
                        <span className="text-sm font-bold text-blue-600">{doctor.rating}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-cyan-500 transition-all duration-1000"
                          style={{ width: `${(doctor.rating / 5) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{doctor.specialty} — {doctor.experience}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
