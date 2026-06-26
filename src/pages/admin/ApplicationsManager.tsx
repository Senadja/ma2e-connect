import { useState } from "react";
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
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
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  decisionReason: string | null;
  decidedAt: string | null;
  decidedBy: string | null;
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
  adresse: "Adresse",
  societe: "Société",
  categorie: "Catégorie",
  service: "Service",
  direction: "Direction",
  exploitation: "Exploitation",
  site: "Site d'affectation",
  dateEmbauche: "Date d'embauche",
  typeAdherent: "Statut adhérent",
  personneAPrevenir: "Personne à prévenir",
  contactPrevenir: "Contact (personne à prévenir)",
  ayantsDroit: "Ayant(s) droit",
  contactAyantsDroit: "Contact (ayant droit)",
  intentionAdhesion: "Intention — droit d'adhésion (6 000 F)",
  intentionPart: "Intention — part sociale (8 000 F)",
};

// Causes de refus pré-définies (cases à cocher) — accélèrent la saisie de l'admin.
const REJECT_CAUSES = [
  "Dossier incomplet (pièces manquantes)",
  "Matricule introuvable ou non vérifiable",
  "Conditions d'éligibilité non remplies",
  "Informations erronées ou incohérentes",
  "Demande en doublon",
];

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
    status: a.status.toLowerCase(),
    priority: a.priority.toLowerCase(),
    data: a.data || {},
    decisionReason: a.decisionReason,
    decidedAt: a.decidedAt,
    decidedBy: a.decidedBy,
    createdAt: a.createdAt,
    date: fmtDate(a.createdAt),
  };
}

