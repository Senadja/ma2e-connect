import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, MapPin, Share2, Save, BarChart3, Server, Network, Plus, Trash2, MessageCircle, Users } from "lucide-react";
import { toast } from "sonner";

interface StatItem { value: number; label: string; suffix: string }
interface OrgChart { level1Name: string; level2Name: string; departments: string[] }
interface OrgUnit { name: string; note: string }
interface Settings {
  flashBanner?: { enabled: boolean; text: string; link: string };
  contact?: { address: string; phone: string; email: string };
  social?: { facebook: string; linkedin: string; twitter: string };
  stats?: StatItem[];
  orgChart?: OrgChart;
  orgUnits?: OrgUnit[];
  whatsapp?: { enabled: boolean; phone: string; message: string };
  chatbot?: { enabled: boolean; url: string };
}

// Pages du site proposées pour le lien du bandeau (évite de taper une URL à la main).
const PAGE_LINKS = [
  { label: "Aucun lien", value: "" },
  { label: "Accueil", value: "/" },
  { label: "Adhésion", value: "/adhesion" },
  { label: "À propos", value: "/a-propos" },
  { label: "Produits", value: "/produits" },
  { label: "Épargne", value: "/produits/epargne" },
  { label: "Crédits", value: "/produits/credits" },
  { label: "Immobilier", value: "/produits/immobilier" },
  { label: "Actualités", value: "/actualites" },
  { label: "FAQ", value: "/faq" },
  { label: "Médiathèque", value: "/mediatheque" },
  { label: "Partenaires", value: "/partenaires" },
  { label: "Contact", value: "/contact" },
  { label: "Espace E-MA2E", value: "/espace-ema2e" },
  { label: "Autre (URL personnalisée)…", value: "__custom__" },
];
const KNOWN_LINKS = PAGE_LINKS.map((p) => p.value).filter((v) => v && v !== "__custom__");

const DEFAULT_STATS: StatItem[] = [
  { value: 7335, label: "Adhérents", suffix: "" },
  { value: 9, label: "Produits", suffix: "" },
  { value: 14, label: "Années d'activités", suffix: "" },
  { value: 2.4, label: "Mds FCFA de crédits", suffix: "" },
];

const DEFAULT_ORG: OrgChart = {
  level1Name: "Conseil d'Administration (PCA)",
  level2Name: "Direction Générale",
  departments: ["Opérations", "Finances", "Crédit & Risque"],
};

const DEFAULT_ORG_UNITS: OrgUnit[] = [
  { name: "Conseil d'Administration", note: "Président · 2 vice-présidents · 13 administrateurs" },
  { name: "Comité de Crédit", note: "Président · 1 vice-président · 1 secrétaire · 10 membres" },
  { name: "Conseil de Surveillance", note: "Président · 1 vice-président · 1 secrétaire · 6 membres" },
  { name: "Comité Éthique et Déontologie", note: "Président · 2 membres" },
];

