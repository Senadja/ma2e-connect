import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, apiDownload } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Scale, Search, Download, Trash2, Edit2, Clock, AlertTriangle, FileJson } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Back-office « Droits des personnes » — mécanismes exigés par SD_PDCP :
// DEV-10 (accès, rectification, effacement, portabilité) et DEV-09 (conservation/purge).
// Réservé aux administrateurs côté serveur (routes/dcp.ts) ; le lien n'apparaît dans le
// menu que pour eux.

interface AppRow {
  id: string;
  appId: string;
  category: string;
  type: string;
  name: string;
  matricule: string;
  email: string;
  phone: string;
  status: string;
  consentAt: string | null;
  consentVersion: string | null;
  anonymizedAt: string | null;
  createdAt: string;
  data: Record<string, unknown>;
}
interface ContactRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  consentAt: string | null;
  consentVersion: string | null;
  createdAt: string;
}
interface AccountRow { id: string; email: string; name: string; role: string; createdAt: string }
interface Dossier {
  query: string;
  generatedAt: string;
  applications: AppRow[];
  contactMessages: ContactRow[];
  accounts: AccountRow[];
}
interface Retention {
  retention: { applicationsMonths: number | null; contactMonths: number | null; auditMonths: number | null; autoPurge: boolean };
  configured: boolean;
  due: { applications: number; contactMessages: number; auditLogs: number };
  cutoffs: { applications: string | null; contactMessages: string | null; auditLogs: string | null };
}
interface DcpActionRow {
  id: string;
  kind: string;
  subject: string;
  actorEmail: string;
  details: Record<string, unknown>;
  createdAt: string;
}

const KIND_LABEL: Record<string, string> = {
  access: "Accès",
  portability: "Portabilité",
  rectification: "Rectification",
  erasure: "Effacement",
  purge: "Purge",
};
const KIND_COLOR: Record<string, string> = {
  access: "bg-blue-100 text-blue-700",
  portability: "bg-indigo-100 text-indigo-700",
  rectification: "bg-amber-100 text-amber-700",
  erasure: "bg-rose-100 text-rose-700",
  purge: "bg-slate-200 text-slate-700",
};

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "—";

type RectifyTarget =
  | { source: "application"; id: string; name: string; email: string; phone: string; matricule: string }
  | { source: "contact"; id: string; name: string; email: string; phone: string };

