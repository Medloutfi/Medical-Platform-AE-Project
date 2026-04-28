import { DashboardLayout } from "../../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { Phone, Mail, MapPin, User } from "lucide-react";

export default function AdminPatients() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '', age: '', gender: 'Homme', email: '', phone: '', address: '', username: '', password: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pats = await api.get<any[]>('/patients');
        setPatients(pats);
      } catch (error) {
        console.error("Failed to load patients:", error);
      }
    };
    fetchData();
  }, []);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    
    try {
      const newPat = {
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        age: parseInt(formData.age) || 30,
        gender: formData.gender
      };
      await api.post('/patients', newPat);
      
      const newUser = {
        id: Date.now() + 1,
        username: formData.username,
        password: formData.password,
        role: 'patient',
        name: formData.name,
        patientId: newPat.id
      };
      await api.post('/users', newUser);
      
      setPatients([...patients, newPat]);
      setIsDialogOpen(false);
      setFormData({ name: '', age: '', gender: 'Homme', email: '', phone: '', address: '', username: '', password: '' });
      toast.success("Patient ajouté avec succès");
    } catch(e) {
      toast.error("Erreur serveur lors de la création");
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin" notificationCount={5}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des patients</h1>
            <p className="text-gray-600">Liste complète et informations des patients</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Ajouter un patient</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nouveau patient</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPatient} className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label>Nom complet *</Label>
                  <Input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Ahmed Tazi..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Âge</Label>
                    <Input type="number" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})} placeholder="30" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Genre</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.gender} 
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Téléphone</Label>
                  <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+212 6..." />
                </div>
                <div className="grid gap-2">
                  <Label>Adresse</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="12 Rue..." />
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
              <p className="text-sm text-gray-600 mb-1">Total patients</p>
              <p className="text-3xl font-bold text-gray-900">{patients.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Actifs ce mois</p>
              <p className="text-3xl font-bold text-blue-600">{patients.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Nouveaux (30j)</p>
              <p className="text-3xl font-bold text-green-600">8</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-1">Taux de satisfaction</p>
              <p className="text-3xl font-bold text-purple-600">96%</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Liste des patients</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Âge / Genre</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Historique</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-500">ID: {patient.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-gray-900">{patient.age} ans</p>
                        <p className="text-xs text-gray-500">{patient.gender}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span className="text-xs">{patient.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span className="text-xs">{patient.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-1 max-w-xs">
                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-gray-400" />
                        <span className="text-xs text-gray-600">{patient.address}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">3 interventions</Badge>
                        <Badge variant="outline" className="text-xs">5 RDV</Badge>
                      </div>
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
              <CardTitle>Répartition par âge</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700">18-30 ans</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '33%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">33%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700">31-50 ans</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">67%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-gray-700">50+ ans</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">0%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Patients par ville</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-700">Casablanca</span>
                  </div>
                  <Badge>2</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">Rabat</span>
                  </div>
                  <Badge>1</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Autres villes</span>
                  </div>
                  <Badge>0</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
