import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { Phone, Mail, Star } from "lucide-react";
import { ImageWithFallback } from "../../components/figma/ImageWithFallback";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', specialty: '', experience: '', phone: '', username: '', password: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docs = await api.get<any[]>('/doctors');
        setDoctors(docs);
      } catch (error) {
        console.error("Failed to load doctors:", error);
      }
    };
    fetchData();
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    
    try {
      const newDoc = {
        id: Date.now(),
        name: formData.name,
        specialty: formData.specialty,
        experience: formData.experience,
        phone: formData.phone,
        rating: 5.0,
        available: true,
        clinicId: 1
      };
      await api.post('/doctors', newDoc);
      
      const newUser = {
        id: Date.now() + 1,
        username: formData.username,
        password: formData.password,
        role: 'doctor',
        name: formData.name,
        doctorId: newDoc.id
      };
      await api.post('/users', newUser);
      
      setDoctors([...doctors, newDoc]);
      setIsDialogOpen(false);
      setFormData({ name: '', specialty: '', experience: '', phone: '', username: '', password: '' });
      toast.success("Médecin ajouté avec succès");
    } catch(e) {
      toast.error("Erreur serveur lors de la création");
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin" notificationCount={5}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des médecins</h1>
            <p className="text-gray-600">Liste complète et statistiques des médecins</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter un médecin</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nouveau médecin</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddDoctor} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label>Nom complet *</Label>
                  <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Dr. Ahmed..." />
                </div>
                <div className="grid gap-2">
                  <Label>Spécialité</Label>
                  <Input value={formData.specialty} onChange={(e) => setFormData({...formData, specialty: e.target.value})} placeholder="Cardiologue..." />
                </div>
                <div className="grid gap-2">
                  <Label>Expérience</Label>
                  <Input value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} placeholder="10 ans" />
                </div>
                <div className="grid gap-2">
                  <Label>Téléphone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+212 6..." />
                </div>
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm text-gray-500 mb-2">Identifiants de connexion</p>
                  <div className="grid gap-2 mb-2">
                    <Label>Nom d'utilisateur *</Label>
                    <Input required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Mot de passe *</Label>
                    <Input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  </div>
                </div>
                <Button type="submit" className="w-full">Créer le compte</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Total médecins</p>
              <p className="text-3xl font-bold text-gray-900">{doctors.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Disponibles</p>
              <p className="text-3xl font-bold text-green-600">{doctors.filter(d => d.available).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">En mission</p>
              <p className="text-3xl font-bold text-blue-600">{doctors.filter(d => !d.available).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Note moyenne</p>
              <p className="text-3xl font-bold text-yellow-600">4.8</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des médecins</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Spécialité</TableHead>
                  <TableHead>Expérience</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ImageWithFallback
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{doctor.name}</p>
                          <p className="text-xs text-gray-500">ID: {doctor.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{doctor.specialty}</TableCell>
                    <TableCell>{doctor.experience}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span className="text-xs">{doctor.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{doctor.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={doctor.available ? "default" : "secondary"}>
                        {doctor.available ? "Disponible" : "Occupé"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Voir</Button>
                        <Button variant="ghost" size="sm">Éditer</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top médecins par note</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...doctors].sort((a, b) => b.rating - a.rating).slice(0, 3).map((doctor, index) => (
                  <div key={doctor.id} className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <ImageWithFallback
                      src={doctor.image}
                      alt={doctor.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{doctor.name}</p>
                      <p className="text-sm text-gray-600">{doctor.specialty}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">{doctor.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Répartition par spécialité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">Médecin généraliste</span>
                  <Badge variant="secondary">2</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Cardiologue</span>
                  <Badge variant="secondary">1</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">Pédiatre</span>
                  <Badge variant="secondary">1</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