export const DcpManager = () => {
  const queryClient = useQueryClient();
  const [term, setTerm] = useState("");
  const [query, setQuery] = useState("");
  const [selApps, setSelApps] = useState<string[]>([]);
  const [selContacts, setSelContacts] = useState<string[]>([]);
  const [eraseOpen, setEraseOpen] = useState(false);
  const [eraseMode, setEraseMode] = useState<"anonymize" | "delete">("anonymize");
  const [notify, setNotify] = useState(true);
  const [reason, setReason] = useState("");
  const [rectify, setRectify] = useState<RectifyTarget | null>(null);
  const [purgeOpen, setPurgeOpen] = useState(false);

  // Chaque lecture de ce dossier est consignée au registre DCP (c'est une consultation de
  // données personnelles). On désactive donc le rafraîchissement automatique au retour sur
  // la fenêtre : sans cela, un simple changement d'onglet créerait une entrée de plus.
  const { data: dossier, isFetching } = useQuery({
    queryKey: ["dcp", "subject", query],
    queryFn: () => api<Dossier>(`/dcp/subject?q=${encodeURIComponent(query)}`, { auth: true }),
    enabled: query.length >= 2,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
  const { data: retention } = useQuery({
    queryKey: ["dcp", "retention"],
    queryFn: () => api<Retention>("/dcp/retention", { auth: true }),
  });
  const { data: actions = [] } = useQuery({
    queryKey: ["dcp", "actions"],
    queryFn: () => api<DcpActionRow[]>("/dcp/actions", { auth: true }),
  });

  // Durées de conservation : état local du formulaire, initialisé à la première lecture.
  const [form, setForm] = useState<{ applications: string; contact: string; audit: string; autoPurge: boolean } | null>(null);
  const r = retention?.retention;
  const current =
    form ??
    (r
      ? {
          applications: r.applicationsMonths?.toString() ?? "",
          contact: r.contactMonths?.toString() ?? "",
          audit: r.auditMonths?.toString() ?? "",
          autoPurge: r.autoPurge,
        }
      : { applications: "", contact: "", audit: "", autoPurge: false });

  const refreshDossier = () => queryClient.invalidateQueries({ queryKey: ["dcp"] });

  const search = () => {
    setSelApps([]);
    setSelContacts([]);
    setQuery(term.trim());
  };

  const exportCsv = async () => {
    try {
      await apiDownload(`/dcp/subject.csv?q=${encodeURIComponent(query)}`, `dcp-${query}.csv`);
      toast.success("Export CSV téléchargé");
      // Seul le registre change : ne pas relire le dossier (ce serait un accès de plus).
      queryClient.invalidateQueries({ queryKey: ["dcp", "actions"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const exportJson = () => {
    if (!dossier) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `dcp-${query}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Dossier JSON téléchargé");
  };

  const eraseMutation = useMutation({
    mutationFn: () => {
      // Adresse de confirmation : prise sur un enregistrement sélectionné, avant effacement.
      const app = dossier?.applications.find((a) => selApps.includes(a.id) && a.email);
      const msg = dossier?.contactMessages.find((m) => selContacts.includes(m.id) && m.email);
      const notifyEmail = app?.email || msg?.email || "";
      return api("/dcp/erase", {
        method: "POST",
        auth: true,
        body: {
          subject: query,
          applicationIds: selApps,
          contactIds: selContacts,
          mode: eraseMode,
          notify: notify && Boolean(notifyEmail),
          notifyEmail: notifyEmail || undefined,
          notifyName: app?.name || msg?.name || undefined,
          reason: reason.trim() || undefined,
        },
      });
    },
    onSuccess: () => {
      toast.success("Effacement exécuté et consigné au registre DCP");
      setEraseOpen(false);
      setReason("");
      setSelApps([]);
      setSelContacts([]);
      refreshDossier();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rectifyMutation = useMutation({
    mutationFn: (t: RectifyTarget) =>
      api(`/dcp/${t.source}/${t.id}`, {
        method: "PATCH",
        auth: true,
        body:
          t.source === "application"
            ? { name: t.name, email: t.email, phone: t.phone, matricule: t.matricule }
            : { name: t.name, email: t.email, phone: t.phone },
      }),
    onSuccess: () => {
      toast.success("Données rectifiées");
      setRectify(null);
      refreshDossier();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const retentionMutation = useMutation({
    mutationFn: () =>
      api<Retention>("/dcp/retention", {
        method: "PUT",
        auth: true,
        body: {
          applicationsMonths: current.applications ? Number(current.applications) : null,
          contactMonths: current.contact ? Number(current.contact) : null,
          auditMonths: current.audit ? Number(current.audit) : null,
          autoPurge: current.autoPurge,
        },
      }),
    onSuccess: () => {
      toast.success("Durées de conservation enregistrées");
      setForm(null);
      queryClient.invalidateQueries({ queryKey: ["dcp", "retention"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const purgeMutation = useMutation({
    mutationFn: () => api<{ applications: number; contactMessages: number; auditLogs: number; documents: number }>("/dcp/purge", { method: "POST", auth: true }),
    onSuccess: (res) => {
      toast.success(
        `Purge exécutée : ${res.applications} demande(s) anonymisée(s), ${res.contactMessages} message(s) et ${res.auditLogs} entrée(s) supprimés.`
      );
      setPurgeOpen(false);
      refreshDossier();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const selectionCount = selApps.length + selContacts.length;
  const totalDue = retention ? retention.due.applications + retention.due.contactMessages + retention.due.auditLogs : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-display font-bold text-primary-dark flex items-center gap-3">
          <Scale className="h-7 w-7 text-primary" /> Droits des personnes
        </h2>
        <p className="text-muted-foreground">
          Accès, rectification, effacement et portabilité des données personnelles — et purge de fin de conservation.
          Chaque opération est consignée au registre ci-dessous.
        </p>
      </div>

      {/* --- Recherche d'une personne ------------------------------------------------ */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" /> Rechercher une personne
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="E-mail, nom, téléphone, matricule ou référence de demande"
            />
            <Button onClick={search} disabled={term.trim().length < 2}>
              Rechercher
            </Button>
          </div>

          {query.length >= 2 && (
            <p className="text-xs text-muted-foreground">
              {isFetching
                ? "Recherche…"
                : dossier
                  ? `${dossier.applications.length} demande(s), ${dossier.contactMessages.length} message(s) de contact, ${dossier.accounts.length} compte(s) back-office.`
                  : ""}
            </p>
          )}

          {dossier && (dossier.applications.length > 0 || dossier.contactMessages.length > 0) && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button variant="outline" size="sm" onClick={exportJson}>
                <FileJson className="h-4 w-4 mr-2" /> Dossier JSON
              </Button>
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="h-4 w-4 mr-2" /> Dossier CSV
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={selectionCount === 0}
                onClick={() => setEraseOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" /> Effacer la sélection ({selectionCount})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Demandes --------------------------------------------------------------- */}
      {dossier && dossier.applications.length > 0 && (
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Demandes ({dossier.applications.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/40">
            {dossier.applications.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-4 hover:bg-secondary/10">
                <Checkbox
                  className="mt-1"
                  checked={selApps.includes(a.id)}
                  onCheckedChange={(v) =>
                    setSelApps((prev) => (v ? [...prev, a.id] : prev.filter((x) => x !== a.id)))
                  }
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold">{a.appId}</span>
                    <Badge variant="outline" className="text-[10px]">{a.category} — {a.type}</Badge>
                    {a.anonymizedAt && (
                      <Badge className="bg-slate-200 text-slate-700 border-none text-[10px]">
                        Anonymisée le {fmt(a.anonymizedAt)}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm font-semibold mt-1">{a.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.email || "—"} · {a.phone} · matricule {a.matricule}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Reçue le {fmt(a.createdAt)} · consentement {a.consentAt ? `${fmt(a.consentAt)} (${a.consentVersion})` : "non enregistré"}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={Boolean(a.anonymizedAt)}
                  onClick={() =>
                    setRectify({
                      source: "application",
                      id: a.id,
                      name: a.name,
                      email: a.email,
                      phone: a.phone,
                      matricule: a.matricule,
                    })
                  }
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* --- Messages de contact ---------------------------------------------------- */}
      {dossier && dossier.contactMessages.length > 0 && (
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Messages de contact ({dossier.contactMessages.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/40">
            {dossier.contactMessages.map((m) => (
              <div key={m.id} className="flex items-start gap-3 p-4 hover:bg-secondary/10">
                <Checkbox
                  className="mt-1"
                  checked={selContacts.includes(m.id)}
                  onCheckedChange={(v) =>
                    setSelContacts((prev) => (v ? [...prev, m.id] : prev.filter((x) => x !== m.id)))
                  }
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{m.name} <span className="font-normal text-muted-foreground">— {m.subject || "sans objet"}</span></div>
                  <div className="text-xs text-muted-foreground">{m.email} · {m.phone || "—"}</div>
                  <p className="text-xs mt-1 line-clamp-2 text-muted-foreground italic">{m.message}</p>
                  <div className="text-xs text-muted-foreground mt-1">
                    Reçu le {fmt(m.createdAt)} · consentement {m.consentAt ? `${fmt(m.consentAt)} (${m.consentVersion})` : "non enregistré"}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRectify({ source: "contact", id: m.id, name: m.name, email: m.email, phone: m.phone || "" })}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* --- Comptes back-office (lecture seule) ------------------------------------ */}
      {dossier && dossier.accounts.length > 0 && (
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-4 space-y-2">
            <p className="text-sm font-semibold">Compte(s) back-office correspondant(s)</p>
            {dossier.accounts.map((u) => (
              <div key={u.id} className="text-xs text-muted-foreground">
                {u.name} · {u.email} · {u.role} · créé le {fmt(u.createdAt)}
              </div>
            ))}
            <p className="text-xs text-muted-foreground italic">
              Listés pour l'exhaustivité du dossier. La suppression d'un compte se fait dans « Utilisateurs ».
            </p>
          </CardContent>
        </Card>
      )}

      {/* --- Conservation et purge --------------------------------------------------- */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" /> Conservation et purge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!retention?.configured && (
            <div className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                Aucune durée de conservation n'est définie : <strong>la purge est inopérante</strong>. Renseignez les
                durées validées par MA2E pour l'activer.
              </p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Demandes (mois)</Label>
              <Input
                type="number"
                min={1}
                value={current.applications}
                onChange={(e) => setForm({ ...current, applications: e.target.value })}
                placeholder="non définie"
              />
              <p className="text-[11px] text-muted-foreground">Anonymisation (la ligne reste pour les statistiques)</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Messages de contact (mois)</Label>
              <Input
                type="number"
                min={1}
                value={current.contact}
                onChange={(e) => setForm({ ...current, contact: e.target.value })}
                placeholder="non définie"
              />
              <p className="text-[11px] text-muted-foreground">Suppression définitive</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Journal d'activité (mois)</Label>
              <Input
                type="number"
                min={1}
                value={current.audit}
                onChange={(e) => setForm({ ...current, audit: e.target.value })}
                placeholder="non définie"
              />
              <p className="text-[11px] text-muted-foreground">Suppression définitive</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-secondary/20">
            <div>
              <p className="text-sm font-semibold">Purge automatique quotidienne</p>
              <p className="text-xs text-muted-foreground">
                Désactivée, le mécanisme reste disponible manuellement. À n'activer qu'une fois les durées validées.
              </p>
            </div>
            <Switch
              checked={current.autoPurge}
              onCheckedChange={(v) => setForm({ ...current, autoPurge: v })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => retentionMutation.mutate()} disabled={retentionMutation.isPending}>
              Enregistrer les durées
            </Button>
            <Button
              variant="destructive"
              disabled={!retention?.configured || totalDue === 0}
              onClick={() => setPurgeOpen(true)}
            >
              Lancer la purge maintenant
            </Button>
            {retention?.configured && (
              <span className="text-xs text-muted-foreground">
                En fin de conservation : {retention.due.applications} demande(s), {retention.due.contactMessages} message(s),{" "}
                {retention.due.auditLogs} entrée(s) de journal.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* --- Registre des opérations ------------------------------------------------- */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Registre des opérations DCP</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/40">
          {actions.length === 0 && (
            <div className="p-8 text-center text-muted-foreground italic text-sm">Aucune opération enregistrée.</div>
          )}
          {actions.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 p-3">
              <div className="flex items-center gap-3 min-w-0">
                <Badge className={cn("border-none text-[10px] w-24 justify-center", KIND_COLOR[a.kind] || "bg-secondary")}>
                  {KIND_LABEL[a.kind] || a.kind}
                </Badge>
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{a.subject}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {a.actorEmail} · {JSON.stringify(a.details)}
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0">{fmt(a.createdAt)}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* --- Dialogue d'effacement --------------------------------------------------- */}
      <AlertDialog open={eraseOpen} onOpenChange={setEraseOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Effacer {selectionCount} enregistrement(s) ?</AlertDialogTitle>
            <AlertDialogDescription>
              Opération irréversible. Les pièces justificatives (pièces d'identité, photos) sont effacées du serveur
              dans les deux modes.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <RadioGroup value={eraseMode} onValueChange={(v) => setEraseMode(v as "anonymize" | "delete")}>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="anonymize" id="mode-anon" className="mt-1" />
                <Label htmlFor="mode-anon" className="font-normal">
                  <span className="font-semibold">Anonymiser</span> — retire l'identité et les pièces, conserve la ligne
                  (les statistiques d'adhésion restent justes).
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <RadioGroupItem value="delete" id="mode-del" className="mt-1" />
                <Label htmlFor="mode-del" className="font-normal">
                  <span className="font-semibold">Supprimer</span> — efface entièrement les enregistrements.
                </Label>
              </div>
            </RadioGroup>

            <p className="text-xs text-muted-foreground">
              Les messages de contact sélectionnés sont toujours supprimés : anonymisés, il ne resterait qu'un texte
              libre sans valeur.
            </p>

            <div className="flex items-center gap-2">
              <Checkbox id="notify" checked={notify} onCheckedChange={(v) => setNotify(Boolean(v))} />
              <Label htmlFor="notify" className="font-normal text-sm">
                Confirmer l'exécution à la personne concernée par e-mail
              </Label>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Motif / référence de la demande (facultatif, consigné au registre)</Label>
              <Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={eraseMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                eraseMutation.mutate();
              }}
            >
              {eraseMutation.isPending ? "Effacement…" : "Effacer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Dialogue de purge ------------------------------------------------------- */}
      <AlertDialog open={purgeOpen} onOpenChange={setPurgeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lancer la purge de fin de conservation ?</AlertDialogTitle>
            <AlertDialogDescription>
              {retention && (
                <>
                  {retention.due.applications} demande(s) seront anonymisées, {retention.due.contactMessages} message(s)
                  de contact et {retention.due.auditLogs} entrée(s) de journal seront supprimés. Opération irréversible,
                  consignée au registre.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={purgeMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                purgeMutation.mutate();
              }}
            >
              {purgeMutation.isPending ? "Purge…" : "Purger"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Dialogue de rectification ----------------------------------------------- */}
      <Dialog open={Boolean(rectify)} onOpenChange={(o) => !o && setRectify(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rectifier les données</DialogTitle>
          </DialogHeader>
          {rectify && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Nom</Label>
                <Input value={rectify.name} onChange={(e) => setRectify({ ...rectify, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">E-mail</Label>
                <Input value={rectify.email} onChange={(e) => setRectify({ ...rectify, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Téléphone</Label>
                <Input value={rectify.phone} onChange={(e) => setRectify({ ...rectify, phone: e.target.value })} />
              </div>
              {rectify.source === "application" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Matricule</Label>
                  <Input
                    value={rectify.matricule}
                    onChange={(e) => setRectify({ ...rectify, matricule: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRectify(null)}>
              Annuler
            </Button>
            <Button
              disabled={rectifyMutation.isPending}
              onClick={() => rectify && rectifyMutation.mutate(rectify)}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DcpManager;
