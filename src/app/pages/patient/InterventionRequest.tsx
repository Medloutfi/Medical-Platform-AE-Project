import { useState, useEffect, useRef, useCallback } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Switch } from "../../components/ui/switch";
import { AlertCircle, CheckCircle2, MapPin, Navigation, Loader2, Send } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useAuth } from "../../contexts/AuthContext";

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const patientIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function DraggableMarker({ position, setPosition }: { position: [number, number]; setPosition: (pos: [number, number]) => void }) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const { lat, lng } = marker.getLatLng();
        setPosition([lat, lng]);
      }
    },
  };

  return (
    <Marker
      draggable
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={patientIcon}
    />
  );
}

function MapClickHandler({ setPosition }: { setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function InterventionRequest() {
  const { user } = useAuth();
  const [careTypes, setCareTypes] = useState<any[]>([]);
  const [isUrgent, setIsUrgent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [position, setPosition] = useState<[number, number]>([33.5731, -7.5898]); // Default: Casablanca
  const [hasLocation, setHasLocation] = useState(false);
  const [selectedCareType, setSelectedCareType] = useState<string>("");

  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = now.toTimeString().split(':').slice(0, 2).join(':');

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [address, setAddress] = useState("");

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      }
    } catch (error) {
      console.error("Geocoding failed", error);
    }
  };

  useEffect(() => {
    if (hasLocation) {
      reverseGeocode(position[0], position[1]);
    }
  }, [position, hasLocation]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const types = await api.get<any[]>('/careTypes');
        setCareTypes(types);
      } catch (error) {
        console.error("Failed to load care types", error);
      }
    };
    fetchData();
  }, []);

  const getMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setHasLocation(true);
        setIsLocating(false);
        toast.success("Position détectée avec succès!");
      },
      (err) => {
        setIsLocating(false);
        toast.error("Impossible d'obtenir votre position. Vous pouvez placer le marqueur manuellement sur la carte.");
        setHasLocation(true); // Show map anyway with default position
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      await api.post('/interventions', {
        id: Date.now(),
        patientName: user?.name || "Patient",
        patientId: user?.patientId || user?.id,
        type: selectedCareType,
        description: formData.get('description'),
        date: formData.get('date'),
        time: formData.get('time'),
        address: formData.get('address'),
        lat: position[0],
        lng: position[1],
        urgency: isUrgent,
        status: "pending"
      });
      setSubmitted(true);
      toast.success("Demande d'intervention envoyée avec succès!");
      form.reset();
      setSelectedCareType("");
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: "Détails du soin" },
    { number: 2, label: "Localisation" },
    { number: 3, label: "Planification" },
  ];

  return (
    <DashboardLayout role="patient" userName={user?.name || "Patient"} notificationCount={3}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Demander une intervention à domicile
          </h1>
          <p className="text-slate-500">
            Remplissez le formulaire et partagez votre localisation pour recevoir un médecin rapidement
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-cyan-500/25">
                  {step.number}
                </div>
                <span className="text-xs text-slate-500 mt-2 font-medium">{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className="w-16 md:w-24 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 mx-3 mt-[-16px]" />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Care Details */}
          <Card className="border-0 shadow-lg animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.15s' }}>
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-blue-100/50">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">1</div>
                Détails de l'intervention
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="careType" className="text-slate-700 font-semibold">Type de soin *</Label>
                <Select required name="careType" value={selectedCareType} onValueChange={setSelectedCareType}>
                  <SelectTrigger id="careType" className="h-12 rounded-xl border-slate-200 focus:ring-cyan-500">
                    <SelectValue placeholder="Sélectionnez un type de soin" />
                  </SelectTrigger>
                  <SelectContent>
                    {careTypes.map((type) => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 font-semibold">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Décrivez votre besoin médical en détail..."
                  rows={4}
                  required
                  className="rounded-xl border-slate-200 focus:ring-cyan-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Location */}
          <Card className="border-0 shadow-lg animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">2</div>
                Votre localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={getMyLocation}
                  disabled={isLocating}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-md shadow-emerald-500/25 h-12"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Détection en cours...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-5 h-5 mr-2" />
                      Utiliser ma position GPS
                    </>
                  )}
                </Button>
                {hasLocation && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    Position détectée — Vous pouvez la glisser pour ajuster
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                <MapContainer
                  center={position}
                  zoom={14}
                  style={{ height: '320px', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <DraggableMarker position={position} setPosition={(pos) => { setPosition(pos); setHasLocation(true); }} />
                  <MapClickHandler setPosition={(pos) => { setPosition(pos); setHasLocation(true); }} />
                </MapContainer>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Cliquez sur la carte ou glissez le marqueur pour ajuster votre position
              </p>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-700 font-semibold">Adresse complète *</Label>
                <Input
                  id="address"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="12 Rue Atlas, Casablanca"
                  required
                  className="h-12 rounded-xl border-slate-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Schedule */}
          <Card className="border-0 shadow-lg animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.25s' }}>
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100/50">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">3</div>
                Planification
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-700 font-semibold">Date souhaitée</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="h-12 rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-slate-700 font-semibold">Heure souhaitée</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="h-12 rounded-xl border-slate-200"
                  />
                </div>
              </div>

              {/* Urgency Toggle */}
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <Label htmlFor="urgent" className="font-semibold text-slate-900 cursor-pointer">Intervention urgente</Label>
                    <p className="text-sm text-slate-500">Priorité maximale (frais supplémentaires)</p>
                  </div>
                </div>
                <Switch
                  id="urgent"
                  checked={isUrgent}
                  onCheckedChange={setIsUrgent}
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-2">
                <Button 
                  type="submit" 
                  className="flex-1 h-14 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl text-base font-semibold shadow-lg shadow-cyan-500/25 transition-all hover:shadow-xl hover:shadow-cyan-500/30" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer la demande
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" className="h-14 rounded-xl px-8">
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Success Banner */}
        {submitted && (
          <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg animate-bounce-in">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-lg">Demande envoyée!</h4>
                  <p className="text-sm text-emerald-700">Nous recherchons un médecin disponible près de votre position. Vous recevrez une notification sous peu.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* How it works */}
        <Card className="border-0 shadow-lg animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-slate-900">Comment ça marche?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { num: 1, text: "Remplissez le formulaire avec vos informations", color: "from-cyan-500 to-blue-500" },
                { num: 2, text: "Partagez votre localisation GPS", color: "from-emerald-500 to-teal-500" },
                { num: 3, text: "Un médecin proche accepte votre demande", color: "from-violet-500 to-purple-500" },
                { num: 4, text: "Le médecin vous soigne à domicile", color: "from-amber-500 to-orange-500" }
              ].map((step) => (
                <div key={step.num} className="text-center group">
                  <div className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center text-white font-bold mx-auto mb-3 shadow-lg transition-transform group-hover:scale-110`}>
                    {step.num}
                  </div>
                  <p className="text-sm text-slate-600">{step.text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
