import { useState } from "react";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText,
  Download,
  Mail,
  Phone,
  User,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Simulated applications data
const APPLICATIONS = [
  { id: "ADH-2025-001", type: "Adhésion", name: "Mamadou Koné", matricule: "CIE-9823", date: "20 Mars 2025", status: "pending", priority: "high" },
  { id: "CRD-2025-042", type: "Crédit Scolaire", name: "Awa Diarra", matricule: "SOD-1245", date: "19 Mars 2025", status: "reviewing", priority: "medium" },
  { id: "EPG-2025-012", type: "Épargne Logement", name: "Jean-Pierre Kouassi", matricule: "CIE-4567", date: "18 Mars 2025", status: "approved", priority: "low" },
  { id: "ADH-2025-002", type: "Adhésion", name: "Marie-Louise Kouamé", matricule: "MA2E-008", date: "18 Mars 2025", status: "approved", priority: "high" },
  { id: "CRD-2025-043", type: "Crédit Ordinaire", name: "Seydou Traoré", matricule: "CIE-3321", date: "17 Mars 2025", status: "rejected", priority: "medium" },
];

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "pending": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">En attente</Badge>;
    case "reviewing": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">En examen</Badge>;
    case "approved": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Approuvé</Badge>;
    case "rejected": return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">Rejeté</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

export const ApplicationsManager = () => {
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary-dark">Gestion des Demandes</h2>
          <p className="text-muted-foreground">Suivez et traitez les formulaires reçus via le site.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-full gap-2">
            <Download className="h-4 w-4" /> Exporter (CSV)
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher par nom, matricule ou ID..." 
                  className="pl-9 rounded-full bg-secondary/20 border-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {APPLICATIONS.filter(app => app.name.toLowerCase().includes(search.toLowerCase()) || app.id.includes(search.toUpperCase())).map((app) => (
                  <div 
                    key={app.id} 
                    className={cn(
                      "flex items-center justify-between p-4 hover:bg-secondary/10 cursor-pointer transition-colors",
                      selectedApp?.id === app.id && "bg-primary/5 border-l-4 border-l-primary"
                    )}
                    onClick={() => setSelectedApp(app)}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0",
                        app.type === "Adhésion" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-foreground"
                      )}>
                        {app.type === "Adhésion" ? "AD" : "PR"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">{app.id}</span>
                          <span className="text-[10px] font-bold uppercase text-primary">{app.type}</span>
                        </div>
                        <h4 className="font-bold truncate">{app.name}</h4>
                        <p className="text-xs text-muted-foreground">Matricule: {app.matricule} • {app.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={app.status} />
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedApp ? (
            <Card className="border-border/40 shadow-md sticky top-24 animate-in fade-in slide-in-from-right-4">
              <CardHeader className="border-b bg-secondary/10">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-display font-bold">{selectedApp.type}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedApp(null)}>
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={selectedApp.status} />
                  <span className="text-xs text-muted-foreground">{selectedApp.id}</span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Demandeur</div>
                      <div className="font-bold">{selectedApp.name}</div>
                      <div className="text-sm">Matricule : {selectedApp.matricule}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Contact</div>
                      <div className="text-sm">+225 07 08 09 10 11</div>
                      <div className="text-sm text-primary flex items-center gap-1 cursor-pointer hover:underline">
                        <Mail className="h-3 w-3" /> m.kone@cie.ci
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="text-xs font-bold uppercase text-muted-foreground">Actions de traitement</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-10 gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Approuver
                    </Button>
                    <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-lg h-10 gap-2">
                      <XCircle className="h-4 w-4" /> Rejeter
                    </Button>
                  </div>
                  <Button variant="secondary" className="w-full rounded-lg gap-2">
                    <FileText className="h-4 w-4" /> Voir le dossier complet
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-xs font-bold uppercase text-muted-foreground mb-3">Journal d'audit</div>
                  <div className="space-y-3">
                    <div className="flex gap-2 text-xs">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                      <div>
                        <span className="font-bold">Système :</span> Demande reçue via le site web.
                        <div className="text-[10px] text-muted-foreground">{selectedApp.date} - 14:22</div>
                      </div>
                    </div>
                    {selectedApp.status === "approved" && (
                      <div className="flex gap-2 text-xs">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1" />
                        <div>
                          <span className="font-bold">Admin :</span> Dossier validé après vérification.
                          <div className="text-[10px] text-muted-foreground">Hier - 10:45</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/40 border-dashed bg-secondary/10 flex flex-col items-center justify-center p-12 text-center h-[400px]">
              <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/40 mb-4">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-muted-foreground">Aucune demande sélectionnée</h3>
              <p className="text-xs text-muted-foreground mt-2">Cliquez sur une demande dans la liste pour voir les détails et effectuer des actions.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
