import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Check, CreditCard, Ticket, Star } from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";

interface BillingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorProfile: any;
  onSuccess: () => void;
}

export function BillingModal({ open, onOpenChange, doctorProfile, onSuccess }: BillingModalProps) {
  const [loading, setLoading] = useState(false);

  const buyCredits = async (amount: number, plan: string = "basic") => {
    if (!doctorProfile) return;
    setLoading(true);
    try {
      // Mock payment delay
      await new Promise(r => setTimeout(r, 1000));
      
      const newCredits = (doctorProfile.credits || 0) + amount;
      await api.patch(`/doctors/${doctorProfile.id}`, { 
        credits: newCredits,
        subscriptionPlan: plan 
      });
      
      toast.success("Achat réussi ! Vos crédits ont été ajoutés.");
      onSuccess();
      onOpenChange(false);
    } catch (e) {
      toast.error("Erreur lors de la transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Rechargez vos Passes</DialogTitle>
          <DialogDescription className="text-center text-base">
            Un passe vous permet d'accepter une demande d'intervention et de débloquer les coordonnées du patient.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Pack Découverte */}
          <div className="border border-slate-200 rounded-2xl p-5 hover:border-cyan-400 hover:shadow-lg transition-all flex flex-col relative bg-white">
            <h3 className="font-bold text-slate-900 text-lg">Pack Starter</h3>
            <div className="my-4">
              <span className="text-3xl font-bold text-slate-900">100<span className="text-lg">DH</span></span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center text-sm text-slate-600">
                <Ticket className="w-4 h-4 text-cyan-500 mr-2" /> 5 Passes
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <Check className="w-4 h-4 text-emerald-500 mr-2" /> Sans engagement
              </li>
            </ul>
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl"
              onClick={() => buyCredits(5)}
              disabled={loading}
            >
              Acheter (5 passes)
            </Button>
          </div>

          {/* Pack Pro */}
          <div className="border-2 border-indigo-500 rounded-2xl p-5 shadow-xl flex flex-col relative bg-gradient-to-b from-indigo-50/50 to-white transform md:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Populaire
            </div>
            <h3 className="font-bold text-indigo-900 text-lg">Pack Pro</h3>
            <div className="my-4">
              <span className="text-3xl font-bold text-slate-900">350<span className="text-lg">DH</span></span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center text-sm text-slate-600 font-medium">
                <Ticket className="w-4 h-4 text-indigo-500 mr-2" /> 20 Passes (+2 offerts)
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <Check className="w-4 h-4 text-emerald-500 mr-2" /> Sans engagement
              </li>
            </ul>
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200"
              onClick={() => buyCredits(22)}
              disabled={loading}
            >
              Acheter (22 passes)
            </Button>
          </div>

          {/* Premium */}
          <div className="border border-slate-200 rounded-2xl p-5 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col relative bg-white">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1">VIP Mensuel</h3>
            <div className="my-4">
              <span className="text-3xl font-bold text-slate-900">800<span className="text-lg">DH</span></span>
              <span className="text-sm text-slate-500 block">/ mois</span>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              <li className="flex items-center text-sm text-amber-600 font-bold">
                <Star className="w-4 h-4 mr-2" /> Passes illimités
              </li>
              <li className="flex items-center text-sm text-slate-600">
                <Check className="w-4 h-4 text-emerald-500 mr-2" /> Badge Premium
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-bold rounded-xl"
              onClick={() => buyCredits(9999, "premium")}
              disabled={loading}
            >
              S'abonner
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
          <CreditCard className="w-3 h-3" /> Paiement sécurisé par CMI (Maroc)
        </div>
      </DialogContent>
    </Dialog>
  );
}
