import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { MapPin, Navigation, Clock, Truck, UserCheck, Activity, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom markers
const doctorMarker = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: linear-gradient(135deg, #10b981, #059669); width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 14px rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center;"><div style="color: white; font-size: 14px; font-weight: bold;">🩺</div></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

const ambulanceMarker = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 14px rgba(59,130,246,0.4); display: flex; align-items: center; justify-content: center;"><div style="color: white; font-size: 14px;">🚑</div></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

const ambulanceBusyMarker = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: linear-gradient(135deg, #f59e0b, #d97706); width: 34px; height: 34px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 14px rgba(245,158,11,0.4); display: flex; align-items: center; justify-content: center;"><div style="color: white; font-size: 14px;">🚑</div></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

const interventionMarker = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: linear-gradient(135deg, #ef4444, #dc2626); width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 12px rgba(239,68,68,0.4);"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

export default function AdminTracking() {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docs, drvs, invs] = await Promise.all([
          api.get<any[]>('/doctors'),
          api.get<any[]>('/drivers'),
          api.get<any[]>('/interventions')
        ]);
        setDoctors(docs);
        setDrivers(drvs);
        setInterventions(invs);
      } catch (error) {
        console.error("Failed to load tracking data:", error);
      }
    };
    fetchData();
  }, []);

  const handleAssignDoctor = async (interventionId: number, doctorId: string) => {
    if (!doctorId) return;
    try {
      await api.patch(`/interventions/${interventionId}`, { 
        status: "accepted", 
        doctorId: parseInt(doctorId) 
      });
      setInterventions(prev => prev.map(i => i.id === interventionId ? { ...i, status: "accepted", doctorId: parseInt(doctorId) } : i));
      toast.success("Intervention assignée au médecin avec succès !");
    } catch (error) {
      toast.error("Erreur lors de l'assignation");
    }
  };

  const activeInterventions = interventions.filter(i => i.status === "accepted");
  const pendingInterventions = interventions.filter(i => i.status === "pending");

  return (
    <DashboardLayout role="admin" userName="Admin" notificationCount={5}>
      <div className="space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Suivi en temps réel</h1>
          <p className="text-slate-500">Localisez les médecins, ambulances et interventions sur la carte</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Card className="border-0 shadow-sm bg-emerald-50/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-emerald-700">{doctors.filter(d => d.available).length}</p>
                <p className="text-xs text-emerald-600">Médecins en ligne</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-blue-50/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-blue-700">{drivers.filter(d => d.status === 'available').length}</p>
                <p className="text-xs text-blue-600">Ambulances libres</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-amber-50/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-amber-700">{activeInterventions.length}</p>
                <p className="text-xs text-amber-600">Missions actives</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-red-50/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-red-700">{pendingInterventions.length}</p>
                <p className="text-xs text-red-600">En attente</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {/* Map */}
          <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="w-5 h-5 text-blue-600" />
                Carte de suivi interactive
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MapContainer
                center={[33.5731, -7.5898]}
                zoom={13}
                style={{ height: '550px', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Doctor markers */}
                {doctors.filter(d => d.available && d.lat).map((doctor) => (
                  <Marker key={`doc-${doctor.id}`} position={[doctor.lat, doctor.lng]} icon={doctorMarker}>
                    <Popup>
                      <div className="min-w-[160px]">
                        <p className="font-bold text-emerald-700">{doctor.name}</p>
                        <p className="text-xs text-slate-500">{doctor.specialty}</p>
                        <p className="text-xs text-emerald-600 mt-1 font-medium">🟢 Disponible</p>
                        <p className="text-xs text-slate-500 mt-1">📞 {doctor.phone}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Ambulance markers */}
                {drivers.map((driver) => (
                  <Marker 
                    key={`drv-${driver.id}`} 
                    position={[driver.lat, driver.lng]} 
                    icon={driver.status === 'available' ? ambulanceMarker : ambulanceBusyMarker}
                  >
                    <Popup>
                      <div className="min-w-[160px]">
                        <p className="font-bold text-blue-700">{driver.vehicle}</p>
                        <p className="text-xs text-slate-500">{driver.name}</p>
                        <p className={`text-xs mt-1 font-medium ${driver.status === 'available' ? 'text-blue-600' : 'text-amber-600'}`}>
                          {driver.status === 'available' ? '🔵 Disponible' : '🟡 En mission'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">📞 {driver.phone}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Intervention markers */}
                {[...activeInterventions, ...pendingInterventions].filter(i => i.lat).map((intervention) => (
                  <Marker 
                    key={`int-${intervention.id}`} 
                    position={[intervention.lat, intervention.lng]} 
                    icon={interventionMarker}
                  >
                    <Popup>
                      <div className="min-w-[180px]">
                        <p className="font-bold text-slate-900">{intervention.patientName}</p>
                        <p className="text-xs text-slate-500">{intervention.type}</p>
                        <Badge className="text-xs mt-1" variant={intervention.status === 'accepted' ? 'default' : 'secondary'}>
                          {intervention.status === 'accepted' ? 'En cours' : 'En attente'}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-2">📍 {intervention.address}</p>
                        <p className="text-xs text-slate-500">🕐 {intervention.date} à {intervention.time}</p>
                        {intervention.urgency && (
                          <p className="text-xs text-red-600 font-medium mt-1">⚠️ Urgent</p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </CardContent>
            {/* Legend */}
            <div className="px-4 py-3 border-t border-slate-100">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 border-2 border-white shadow" />
                  <span className="text-slate-600">Médecin</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white shadow" />
                  <span className="text-slate-600">Ambulance libre</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 border-2 border-white shadow" />
                  <span className="text-slate-600">Ambulance en mission</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-white shadow" />
                  <span className="text-slate-600">Intervention</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Missions actives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[280px] overflow-y-auto">
                {activeInterventions.map((intervention) => {
                  const doctor = doctors.find(d => d.id === intervention.doctorId);
                  return (
                    <div key={intervention.id} className="p-3 border-2 border-blue-200 bg-blue-50/50 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-slate-900">{intervention.patientName}</p>
                          <p className="text-xs text-slate-500">{intervention.type}</p>
                        </div>
                        <Badge variant="default" className="text-xs bg-blue-500">Actif</Badge>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-slate-600 mb-2">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>{intervention.address}</span>
                      </div>
                      {doctor && (
                        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-white px-2.5 py-1.5 rounded-lg">
                          <Navigation className="w-3 h-3" />
                          <span className="font-medium">{doctor.name}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {activeInterventions.length === 0 && (
                  <p className="text-center text-slate-400 py-6 text-sm">Aucune mission active</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg border-amber-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                  <Clock className="w-4 h-4" /> Demandes en attente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
                {pendingInterventions.map((intervention) => (
                  <div key={intervention.id} className="p-3 border border-amber-100 bg-amber-50/50 rounded-xl">
                    <div className="mb-2">
                      <p className="font-semibold text-sm text-slate-900">{intervention.patientName}</p>
                      <p className="text-xs text-slate-500">{intervention.type} - {intervention.address}</p>
                    </div>
                    <div className="flex gap-2">
                      <select 
                        className="flex-1 text-xs rounded-lg border-slate-200 bg-white"
                        id={`select-${intervention.id}`}
                      >
                        <option value="">Sélectionner un médecin</option>
                        {doctors.filter(d => d.available).map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.name}</option>
                        ))}
                      </select>
                      <Button 
                        size="sm" 
                        className="bg-amber-500 hover:bg-amber-600 h-8 px-2"
                        onClick={() => {
                          const selectEl = document.getElementById(`select-${intervention.id}`) as HTMLSelectElement;
                          handleAssignDoctor(intervention.id, selectEl.value);
                        }}
                      >
                        Assigner
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingInterventions.length === 0 && (
                  <p className="text-center text-slate-400 py-4 text-sm">Aucune demande en attente</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ambulances</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {drivers.map((driver) => (
                  <div key={driver.id} className="p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{driver.vehicle}</p>
                        <p className="text-xs text-slate-500">{driver.name}</p>
                      </div>
                      <Badge variant={driver.status === 'available' ? 'default' : 'secondary'} className={`text-xs ${driver.status === 'available' ? 'bg-blue-500' : ''}`}>
                        {driver.status === 'available' ? 'Disponible' : 'En mission'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">📞 {driver.phone}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Response Times */}
        <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="text-base">Temps de réponse moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Acceptation", value: "8 min", color: "from-blue-500 to-cyan-500", bg: "bg-blue-50" },
                { label: "Arrivée sur place", value: "15 min", color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50" },
                { label: "Durée moyenne", value: "35 min", color: "from-violet-500 to-purple-500", bg: "bg-violet-50" },
                { label: "Taux de réussite", value: "98%", color: "from-amber-500 to-orange-500", bg: "bg-amber-50" },
              ].map((stat) => (
                <div key={stat.label} className={`p-5 ${stat.bg} rounded-2xl text-center`}>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</p>
                  <p className="text-sm text-slate-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