export const SettingsManager = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => api<Settings>("/settings") });

  const [flash, setFlash] = useState({ enabled: true, text: "", link: "" });
  const [contact, setContact] = useState({ address: "", phone: "", email: "" });
  const [social, setSocial] = useState({ facebook: "", linkedin: "", twitter: "" });
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);
  const [org, setOrg] = useState<OrgChart>(DEFAULT_ORG);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>(DEFAULT_ORG_UNITS);
  const [whatsapp, setWhatsapp] = useState({ enabled: false, phone: "", message: "" });
  const [chatbot, setChatbot] = useState({ enabled: false, url: "" });
  const [smtp, setSmtp] = useState({ enabled: false, host: "", port: 587, user: "", pass: "", secure: false, from: "", to: "" });

  // SMTP : lu via l'endpoint sécurisé (contient un mot de passe, jamais exposé publiquement).
  const { data: smtpData } = useQuery({
    queryKey: ["settings", "smtp"],
    queryFn: () => api<typeof smtp | null>("/settings/secure/smtp", { auth: true }),
  });
  useEffect(() => {
    if (smtpData) setSmtp((s) => ({ ...s, ...smtpData }));
  }, [smtpData]);

  useEffect(() => {
    if (!data) return;
    if (data.flashBanner) setFlash({ enabled: !!data.flashBanner.enabled, text: data.flashBanner.text || "", link: data.flashBanner.link || "" });
    if (data.contact) setContact({ address: data.contact.address || "", phone: data.contact.phone || "", email: data.contact.email || "" });
    if (data.social) setSocial({ facebook: data.social.facebook || "", linkedin: data.social.linkedin || "", twitter: data.social.twitter || "" });
    if (Array.isArray(data.stats) && data.stats.length) setStats(data.stats);
    if (data.orgChart) setOrg({
      level1Name: data.orgChart.level1Name || DEFAULT_ORG.level1Name,
      level2Name: data.orgChart.level2Name || DEFAULT_ORG.level2Name,
      departments: Array.isArray(data.orgChart.departments) && data.orgChart.departments.length ? data.orgChart.departments : DEFAULT_ORG.departments,
    });
    if (Array.isArray(data.orgUnits) && data.orgUnits.length) setOrgUnits(data.orgUnits.map((u) => ({ name: u.name || "", note: u.note || "" })));
    if (data.whatsapp) setWhatsapp({ enabled: !!data.whatsapp.enabled, phone: data.whatsapp.phone || "", message: data.whatsapp.message || "" });
    if (data.chatbot) setChatbot({ enabled: !!data.chatbot.enabled, url: data.chatbot.url || "" });
  }, [data]);

  const updateDept = (i: number, val: string) =>
    setOrg((o) => ({ ...o, departments: o.departments.map((d, idx) => (idx === i ? val : d)) }));
  const addDept = () => setOrg((o) => ({ ...o, departments: [...o.departments, ""] }));
  const removeDept = (i: number) => setOrg((o) => ({ ...o, departments: o.departments.filter((_, idx) => idx !== i) }));
  const saveOrg = () => {
    const cleaned = { ...org, departments: org.departments.map((d) => d.trim()).filter(Boolean) };
    if (!cleaned.level1Name.trim() || !cleaned.level2Name.trim() || cleaned.departments.length === 0) {
      toast.error("Renseignez les deux organes et au moins une direction.");
      return;
    }
    save.mutate({ key: "orgChart", value: cleaned });
  };

  const updateUnit = (i: number, field: keyof OrgUnit, val: string) =>
    setOrgUnits((u) => u.map((it, idx) => (idx === i ? { ...it, [field]: val } : it)));
  const addUnit = () => setOrgUnits((u) => [...u, { name: "", note: "" }]);
  const removeUnit = (i: number) => setOrgUnits((u) => u.filter((_, idx) => idx !== i));
  const saveUnits = () => {
    const cleaned = orgUnits.map((u) => ({ name: u.name.trim(), note: u.note.trim() })).filter((u) => u.name);
    save.mutate({ key: "orgUnits", value: cleaned });
  };

  const linkSelectValue = !flash.link ? "" : KNOWN_LINKS.includes(flash.link) ? flash.link : "__custom__";
  const updateStat = (i: number, field: keyof StatItem, val: string) =>
    setStats((s) => s.map((it, idx) => (idx === i ? { ...it, [field]: field === "value" ? Number(val) || 0 : val } : it)));

  const save = useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      api(`/settings/${key}`, { method: "PUT", auth: true, body: { value } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["settings"] }); toast.success("Réglages enregistrés."); },
    onError: (e: any) => toast.error(e?.message || "Enregistrement impossible."),
  });

  const label = "text-xs font-bold text-muted-foreground uppercase";

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h2 className="text-3xl font-display font-bold text-primary-dark">Paramètres du site</h2>
        <p className="text-muted-foreground">Modifiez les éléments globaux sans toucher au code.</p>
      </div>

      {/* Bandeau Flash */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> Bandeau d'information</CardTitle>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input type="checkbox" checked={flash.enabled} onChange={(e) => setFlash({ ...flash, enabled: e.target.checked })} className="h-4 w-4 accent-primary" />
            Affiché
          </label>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><label className={label}>Texte</label>
            <Input value={flash.text} onChange={(e) => setFlash({ ...flash, text: e.target.value })} placeholder="Message du bandeau…" /></div>
          <div className="grid gap-2">
            <label className={label}>Lien au clic (optionnel)</label>
            <select
              value={linkSelectValue}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "__custom__") setFlash({ ...flash, link: KNOWN_LINKS.includes(flash.link) || !flash.link ? "https://" : flash.link });
                else setFlash({ ...flash, link: v });
              }}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {PAGE_LINKS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {linkSelectValue === "__custom__" && (
              <Input value={flash.link} onChange={(e) => setFlash({ ...flash, link: e.target.value })} placeholder="https://… ou /chemin" />
            )}
          </div>
          <Button onClick={() => save.mutate({ key: "flashBanner", value: flash })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer le bandeau</Button>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Coordonnées</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><label className={label}>Adresse</label>
            <Input value={contact.address} onChange={(e) => setContact({ ...contact, address: e.target.value })} /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><label className={label}>Téléphone</label>
              <Input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} /></div>
            <div className="grid gap-2"><label className={label}>Email</label>
              <Input value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></div>
          </div>
          <Button onClick={() => save.mutate({ key: "contact", value: contact })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer les coordonnées</Button>
        </CardContent>
      </Card>

      {/* Réseaux sociaux */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" /> Réseaux sociaux</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2"><label className={label}>Facebook</label>
            <Input value={social.facebook} onChange={(e) => setSocial({ ...social, facebook: e.target.value })} placeholder="https://facebook.com/…" /></div>
          <div className="grid gap-2"><label className={label}>LinkedIn</label>
            <Input value={social.linkedin} onChange={(e) => setSocial({ ...social, linkedin: e.target.value })} placeholder="https://linkedin.com/…" /></div>
          <div className="grid gap-2"><label className={label}>X (Twitter)</label>
            <Input value={social.twitter} onChange={(e) => setSocial({ ...social, twitter: e.target.value })} placeholder="https://x.com/…" /></div>
          <Button onClick={() => save.mutate({ key: "social", value: social })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer les réseaux</Button>
        </CardContent>
      </Card>

      {/* Chiffres clés (page d'accueil) */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Chiffres clés (accueil)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {stats.map((s, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-3 grid gap-1">
                <label className={label}>Valeur</label>
                <Input type="number" step="0.1" value={s.value} onChange={(e) => updateStat(i, "value", e.target.value)} />
              </div>
              <div className="col-span-6 grid gap-1">
                <label className={label}>Libellé</label>
                <Input value={s.label} onChange={(e) => updateStat(i, "label", e.target.value)} />
              </div>
              <div className="col-span-3 grid gap-1">
                <label className={label}>Suffixe</label>
                <Input value={s.suffix} onChange={(e) => updateStat(i, "suffix", e.target.value)} placeholder="+ , %…" />
              </div>
            </div>
          ))}
          <p className="text-[11px] text-muted-foreground">Ces 4 chiffres s'affichent sur la page d'accueil (bandeau de statistiques).</p>
          <Button onClick={() => save.mutate({ key: "stats", value: stats })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer les chiffres</Button>
        </CardContent>
      </Card>

      {/* Organigramme (page À propos) */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Network className="h-5 w-5 text-primary" /> Organigramme</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className={label}>Organe délibérant (niveau 1)</label>
              <Input value={org.level1Name} onChange={(e) => setOrg({ ...org, level1Name: e.target.value })} placeholder="Conseil d'Administration (PCA)" />
            </div>
            <div className="grid gap-2">
              <label className={label}>Organe exécutif (niveau 2)</label>
              <Input value={org.level2Name} onChange={(e) => setOrg({ ...org, level2Name: e.target.value })} placeholder="Direction Générale" />
            </div>
          </div>
          <div className="grid gap-2">
            <label className={label}>Directions opérationnelles</label>
            {org.departments.map((d, i) => (
              <div key={i} className="flex gap-2">
                <Input value={d} onChange={(e) => updateDept(i, e.target.value)} placeholder={`Direction ${i + 1}`} />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDept(i)}
                  disabled={org.departments.length <= 1}
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addDept} className="w-fit rounded-full gap-2 mt-1">
              <Plus className="h-4 w-4" /> Ajouter une direction
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">Affiché dans la section « Organisation » de la page À propos. Les libellés de rôle (« Organe délibérant »…) restent traduits automatiquement.</p>
          <Button onClick={saveOrg} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer l'organigramme</Button>
        </CardContent>
      </Card>

      {/* Organes & effectifs (page À propos) */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Organes & effectifs</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-[11px] text-muted-foreground">Organes affichés sur « À propos » (CA, CC, CS, CED…). Le texte « effectif » s'affiche à côté du titre ; les responsables avec photo se gèrent dans « Équipe &amp; gouvernance » (le nom de l'organe doit être identique des deux côtés).</p>
          {orgUnits.map((u, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-5 grid gap-1">
                <label className={label}>Organe</label>
                <Input value={u.name} onChange={(e) => updateUnit(i, "name", e.target.value)} placeholder="Conseil d'Administration" />
              </div>
              <div className="col-span-6 grid gap-1">
                <label className={label}>Effectif / composition</label>
                <Input value={u.note} onChange={(e) => updateUnit(i, "note", e.target.value)} placeholder="Président · 2 VP · 13 administrateurs" />
              </div>
              <div className="col-span-1 flex justify-center pb-1">
                <Button type="button" variant="ghost" size="icon" onClick={() => removeUnit(i)} disabled={orgUnits.length <= 1} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addUnit} className="w-fit rounded-full gap-2"><Plus className="h-4 w-4" /> Ajouter un organe</Button>
          <div><Button onClick={saveUnits} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer les organes</Button></div>
        </CardContent>
      </Card>

      {/* Contact rapide & Assistant (widget flottant) */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" /> Contact rapide &amp; Assistant</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 rounded-xl border border-border/50 p-4">
            <label className="flex items-center justify-between text-sm font-semibold cursor-pointer">
              <span>Bouton WhatsApp flottant</span>
              <input type="checkbox" checked={whatsapp.enabled} onChange={(e) => setWhatsapp({ ...whatsapp, enabled: e.target.checked })} className="h-4 w-4 accent-primary" />
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2"><label className={label}>Numéro (format international)</label>
                <Input value={whatsapp.phone} onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })} placeholder="2250787137512" /></div>
              <div className="grid gap-2"><label className={label}>Message pré-rempli</label>
                <Input value={whatsapp.message} onChange={(e) => setWhatsapp({ ...whatsapp, message: e.target.value })} placeholder="Bonjour AYA, je suis sociétaire MA2E." /></div>
            </div>
            <Button onClick={() => save.mutate({ key: "whatsapp", value: whatsapp })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer WhatsApp</Button>
          </div>
          <div className="space-y-3 rounded-xl border border-border/50 p-4">
            <label className="flex items-center justify-between text-sm font-semibold cursor-pointer">
              <span>Assistant / chatbot (bulle flottante)</span>
              <input type="checkbox" checked={chatbot.enabled} onChange={(e) => setChatbot({ ...chatbot, enabled: e.target.checked })} className="h-4 w-4 accent-primary" />
            </label>
            <div className="grid gap-2"><label className={label}>URL du chatbot (affichée en fenêtre intégrée)</label>
              <Input value={chatbot.url} onChange={(e) => setChatbot({ ...chatbot, url: e.target.value })} placeholder="https://…/chat" /></div>
            <p className="text-[11px] text-muted-foreground">La page doit autoriser l'intégration en iframe. Sinon, on basculera vers une reconstruction native.</p>
            <Button onClick={() => save.mutate({ key: "chatbot", value: chatbot })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer l'assistant</Button>
          </div>
        </CardContent>
      </Card>

      {/* Serveur SMTP (notifications e-mail) */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2"><Server className="h-5 w-5 text-primary" /> Serveur e-mail (SMTP)</CardTitle>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input type="checkbox" checked={smtp.enabled} onChange={(e) => setSmtp({ ...smtp, enabled: e.target.checked })} className="h-4 w-4 accent-primary" />
            Activé
          </label>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">Configurez l'envoi des e-mails de notification des demandes sans toucher au code. Désactivé : les e-mails sont seulement journalisés.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 grid gap-2"><label className={label}>Serveur (host)</label>
              <Input value={smtp.host} onChange={(e) => setSmtp({ ...smtp, host: e.target.value })} placeholder="smtp.exemple.com" /></div>
            <div className="grid gap-2"><label className={label}>Port</label>
              <Input type="number" value={smtp.port} onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) || 587 })} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><label className={label}>Utilisateur</label>
              <Input value={smtp.user} onChange={(e) => setSmtp({ ...smtp, user: e.target.value })} placeholder="user@exemple.com" /></div>
            <div className="grid gap-2"><label className={label}>Mot de passe</label>
              <Input type="password" value={smtp.pass} onChange={(e) => setSmtp({ ...smtp, pass: e.target.value })} placeholder="••••••••" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2"><label className={label}>Expéditeur (From)</label>
              <Input value={smtp.from} onChange={(e) => setSmtp({ ...smtp, from: e.target.value })} placeholder="MA2E <no-reply@ma2e.ci>" /></div>
            <div className="grid gap-2"><label className={label}>Destinataire des demandes</label>
              <Input value={smtp.to} onChange={(e) => setSmtp({ ...smtp, to: e.target.value })} placeholder="contact@ma2e.ci" /></div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={smtp.secure} onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked })} className="h-4 w-4 accent-primary" />
            Connexion sécurisée (SSL/TLS — généralement port 465)
          </label>
          <Button onClick={() => save.mutate({ key: "smtp", value: smtp })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer le SMTP</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;
