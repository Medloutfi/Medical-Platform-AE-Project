import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { MapPin, Clock, AlertCircle, Check, X, Navigation, Filter, Layers } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useAuth } from "../../contexts/AuthContext";

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const normalIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: linear-gradient(135deg, #3b82f6, #2563eb); width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 12px rgba(59,130,246,0.4);"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const urgentIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: linear-gradient(135deg, #ef4444, #dc2626); width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 16px rgba(239,68,68,0.5); animation: pulse 2s infinite;"><style>@keyframes pulse{0%,100%{box-shadow:0 4px 16px rgba(239,68,68,0.5)}50%{box-shadow:0 4px 24px rgba(239,68,68,0.8)}}</style></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
});

const doctorIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background: linear-gradient(135deg, #10b981, #059669); width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(16,185,129,0.4); display: flex; align-items: center; justify-content: center;"><div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

export default function DoctorMap() {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [filterUrgent, setFilterUrgent] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<any | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invs, docs] = await Promise.all([
          api.get<any[]>('/interventions'),
          api.get<any[]>('/doctors')
        ]);
        setInterventions(invs);
        setDoctors(docs);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    fetchData();
  }, []);

  const pendingInterventions = interventions.filter(i => 
    i.status === "pending" && i.lat && i.lng
  );

  const filteredInterventions = filterUrgent 
    ? pendingInterventions.filter(i => i.urgency)
    : pendingInterventions;

  const handleAccept = async (id: number) => {
    if (!user) return;
    const queryId = user.doctorId || user.id;
    try {
      await api.patch(`/interventions/${id}`, { status: "accepted", doctorId: queryId });
      setInterventions(interventions.map(i => i.id === id ? { ...i, status: "accepted", doctorId: queryId } : i));
      setSelectedIntervention(null);
      toast.success("Mission acceptée! Navigation disponible.");
    } catch (e) {
      toast.error("Erreur de connexion au serveur");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.patch(`/interventions/${id}`, { status: "rejected" });
      setInterventions(interventions.map(i => i.id === id ? { ...i, status: "rejected" } : i));
      setSelectedIntervention(null);
      toast.info("Demande refusée.");
    } catch (e) {
      toast.error("Erreur de connexion au serveur");
    }
  };

  // Center map on Casablanca
  const mapCenter: [number, number] = [33.5731, -7.5898];

  return (
    <DashboardLayout role="doctor" userName={user?.name || "Médecin"} notificationCount={2}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Carte des interventions</h1>
            <p className="text-slate-500">Visualisez et acceptez les demandes d'intervention en temps réel</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant={filterUrgent ? "default" : "outline"}
              onClick={() => setFilterUrgent(!filterUrgent)}
              className={`rounded-xl ${filterUrgent ? 'bg-red-500 hover:bg-red-600' : ''}`}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              {filterUrgent ? "Urgentes uniquement" : "Toutes les demandes"}
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Card className="border-0 shadow-sm bg-blue-50/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{pendingInterventions.length}</p>
                <p className="text-xs text-blue-600">En attente</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-red-50/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{pendingInterventions.filter(i => i.urgency).length}</p>
                <p className="text-xs text-red-600">Urgentes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-emerald-50/80">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Navigation className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{doctors.filter(d => d.available).length}</p>
                <p className="text-xs text-emerald-600">Médecins dispo.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {/* Map */}
          <Card className="lg:col-span-2 border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '600px', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Intervention markers */}
                {filteredInterventions.map((intervention) => (
                  <Marker 
                    key={intervention.id} 
                    position={[intervention.lat, intervention.lng]}
                    icon={intervention.urgency ? urgentIcon : normalIcon}
                    eventHandlers={{
                      click: () => setSelectedIntervention(intervention)
                    }}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-bold text-slate-900">{intervention.patientName}</p>
                            <p className="text-xs text-slate-500">{intervention.type}</p>
                          </div>
                          {intervention.urgency && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Urgent</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{intervention.description}</p>
                        <div className="text-xs text-slate-500 mb-3">
                          <p>📍 {intervention.address}</p>
                          <p>🕐 {intervention.date} à {intervention.time}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAccept(intervention.id)}
                            className="flex-1 bg-emerald-500 text-white text-xs py-1.5 px-3 rounded-lg hover:bg-emerald-600 transition-colors font-medium"
                          >
                            ✓ Accepter
                          </button>
                          <button 
                            onClick={() => handleReject(intervention.id)}
                            className="flex-1 bg-slate-100 text-slate-700 text-xs py-1.5 px-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
                          >
                            ✕ Refuser
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Doctor markers */}
                {doctors.filter(d => d.available && d.lat).map((doctor) => (
                  <Marker 
                    key={`doc-${doctor.id}`} 
                    position={[doctor.lat, doctor.lng]}
                    icon={doctorIcon}
                  >
                    <Popup>
                      <div>
                        <p className="font-bold text-emerald-700">{doctor.name}</p>
                        <p className="text-xs text-slate-500">{doctor.specialty}</p>
                        <p className="text-xs text-emerald-600 mt-1">🟢 Disponible</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </CardContent>
          </Card>

          {/* Sidebar: Intervention List */}
          <div className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  Demandes ({filteredInterventions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[520px] overflow-y-auto">
                {filteredInterventions.map((intervention) => (
                  <div 
                    key={intervention.id} 
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedIntervention?.id === intervention.id
                        ? 'border-cyan-400 bg-cyan-50/50 shadow-md'
                        : intervention.urgency 
                          ? 'border-red-200 bg-red-50/30 hover:border-red-300'
                          : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedIntervention(intervention)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{intervention.patientName}</p>
                        <p className="text-xs text-slate-500">{intervention.type}</p>
                      </div>
                      <Badge variant={intervention.urgency ? "destructive" : "secondary"} className="text-xs">
                        {intervention.urgency ? "Urgent" : "Normal"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" /> {intervention.address}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {intervention.date} à {intervention.time}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); handleAccept(intervention.id); }}
                        className="flex-1 h-8 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-xs"
                      >
                        <Check className="w-3 h-3 mr-1" /> Accepter
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); handleReject(intervention.id); }}
                        className="flex-1 h-8 rounded-lg text-xs border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-3 h-3 mr-1" /> Refuser
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredInterventions.length === 0 && (
                  <div className="text-center py-8">
                    <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">Aucune demande en attente</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Legend */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-slate-600 mb-3">Légende</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-white shadow" />
                    <span className="text-slate-600">Demande normale</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 border-2 border-white shadow animate-pulse" />
                    <span className="text-slate-600">Demande urgente</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 border-2 border-white shadow" />
                    <span className="text-slate-600">Médecin disponible</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
