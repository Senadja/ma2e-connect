import { useState } from "react";
import {
  Search,
  FileText,
  Download,
  Mail,
  Phone,
  User,
  ChevronRight,
  Briefcase,
  UserPlus,
  Coins,
  History,
  MessageSquare,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { generateAdhesionPdf } from "@/lib/adhesionPdf";

// Type renvoyé par l'API backend.
interface ApiApplication {
  id: string;
  appId: string;
  type: string;
  category: string;
  name: string;
  matricule: string;
  email: string;
  phone: string;
  status: "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  data: Record<string, unknown>;
  createdAt: string;
}

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "—";
const fmtDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// Libellés humains pour les champs libres stockés dans `data`.
const DATA_LABELS: Record<string, string> = {
  amount: "Montant",
  message: "Message",
  nomMere: "Nom de la mère",
  situationMatrimoniale: "Situation matrimoniale",
  dateDeNaissance: "Date de naissance",
  lieuDeNaissance: "Lieu de naissance",
  adresse: "Adresse / Boîte postale",
  cniNumero: "N° CNI",
  cniDu: "CNI — valable du",
  cniAu: "CNI — valable au",
  domicile: "Téléphone domicile",
  bureau: "Téléphone bureau",
  fonction: "Fonction",
  societe: "Société",
  categorie: "Catégorie",
  service: "Service",
  direction: "Direction",
  exploitation: "Exploitation",
  site: "Site d'affectation",
  dateEmbauche: "Date d'embauche",
  typeAdherent: "Statut sociétaire",
  personneAPrevenir: "Personne à prévenir",
  contactPrevenir: "Contact (personne à prévenir)",
  conjoint: "Nom du conjoint(e)",
  contactConjoint: "Contact (conjoint)",
  ayantsDroit: "Ayant(s) droit",
  contactAyantsDroit: "Contact (ayant droit)",
  intentionAdhesion: "Intention — droit d'adhésion (1 000 F)",
  intentionPart: "Intention — part sociale (5 000 F)",
};

// Normalise un enregistrement API vers la forme attendue par l'UI.
function mapApp(a: ApiApplication) {
  return {
    dbId: a.id,
    id: a.appId,
    type: a.type,
    category: capitalize(a.category),
    name: a.name,
    matricule: a.matricule,
    email: a.email,
    phone: a.phone,
    priority: a.priority.toLowerCase(),
    data: a.data || {},
    createdAt: a.createdAt,
    date: fmtDate(a.createdAt),
  };
}

type UiApp = ReturnType<typeof mapApp>;

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case "Adhésion":
      return <UserPlus className="h-4 w-4" />;
    case "Crédit":
      return <Coins className="h-4 w-4" />;
    case "Épargne":
      return <History className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const ApplicationsManager = () => {
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState<UiApp | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const rows = await api<ApiApplication[]>("/applications", { auth: true });
      return rows.map(mapApp);
    },
  });

  const filteredApps = applications.filter((app) => {
    const q = search.toLowerCase();
    return (
      app.name.toLowerCase().includes(q) ||
      app.id.toLowerCase().includes(q) ||
      app.matricule.toLowerCase().includes(q)
    );
  });

  // Export CSV des demandes affichées (respecte la recherche en cours).
  const exportCsv = () => {
    if (filteredApps.length === 0) {
      toast.error("Aucune demande à exporter.");
      return;
    }
    const headers = [
      "Référence", "Catégorie", "Type", "Nom", "Matricule", "Email", "Téléphone", "Date réception",
    ];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = filteredApps.map((a) => [
      a.id, a.category, a.type, a.name, a.matricule, a.email, a.phone, fmtDateTime(a.createdAt),
    ]);
    // Séparateur « ; » + BOM UTF-8 → Excel FR ouvre proprement les accents.
    const csv = "﻿" + [headers, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "demandes-ma2e.csv";
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredApps.length} demande(s) exportée(s).`);
  };

  // `documents` peut être un tableau (ancien format) ou un objet { slot: {name, path} } (formulaire actuel).
  const rawDocs = (selectedApp?.data as any)?.documents;
  const documents: { name: string; path: string }[] = Array.isArray(rawDocs)
    ? rawDocs
    : rawDocs && typeof rawDocs === "object"
    ? (Object.values(rawDocs) as { name: string; path: string }[])
    : [];
  const signature =
    typeof (selectedApp?.data as any)?.signature === "string" ? ((selectedApp!.data as any).signature as string) : "";
  const dataEntries = selectedApp
    ? Object.entries(selectedApp.data).filter(
        ([k, v]) => k !== "documents" && k !== "signature" && v !== "" && v != null,
      )
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary-dark">Gestion des Demandes</h2>
          <p className="text-muted-foreground">Consultez les demandes reçues via le site.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} className="rounded-full gap-2">
            <Download className="h-4 w-4" /> Exporter (CSV)
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40 shadow-sm overflow-hidden">
            <CardHeader className="p-4 border-b bg-card">
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
              <div className="divide-y divide-border/40">
                {isLoading ? (
                  <div className="p-12 text-center text-muted-foreground italic text-sm">Chargement des demandes…</div>
                ) : filteredApps.length > 0 ? (
                  filteredApps.map((app) => (
                    <div
                      key={app.id}
                      className={cn(
                        "flex items-center justify-between p-4 hover:bg-secondary/10 cursor-pointer transition-colors group",
                        selectedApp?.id === app.id && "bg-primary/5 border-l-4 border-l-primary",
                      )}
                      onClick={() => setSelectedApp(app)}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                            app.category === "Adhésion" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent-foreground",
                          )}
                        >
                          <CategoryIcon category={app.category} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono text-muted-foreground">{app.id}</span>
                            <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 h-4 border-primary/20 text-primary">
                              {app.type}
                            </Badge>
                          </div>
                          <h4 className="font-bold truncate text-sm">{app.name}</h4>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                            <span>Matricule: {app.matricule}</span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span>{app.date}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {app.priority === "high" && (
                          <Badge variant="destructive" className="text-[10px]">Priorité Haute</Badge>
                        )}
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-muted-foreground/30 transition-transform",
                            selectedApp?.id === app.id && "translate-x-1 text-primary",
                          )}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center text-muted-foreground italic text-sm">
                    Aucune demande ne correspond à vos critères.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {selectedApp ? (
            <Card className="border-border/40 shadow-md sticky top-24 animate-in fade-in slide-in-from-right-4 overflow-hidden">
              <CardHeader className="border-b bg-primary/5 pb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <CardTitle className="text-xl font-display font-bold">{selectedApp.type}</CardTitle>
                    <span className="text-xs font-mono text-muted-foreground mt-1">{selectedApp.id}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                    onClick={() => setSelectedApp(null)}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
                {selectedApp.priority === "high" && (
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="text-[10px] animate-pulse">Priorité Haute</Badge>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 space-y-6">
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Informations Demandeur</div>
                        <div className="font-bold text-lg leading-tight">{selectedApp.name}</div>
                        <div className="text-sm font-medium text-primary mt-1">Matricule : {selectedApp.matricule}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {[selectedApp.data.direction, selectedApp.data.service].filter(Boolean).join(" · ") ||
                            `${selectedApp.category} · ${selectedApp.type}`}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <a
                        href={`tel:${selectedApp.phone}`}
                        className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center shrink-0 border border-border shadow-sm">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-sm font-medium">{selectedApp.phone}</div>
                      </a>

                      <a
                        href={selectedApp.email ? `mailto:${selectedApp.email}` : undefined}
                        className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-lg bg-card flex items-center justify-center shrink-0 border border-border shadow-sm">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-sm font-medium truncate">{selectedApp.email || "— non renseigné"}</div>
                      </a>
                    </div>
                  </div>

                  {/* Détails saisis dans le formulaire */}
                  {dataEntries.length > 0 && (
                    <div className="pt-6 border-t space-y-3">
                      <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Détails de la demande</div>
                      <dl className="grid grid-cols-1 gap-2 text-sm">
                        {dataEntries.map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-4">
                            <dt className="text-muted-foreground shrink-0">{DATA_LABELS[k] || k}</dt>
                            <dd className="font-medium text-right break-words">{typeof v === "boolean" ? (v ? "Oui" : "Non") : String(v)}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {/* Pièces justificatives jointes */}
                  {documents.length > 0 && (
                    <div className="pt-6 border-t space-y-3">
                      <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                        Pièces justificatives ({documents.length})
                      </div>
                      <ul className="space-y-2">
                        {documents.map((doc, i) => (
                          <li key={i}>
                            <a
                              href={doc.path}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3 hover:border-primary/40 hover:bg-secondary/40 transition-colors group"
                            >
                              <FileText className="h-4 w-4 text-primary shrink-0" />
                              <span className="text-sm font-medium flex-1 truncate">{doc.name}</span>
                              <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Signature du demandeur (si fournie en ligne) */}
                  {signature && (
                    <div className="pt-6 border-t space-y-3">
                      <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Signature</div>
                      <div className="rounded-xl border border-border bg-white p-3">
                        <img src={signature} alt="Signature du demandeur" className="mx-auto max-h-28 object-contain" />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-6 border-t space-y-4">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Actions</div>
                    {selectedApp.category === "Adhésion" && (
                      <Button
                        onClick={() => { void generateAdhesionPdf(selectedApp).catch(() => toast.error("Échec de la génération du PDF.")); }}
                        className="w-full rounded-xl h-11 gap-2 bg-primary hover:bg-primary-dark text-white"
                      >
                        <Download className="h-4 w-4" /> Télécharger le formulaire (PDF)
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      asChild
                      disabled={!selectedApp.email}
                      className="w-full rounded-xl h-11 gap-2 text-xs font-bold text-muted-foreground"
                    >
                      <a href={selectedApp.email ? `mailto:${selectedApp.email}` : undefined}>
                        <MessageSquare className="h-4 w-4" /> Contacter le demandeur
                      </a>
                    </Button>
                  </div>

                  {/* Historique réel */}
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Historique</div>
                      <Badge variant="secondary" className="text-[9px] h-5">Suivi</Badge>
                    </div>
                    <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                      <div className="flex gap-3 text-xs relative z-10">
                        <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center ring-4 ring-card">
                          <CheckCircle2 className="h-2 w-2 text-white" />
                        </div>
                        <div>
                          <div className="font-bold">Demande reçue</div>
                          <p className="text-muted-foreground text-[10px]">{fmtDateTime(selectedApp.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/40 border-dashed bg-secondary/5 flex flex-col items-center justify-center p-12 text-center min-h-[500px] rounded-[2rem]">
              <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary/20 mb-6 animate-pulse">
                <Briefcase className="h-10 w-10" />
              </div>
              <h3 className="font-display text-xl font-bold text-muted-foreground">Sélectionnez une demande</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">
                Consultez les détails et les pièces des dossiers reçus.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
