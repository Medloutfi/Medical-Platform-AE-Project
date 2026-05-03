import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { api } from "../../services/api";
import { BillingModal } from "../../components/BillingModal";
import { MapPin, Clock, AlertCircle, Check, X, Navigation } from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";

// Fix leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function DoctorRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [billingOpen, setBillingOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [invs, docs] = await Promise.all([
        api.get<any[]>('/interventions'),
        api.get<any[]>('/doctors')
      ]);
      setRequests(invs.filter(i => i.status === "pending"));
      // Hardcoded doctorId 1 for now
      setDoctorProfile(docs.find(d => d.id === 1) || docs[0]);
    } catch (error) {
      console.error("Failed to load interventions:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (id: number) => {
    if (!doctorProfile) return;

    if (doctorProfile.subscriptionPlan !== 'premium' && (doctorProfile.credits || 0) <= 0) {
      setBillingOpen(true);
      return;
    }

    try {
      // Patch intervention
      await api.patch(`/interventions/${id}`, { status: "accepted", doctorId: doctorProfile.id });
      
      // Decrement credit if not premium
      if (doctorProfile.subscriptionPlan !== 'premium') {
        const newCredits = (doctorProfile.credits || 0) - 1;
        await api.patch(`/doctors/${doctorProfile.id}`, { credits: newCredits });
        setDoctorProfile({ ...doctorProfile, credits: newCredits });
      }

      setRequests(requests.filter(r => r.id !== id));
      toast.success("Demande acceptée! Mission ajoutée à votre agenda.");
    } catch (e) {
      toast.error("Erreur de connexion au serveur");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.patch(`/interventions/${id}`, { status: "rejected" });
      setRequests(requests.filter(r => r.id !== id));
      toast.info("Demande refusée.");
    } catch (e) {
      toast.error("Erreur de connexion au serveur");
    }
  };

  return (
    <DashboardLayout role="doctor" userName="Dr. Sarah Alami" notificationCount={2}>
      <div className="space-y-6">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Demandes d'intervention</h1>
          <p className="text-slate-500">Acceptez ou refusez les demandes d'intervention à domicile</p>
        </div>

        <div className="space-y-5 stagger-children">
          {requests.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                  <Check className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Tout est à jour!</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Toutes les demandes ont été traitées. Vous serez notifié des nouvelles demandes.</p>
              </CardContent>
            </Card>
          ) : (
            requests.map((request) => (
              <Card key={request.id} className={`border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden ${request.urgency ? 'ring-2 ring-red-200' : ''}`}>
                <CardHeader className={`pb-3 ${request.urgency ? 'bg-gradient-to-r from-red-50 to-amber-50' : 'bg-gradient-to-r from-slate-50 to-blue-50'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-slate-900">{request.patientName}</CardTitle>
                      <p className="text-sm text-slate-500 mt-1">{request.type}</p>
                    </div>
                    <Badge 
                      variant={request.urgency ? "destructive" : "secondary"} 
                      className={`text-sm px-3 py-1 ${request.urgency ? 'bg-red-100 text-red-700 border-0 animate-pulse-soft' : ''}`}
                    >
                      {request.urgency ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Urgent
                        </>
                      ) : (
                        "Normal"
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Info */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                          <Clock className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500">Date et heure</p>
                            <p className="font-semibold text-slate-900">{request.date} à {request.time}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                          <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                          <div>
                            <p className="text-xs text-slate-500">Adresse</p>
                            <p className="font-semibold text-slate-900 text-sm">{request.address}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1 font-medium">Description</p>
                        <p className="text-slate-700">{request.description}</p>
                      </div>

                      {request.urgency && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-red-900">Intervention urgente</p>
                            <p className="text-xs text-red-700">Cette demande nécessite une prise en charge rapide</p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() => handleAccept(request.id)}
                          className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-xl shadow-md shadow-emerald-500/20"
                        >
                          <Check className="w-5 h-5 mr-2" />
                          Accepter
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          variant="outline"
                          className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                        >
                          <X className="w-5 h-5 mr-2" />
                          Refuser
                        </Button>
                      </div>
                    </div>

                    {/* Mini Map */}
                    {request.lat && request.lng && (
                      <div className="rounded-2xl overflow-hidden shadow-inner border border-slate-200 h-[250px] lg:h-auto">
                        <MapContainer
                          center={[request.lat, request.lng]}
                          zoom={15}
                          style={{ height: '100%', width: '100%', minHeight: '250px' }}
                          className="z-0"
                          scrollWheelZoom={false}
                          dragging={false}
                          zoomControl={false}
                        >
                          <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[request.lat, request.lng]} />
                        </MapContainer>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BillingModal 
        open={billingOpen} 
        onOpenChange={setBillingOpen} 
        doctorProfile={doctorProfile}
        onSuccess={fetchData}
      />
    </DashboardLayout>
  );
}