type UiApp = ReturnType<typeof mapApp>;

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case "pending":
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">En attente</Badge>;
    case "reviewing":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">En examen</Badge>;
    case "approved":
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Approuvé</Badge>;
    case "rejected":
      return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none">Rejeté</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

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
  const [activeTab, setActiveTab] = useState("all");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectCauses, setRejectCauses] = useState<string[]>([]);
  const [rejectNote, setRejectNote] = useState("");
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const rows = await api<ApiApplication[]>("/applications", { auth: true });
      return rows.map(mapApp);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ dbId, status, reason }: { dbId: string; status: string; reason?: string }) =>
      api(`/applications/${dbId}`, { method: "PATCH", auth: true, body: { status, reason } }),
    onSuccess: (updated: any, vars) => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setSelectedApp((prev) =>
        prev
          ? {
              ...prev,
              status: vars.status.toLowerCase(),
              decisionReason: updated?.decisionReason ?? prev.decisionReason,
              decidedAt: updated?.decidedAt ?? prev.decidedAt,
              decidedBy: updated?.decidedBy ?? prev.decidedBy,
            }
          : prev,
      );
      const labels: Record<string, string> = {
        APPROVED: "Demande approuvée — le demandeur a été notifié.",
        REJECTED: "Demande rejetée — le motif a été transmis au demandeur.",
        REVIEWING: "Demande mise en examen.",
        PENDING: "Demande remise en attente.",
      };
      toast.success(labels[vars.status] || "Statut mis à jour.");
    },
    onError: (e: any) => toast.error(e?.message || "Échec de la mise à jour."),
  });

  const openReject = () => {
    setRejectCauses([]);
    setRejectNote("");
    setRejectOpen(true);
  };

  const toggleCause = (cause: string) =>
    setRejectCauses((prev) => (prev.includes(cause) ? prev.filter((c) => c !== cause) : [...prev, cause]));

  const confirmReject = () => {
    if (!selectedApp) return;
    const reason = [...rejectCauses, rejectNote.trim()].filter(Boolean).join(" — ");
    if (reason.length < 3) {
      toast.error("Sélectionnez au moins une cause ou précisez le motif.");
      return;
    }
    statusMutation.mutate(
      { dbId: selectedApp.dbId, status: "REJECTED", reason },
      { onSuccess: () => setRejectOpen(false) },
    );
  };

  const setStatus = (status: string) => {
    if (!selectedApp) return;
    statusMutation.mutate({ dbId: selectedApp.dbId, status });
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(search.toLowerCase()) || app.id.toLowerCase().includes(search.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && app.status === activeTab;
  });

  const STATUS_FR: Record<string, string> = {
    pending: "En attente",
    reviewing: "En examen",
    approved: "Approuvé",
    rejected: "Rejeté",
  };

  // Export CSV des demandes affichées (respecte l'onglet et la recherche en cours).
  const exportCsv = () => {
    if (filteredApps.length === 0) {
      toast.error("Aucune demande à exporter.");
      return;
    }
    const headers = [
      "Référence", "Catégorie", "Type", "Nom", "Matricule", "Email", "Téléphone",
      "Statut", "Motif décision", "Décidé par", "Date décision", "Date réception",
    ];
    const esc = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = filteredApps.map((a) => [
      a.id, a.category, a.type, a.name, a.matricule, a.email, a.phone,
      STATUS_FR[a.status] || a.status, a.decisionReason || "", a.decidedBy || "",
      fmtDateTime(a.decidedAt), fmtDateTime(a.createdAt),
    ]);
    // Séparateur « ; » + BOM UTF-8 → Excel FR ouvre proprement les accents.
    const csv = "﻿" + [headers, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `demandes-ma2e-${activeTab}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredApps.length} demande(s) exportée(s).`);
  };

  const documents: { name: string; path: string }[] = Array.isArray((selectedApp?.data as any)?.documents)
    ? (selectedApp!.data as any).documents
    : [];
  const dataEntries = selectedApp
    ? Object.entries(selectedApp.data).filter(([k, v]) => k !== "documents" && v !== "" && v != null)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary-dark">Gestion des Demandes</h2>
          <p className="text-muted-foreground">Suivez et traitez les formulaires reçus via le site.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv} className="rounded-full gap-2">
            <Download className="h-4 w-4" /> Exporter (CSV)
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-secondary/40 p-1 rounded-xl mb-4 flex-wrap h-auto">
              <TabsTrigger value="all" className="rounded-lg">Toutes</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-lg">En attente</TabsTrigger>
              <TabsTrigger value="reviewing" className="rounded-lg">En examen</TabsTrigger>
              <TabsTrigger value="approved" className="rounded-lg">Approuvées</TabsTrigger>
              <TabsTrigger value="rejected" className="rounded-lg">Rejetées</TabsTrigger>
            </TabsList>

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
                          <StatusBadge status={app.status} />
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
          </Tabs>
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
                <div className="flex items-center gap-3">
                  <StatusBadge status={selectedApp.status} />
                  {selectedApp.priority === "high" && (
                    <Badge variant="destructive" className="text-[10px] animate-pulse">Priorité Haute</Badge>
                  )}
                </div>
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

                  {/* Décision rendue */}
                  {(selectedApp.status === "approved" || selectedApp.status === "rejected") && (
                    <div
                      className={cn(
                        "pt-6 border-t space-y-2",
                      )}
                    >
                      <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Décision</div>
                      <div
                        className={cn(
                          "rounded-xl p-4 text-sm border",
                          selectedApp.status === "approved"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : "bg-rose-50 border-rose-200 text-rose-800",
                        )}
                      >
                        <div className="font-bold flex items-center gap-2">
                          {selectedApp.status === "approved" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          {selectedApp.status === "approved" ? "Demande approuvée" : "Demande rejetée"}
                        </div>
                        {selectedApp.decisionReason && (
                          <p className="mt-1.5 leading-relaxed">
                            <span className="font-semibold">{selectedApp.status === "approved" ? "Note : " : "Motif : "}</span>
                            {selectedApp.decisionReason}
                          </p>
                        )}
                        <p className="mt-2 text-[11px] opacity-70">
                          {selectedApp.decidedBy ? `Par ${selectedApp.decidedBy} · ` : ""}
                          {fmtDateTime(selectedApp.decidedAt)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Traitement du dossier */}
                  <div className="pt-6 border-t space-y-4">
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Traitement du dossier</div>
                    {selectedApp.category === "Adhésion" && (
                      <Button
                        onClick={() => { void generateAdhesionPdf(selectedApp).catch(() => toast.error("Échec de la génération du PDF.")); }}
                        className="w-full rounded-xl h-11 gap-2 bg-primary hover:bg-primary-dark text-white"
                      >
                        <Download className="h-4 w-4" /> Télécharger le formulaire (PDF)
                      </Button>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        disabled={statusMutation.isPending || selectedApp.status === "approved"}
                        onClick={() => setStatus("APPROVED")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 shadow-lg shadow-emerald-600/10"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Approuver
                      </Button>
                      <Button
                        variant="outline"
                        disabled={statusMutation.isPending || selectedApp.status === "rejected"}
                        onClick={openReject}
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl h-12"
                      >
                        <XCircle className="h-4 w-4 mr-2" /> Rejeter
                      </Button>
                    </div>
                    {selectedApp.status !== "reviewing" && selectedApp.status !== "approved" && selectedApp.status !== "rejected" && (
                      <Button
                        variant="secondary"
                        disabled={statusMutation.isPending}
                        onClick={() => setStatus("REVIEWING")}
                        className="w-full rounded-xl h-11 gap-2 text-xs font-bold"
                      >
                        <Eye className="h-4 w-4" /> Mettre en examen
                      </Button>
                    )}
                    {(selectedApp.status === "approved" || selectedApp.status === "rejected") && (
                      <Button
                        variant="ghost"
                        disabled={statusMutation.isPending}
                        onClick={() => setStatus("PENDING")}
                        className="w-full rounded-xl h-10 gap-2 text-xs font-bold text-muted-foreground"
                      >
                        <Clock className="h-4 w-4" /> Rouvrir le dossier
                      </Button>
                    )}
                    <div className="grid grid-cols-1 gap-2">
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
                      {selectedApp.decidedAt && (
                        <div className="flex gap-3 text-xs relative z-10">
                          <div
                            className={cn(
                              "h-4 w-4 rounded-full flex items-center justify-center ring-4 ring-card",
                              selectedApp.status === "approved" ? "bg-emerald-500" : "bg-rose-500",
                            )}
                          >
                            {selectedApp.status === "approved" ? (
                              <CheckCircle2 className="h-2 w-2 text-white" />
                            ) : (
                              <XCircle className="h-2 w-2 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold">
                              {selectedApp.status === "approved" ? "Dossier validé" : "Dossier rejeté"}
                            </div>
                            <p className="text-muted-foreground text-[10px]">
                              {fmtDateTime(selectedApp.decidedAt)}
                              {selectedApp.decidedBy ? ` · ${selectedApp.decidedBy}` : ""}
                            </p>
                          </div>
                        </div>
                      )}
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
                Consultez les détails, l'historique et gérez le statut des dossiers reçus.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Boîte de dialogue — refus motivé */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" /> Motiver le refus
            </DialogTitle>
            <DialogDescription>
              Le motif sera enregistré et transmis au demandeur{selectedApp?.email ? ` (${selectedApp.email})` : ""}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              {REJECT_CAUSES.map((cause) => (
                <label key={cause} className="flex items-start gap-3 text-sm cursor-pointer rounded-lg p-2 hover:bg-secondary/40">
                  <Checkbox
                    checked={rejectCauses.includes(cause)}
                    onCheckedChange={() => toggleCause(cause)}
                    className="mt-0.5"
                  />
                  <span>{cause}</span>
                </label>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reject-note" className="text-xs font-bold uppercase text-muted-foreground tracking-widest">
                Précisions (optionnel)
              </Label>
              <Textarea
                id="reject-note"
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Détaillez le motif ou les pièces à fournir…"
                className="resize-none"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="rounded-full">
              Annuler
            </Button>
            <Button
              onClick={confirmReject}
              disabled={statusMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-full"
            >
              <XCircle className="h-4 w-4 mr-2" /> Confirmer le refus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
