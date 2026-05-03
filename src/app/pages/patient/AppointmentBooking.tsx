import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { MapPin, Star, Clock, Phone, Calendar as CalendarIcon, Check, ChevronRight, Sparkles, PartyPopper } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";
import confetti from "canvas-confetti";
import { useAuth } from "../../contexts/AuthContext";

export default function AppointmentBooking() {
  const { user } = useAuth();
  const [selectedClinic, setSelectedClinic] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [clinics, setClinics] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docs, clins] = await Promise.all([
          api.get<any[]>('/doctors'),
          api.get<any[]>('/clinics')
        ]);
        setDoctors(docs);
        setClinics(clins);
      } catch (error) {
        console.error("Failed to load clinics or doctors", error);
      }
    };
    fetchData();
  }, []);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const morningSlots = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
  const afternoonSlots = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

  const filteredDoctors = selectedClinic
    ? doctors.filter(d => d.clinicId === selectedClinic)
    : [];

  const currentStep = selectedSlot ? 4 : selectedDoctor ? 3 : selectedClinic ? 2 : 1;

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleBooking = async () => {
    setIsSubmitting(true);
    try {
      await api.post('/appointments', {
        id: Date.now(),
        patientName: user?.name || "Patient",
        patientId: user?.patientId || user?.id,
        doctorId: selectedDoctor,
        clinicId: selectedClinic,
        date: selectedDate,
        time: selectedSlot,
        status: "confirmed",
        reason: "Consultation"
      });
      setShowConfirmation(true);
      // Fire confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success("Rendez-vous confirmé!");
    } catch (error) {
      toast.error("Erreur lors de la réservation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const steps = [
    { num: 1, label: "Clinique", done: currentStep > 1 },
    { num: 2, label: "Médecin", done: currentStep > 2 },
    { num: 3, label: "Créneau", done: currentStep > 3 },
    { num: 4, label: "Confirmation", done: false },
  ];

  return (
    <DashboardLayout role="patient" userName={user?.name || "Patient"} notificationCount={3}>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <CalendarIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Réserver un rendez-vous</h1>
              <p className="text-slate-500">Choisissez votre clinique, médecin et créneau horaire</p>
            </div>
          </div>
        </div>

        {/* Visual Stepper */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center relative">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
                    step.done 
                      ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-100' 
                      : currentStep === step.num
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 animate-pulse-glow'
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step.done ? <Check className="w-5 h-5" /> : step.num}
                  </div>
                  <span className={`text-xs mt-2 font-medium transition-colors ${
                    step.done || currentStep === step.num ? 'text-slate-700' : 'text-slate-400'
                  }`}>{step.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 mx-3 mt-[-16px]">
                    <div className={`h-0.5 rounded-full transition-all duration-500 ${
                      step.done ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-slate-200'
                    }`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Select Clinic */}
        <Card className="border-0 shadow-lg overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100/50">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                currentStep > 1 ? 'bg-emerald-500 text-white' : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
              }`}>
                {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              Sélectionnez une clinique
              {selectedClinic && (
                <Badge variant="outline" className="ml-2 text-cyan-600 border-cyan-200 bg-cyan-50">
                  {clinics.find(c => c.id === selectedClinic)?.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
              {clinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 border-2 ${
                    selectedClinic === clinic.id 
                      ? "border-cyan-500 shadow-xl shadow-cyan-500/10 scale-[1.02]" 
                      : "border-transparent shadow-md hover:shadow-xl hover:scale-[1.01]"
                  }`}
                  onClick={() => {
                    setSelectedClinic(clinic.id);
                    setSelectedDoctor(null);
                    setSelectedSlot(null);
                    scrollTo(step2Ref);
                  }}
                >
                  <div className="relative">
                    <ImageWithFallback
                      src={clinic.image}
                      alt={clinic.name}
                      className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <Badge className="bg-white/90 text-slate-700 backdrop-blur-sm border-0 shadow-sm">{clinic.specialty}</Badge>
                    </div>
                    {selectedClinic === clinic.id && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center animate-bounce-in shadow-lg">
                        <Check className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-slate-900 mb-1.5">{clinic.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs truncate">{clinic.address}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold text-slate-700">{clinic.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Doctor */}
        {selectedClinic && (
          <div ref={step2Ref}>
            <Card className="border-0 shadow-lg overflow-hidden animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                    currentStep > 2 ? 'bg-emerald-500 text-white' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                  }`}>
                    {currentStep > 2 ? <Check className="w-5 h-5" /> : '2'}
                  </div>
                  Choisissez un médecin
                  {selectedDoctor && (
                    <Badge variant="outline" className="ml-2 text-emerald-600 border-emerald-200 bg-emerald-50">
                      {doctors.find(d => d.id === selectedDoctor)?.name}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
                  {filteredDoctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className={`group cursor-pointer rounded-2xl p-5 transition-all duration-300 border-2 ${
                        selectedDoctor === doctor.id
                          ? "border-emerald-500 bg-emerald-50/50 shadow-xl shadow-emerald-500/10"
                          : !doctor.available
                            ? "border-slate-100 bg-slate-50/50 opacity-60 cursor-not-allowed"
                            : "border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg"
                      }`}
                      onClick={() => {
                        if (doctor.available) {
                          setSelectedDoctor(doctor.id);
                          setSelectedSlot(null);
                          scrollTo(step3Ref);
                        }
                      }}
                    >
                      <div className="flex gap-4">
                        <div className="relative">
                          <ImageWithFallback
                            src={doctor.image}
                            alt={doctor.name}
                            className="w-20 h-20 rounded-2xl object-cover shadow-md"
                          />
                          {doctor.available && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white animate-pulse-soft" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-slate-900">{doctor.name}</h3>
                              <p className="text-sm text-slate-500">{doctor.specialty}</p>
                            </div>
                            {selectedDoctor === doctor.id && (
                              <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center animate-bounce-in">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <Badge variant={doctor.available ? "default" : "secondary"} className={doctor.available ? "bg-emerald-100 text-emerald-700 border-0" : ""}>
                              {doctor.available ? "✓ Disponible" : "Non disponible"}
                            </Badge>
                            <Badge variant="outline" className="border-slate-200 text-slate-600">{doctor.experience}</Badge>
                          </div>
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(doctor.rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                            ))}
                            <span className="text-sm font-semibold text-slate-700 ml-1">{doctor.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredDoctors.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-slate-400">
                      <p>Aucun médecin trouvé dans cette clinique</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Select Time Slot */}
        {selectedDoctor && (
          <div ref={step3Ref}>
            <Card className="border-0 shadow-lg overflow-hidden animate-fade-in-up">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100/50">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                    currentStep > 3 ? 'bg-emerald-500 text-white' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'
                  }`}>
                    {currentStep > 3 ? <Check className="w-5 h-5" /> : '3'}
                  </div>
                  Choisissez un créneau
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Date Picker */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Date du rendez-vous</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="h-12 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium w-full max-w-xs focus:ring-2 focus:ring-violet-400 focus:border-violet-400 outline-none transition-all"
                  />
                  {selectedDate && (
                    <p className="text-sm text-violet-600 mt-2 font-medium capitalize">
                      📅 {formatDate(selectedDate)}
                    </p>
                  )}
                </div>

                {/* Morning Slots */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    ☀️ Matin
                  </p>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {morningSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => { setSelectedSlot(slot); scrollTo(confirmRef); }}
                        className={`h-11 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedSlot === slot
                            ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 scale-105'
                            : 'bg-slate-50 text-slate-700 hover:bg-violet-50 hover:text-violet-700 border border-slate-200 hover:border-violet-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Afternoon Slots */}
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    🌙 Après-midi
                  </p>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                    {afternoonSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => { setSelectedSlot(slot); scrollTo(confirmRef); }}
                        className={`h-11 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedSlot === slot
                            ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25 scale-105'
                            : 'bg-slate-50 text-slate-700 hover:bg-violet-50 hover:text-violet-700 border border-slate-200 hover:border-violet-300'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Confirmation Button */}
        {selectedSlot && (
          <div ref={confirmRef}>
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 animate-fade-in-up overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
              <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium text-white/80 uppercase tracking-wider">Prêt à confirmer</span>
                  </div>
                  <h3 className="font-bold text-2xl mb-2">Confirmer votre rendez-vous</h3>
                  <div className="space-y-1 text-white/90">
                    <p className="flex items-center gap-2">
                      <span className="text-white/60">Médecin:</span>
                      <span className="font-semibold">{doctors.find(d => d.id === selectedDoctor)?.name}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-white/60">Clinique:</span>
                      <span className="font-semibold">{clinics.find(c => c.id === selectedClinic)?.name}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-white/60">Date:</span>
                      <span className="font-semibold capitalize">{formatDate(selectedDate)}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-white/60">Heure:</span>
                      <span className="font-semibold">{selectedSlot}</span>
                    </p>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleBooking} 
                  disabled={isSubmitting}
                  className="bg-white text-blue-600 hover:bg-blue-50 rounded-2xl h-14 px-10 text-base font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                >
                  {isSubmitting ? "En cours..." : (
                    <>
                      Confirmer le RDV
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-emerald-600 text-xl">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <PartyPopper className="w-6 h-6 text-emerald-600" />
              </div>
              Rendez-vous confirmé!
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl space-y-3">
                <p className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Médecin</span>
                  <span className="font-semibold text-slate-900">{doctors.find(d => d.id === selectedDoctor)?.name}</span>
                </p>
                <div className="border-t border-slate-200" />
                <p className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Date</span>
                  <span className="font-semibold text-slate-900 capitalize">{formatDate(selectedDate)}</span>
                </p>
                <div className="border-t border-slate-200" />
                <p className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Heure</span>
                  <span className="font-semibold text-slate-900">{selectedSlot}</span>
                </p>
                <div className="border-t border-slate-200" />
                <p className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Clinique</span>
                  <span className="font-semibold text-slate-900">{clinics.find(c => c.id === selectedClinic)?.name}</span>
                </p>
                <div className="border-t border-slate-200" />
                <p className="flex items-center justify-between">
                  <span className="text-slate-500 text-sm">Téléphone</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {doctors.find(d => d.id === selectedDoctor)?.phone}
                  </span>
                </p>
              </div>
              <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
                <p className="text-sm text-cyan-700">📧 Un email de confirmation a été envoyé à votre adresse.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
