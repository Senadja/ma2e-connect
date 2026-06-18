import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Megaphone, MapPin, Share2, Save, BarChart3, Server, Network, Plus, Trash2, Users, Image as ImageIcon, MessageCircle, Sparkles, Quote, Upload, Languages } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { MILESTONES } from "@/data/site";
import { DEFAULT_LANGUAGES, LANGUAGE_PRESETS, BASE_LANG, type Language } from "@/lib/translate";

interface StatItem { value: number; label: string; suffix: string }
interface OrgChart { level1Name: string; level2Name: string; departments: string[] }
interface OrgUnit { name: string; note: string }
interface Settings {
  flashBanner?: { enabled: boolean; text: string; link: string };
  flashInfos?: { enabled: boolean; speed?: number; items: { text: string; url: string }[] };
  contact?: { address: string; phone: string; email: string };
  social?: { facebook: string; linkedin: string; twitter: string };
  stats?: StatItem[];
  orgChart?: OrgChart;
  orgUnits?: OrgUnit[];
  splash?: { enabled: boolean; image: string; link: string };
  whatsapp?: { enabled: boolean; phone: string; message: string };
  chatbot?: { enabled: boolean; url: string };
  whyUs?: Record<string, string>;
  presidentQuote?: { quote?: string; name?: string; role?: string; bgImage?: string; bgColor?: string };
  homeHero?: Record<string, string>;
  aboutContent?: Record<string, string>;
  milestones?: { year: string; title: string; desc: string }[];
  languages?: { code: string; label: string }[];
}

const DEFAULT_STATS: StatItem[] = [
  { value: 8430, label: "Adhérents", suffix: "" },
  { value: 9, label: "Produits", suffix: "" },
  { value: 14, label: "Années d'activités", suffix: "" },
  { value: 2.9, label: "Mds FCFA de crédits", suffix: "" },
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
  const { t } = useTranslation();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => api<Settings>("/settings") });

  const [flashInfos, setFlashInfos] = useState<{ enabled: boolean; speed: number; items: { text: string; url: string }[] }>({ enabled: true, speed: 25, items: [{ text: "", url: "" }] });
  const [whatsapp, setWhatsapp] = useState({ enabled: false, phone: "", message: "" });
  const [chatbot, setChatbot] = useState({ enabled: false, url: "" });
  const [contact, setContact] = useState({ address: "", phone: "", email: "" });
  const [social, setSocial] = useState({ facebook: "", linkedin: "", twitter: "" });
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);
  const [org, setOrg] = useState<OrgChart>(DEFAULT_ORG);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>(DEFAULT_ORG_UNITS);
  const [splash, setSplash] = useState({ enabled: false, image: "/images/splash-accueil.png", link: "" });
  const whyDefaults: Record<string, string> = {
    kicker: t("home.whyKicker"), titleStart: t("home.whyTitle1"), titleEm: t("home.whyTitleEm"), lead: t("home.whyLead"),
    feat1Title: t("home.whyFeat1Title"), feat1Desc: t("home.whyFeat1Desc"),
    feat2Title: t("home.whyFeat2Title"), feat2Desc: t("home.whyFeat2Desc"),
    stat1Value: "7 335", stat1Label: t("home.whyActiveMembers"),
    stat2Value: "2006", stat2Label: t("home.whyFoundedIn"),
    growthLabel: t("home.whyFundsGrowth"), growthValue: t("home.whyPerYear"),
  };
  const [whyUs, setWhyUs] = useState<Record<string, string>>(whyDefaults);
  const [president, setPresident] = useState({ quote: t("home.quote"), name: "Ahmadou BAKAYOKO", role: t("home.quoteRole"), bgImage: "", bgColor: "" });
  const [uploadingBg, setUploadingBg] = useState(false);
  const bgRef = useRef<HTMLInputElement>(null);
  const uploadBg = async (file: File) => {
    setUploadingBg(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { path } = await api<{ path: string }>("/uploads", { method: "POST", auth: true, isForm: true, body: fd });
      setPresident((p) => ({ ...p, bgImage: path }));
      toast.success("Image téléversée.");
    } catch (e: any) {
      toast.error(e?.message || "Téléversement impossible.");
    } finally {
      setUploadingBg(false);
    }
  };

  const heroDefaults: Record<string, string> = {
    badge: t("home.heroBadge"), title1: t("home.heroTitle1"), title2: t("home.heroTitle2"),
    leadPre: t("home.heroLeadPre"), leadMembers: t("home.heroLeadMembers"), leadPost: t("home.heroLeadPost"),
    ctaProducts: t("home.ctaProducts"), ctaJoin: t("home.ctaJoin"),
  };
  const [homeHero, setHomeHero] = useState<Record<string, string>>(heroDefaults);
  const aboutDefaults: Record<string, string> = {
    founderVision: t("about.founderVision"), founderQuote: t("about.founderQuote"),
    founderName: "Marcel ZADI KESSY", founderRole: t("about.founder"),
    mission1Title: t("about.mission1Title"), mission1Desc: t("about.mission1Desc"),
    mission2Title: t("about.mission2Title"), mission2Desc: t("about.mission2Desc"),
    mission3Title: t("about.mission3Title"), mission3Desc: t("about.mission3Desc"),
  };
  const [aboutContent, setAboutContent] = useState<Record<string, string>>(aboutDefaults);
  const [milestones, setMilestones] = useState<{ year: string; title: string; desc: string }[]>(
    MILESTONES.map((m) => ({ year: m.year, title: t(`about.milestones.${m.year}.title`, { defaultValue: m.title }), desc: t(`about.milestones.${m.year}.desc`, { defaultValue: m.desc }) }))
  );
  const updateMs = (i: number, field: "year" | "title" | "desc", val: string) =>
    setMilestones((ms) => ms.map((m, idx) => (idx === i ? { ...m, [field]: val } : m)));
  const addMs = () => setMilestones((ms) => [...ms, { year: "", title: "", desc: "" }]);
  const removeMs = (i: number) => setMilestones((ms) => ms.filter((_, idx) => idx !== i));
  const saveMs = () => save.mutate({ key: "milestones", value: milestones.map((m) => ({ year: m.year.trim(), title: m.title.trim(), desc: m.desc.trim() })).filter((m) => m.year || m.title) });

  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [addCode, setAddCode] = useState("");
  const addLanguage = () => {
    const preset = LANGUAGE_PRESETS.find((p) => p.code === addCode);
    if (!preset || languages.some((l) => l.code === preset.code)) return;
    setLanguages((ls) => [...ls, preset]);
    setAddCode("");
  };
  const removeLanguage = (code: string) => setLanguages((ls) => ls.filter((l) => l.code !== code));
  const saveLanguages = () => {
    const base = LANGUAGE_PRESETS.find((p) => p.code === BASE_LANG)!; // langue source toujours en tête
    const rest = languages.filter((l) => l.code !== BASE_LANG);
    save.mutate({ key: "languages", value: [base, ...rest] });
  };

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
    if (data.flashInfos && Array.isArray(data.flashInfos.items)) {
      setFlashInfos({ enabled: !!data.flashInfos.enabled, speed: Number(data.flashInfos.speed) || 25, items: data.flashInfos.items.length ? data.flashInfos.items.map((it) => ({ text: it.text || "", url: it.url || "" })) : [{ text: "", url: "" }] });
    } else if (data.flashBanner?.text) {
      setFlashInfos({ enabled: !!data.flashBanner.enabled, speed: 25, items: [{ text: data.flashBanner.text, url: data.flashBanner.link || "" }] });
    }
    if (data.contact) setContact({ address: data.contact.address || "", phone: data.contact.phone || "", email: data.contact.email || "" });
    if (data.social) setSocial({ facebook: data.social.facebook || "", linkedin: data.social.linkedin || "", twitter: data.social.twitter || "" });
    if (Array.isArray(data.stats) && data.stats.length) setStats(data.stats);
    if (data.orgChart) setOrg({
      level1Name: data.orgChart.level1Name || DEFAULT_ORG.level1Name,
      level2Name: data.orgChart.level2Name || DEFAULT_ORG.level2Name,
      departments: Array.isArray(data.orgChart.departments) && data.orgChart.departments.length ? data.orgChart.departments : DEFAULT_ORG.departments,
    });
    if (Array.isArray(data.orgUnits) && data.orgUnits.length) setOrgUnits(data.orgUnits.map((u) => ({ name: u.name || "", note: u.note || "" })));
    if (data.splash) setSplash({ enabled: !!data.splash.enabled, image: data.splash.image || "/images/splash-accueil.png", link: data.splash.link || "" });
    if (data.whatsapp) setWhatsapp({ enabled: !!data.whatsapp.enabled, phone: data.whatsapp.phone || "", message: data.whatsapp.message || "" });
    if (data.chatbot) setChatbot({ enabled: !!data.chatbot.enabled, url: data.chatbot.url || "" });
    if (data.whyUs) setWhyUs((w) => ({ ...w, ...data.whyUs }));
    if (data.presidentQuote) {
      const pq = data.presidentQuote;
      setPresident((p) => ({ quote: pq.quote ?? p.quote, name: pq.name ?? p.name, role: pq.role ?? p.role, bgImage: pq.bgImage ?? p.bgImage, bgColor: pq.bgColor ?? p.bgColor }));
    }
    if (data.homeHero) setHomeHero((h) => ({ ...h, ...data.homeHero }));
    if (data.aboutContent) setAboutContent((a) => ({ ...a, ...data.aboutContent }));
    if (Array.isArray(data.milestones) && data.milestones.length) setMilestones(data.milestones.map((m) => ({ year: m.year || "", title: m.title || "", desc: m.desc || "" })));
    if (Array.isArray(data.languages) && data.languages.length) setLanguages(data.languages.map((l) => ({ code: l.code, label: l.label })));
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

  const updateInfo = (i: number, field: "text" | "url", val: string) =>
    setFlashInfos((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, [field]: val } : it)) }));
  const addInfo = () => setFlashInfos((f) => ({ ...f, items: [...f.items, { text: "", url: "" }] }));
  const removeInfo = (i: number) => setFlashInfos((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const saveInfos = () => {
    const items = flashInfos.items.map((it) => ({ text: it.text.trim(), url: it.url.trim() })).filter((it) => it.text);
    save.mutate({ key: "flashInfos", value: { enabled: flashInfos.enabled, speed: flashInfos.speed, items } });
  };

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
        <p className="text-muted-foreground">Modifiez les éléments globaux sans toucher au code. Les réglages sont regroupés par page.</p>
      </div>

      <Tabs defaultValue="accueil" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-muted/60 p-1">
          <TabsTrigger value="accueil">Accueil</TabsTrigger>
          <TabsTrigger value="apropos">À propos</TabsTrigger>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
          <TabsTrigger value="technique">Technique</TabsTrigger>
        </TabsList>

        {/* ============================ ACCUEIL ============================ */}
        <TabsContent value="accueil" className="space-y-6 mt-0">

          {/* Hero d'accueil */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Hero d'accueil</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2"><label className={label}>Badge</label><Input value={homeHero.badge} onChange={(e) => setHomeHero({ ...homeHero, badge: e.target.value })} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2"><label className={label}>Titre — ligne 1</label><Input value={homeHero.title1} onChange={(e) => setHomeHero({ ...homeHero, title1: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Titre — ligne 2 (colorée)</label><Input value={homeHero.title2} onChange={(e) => setHomeHero({ ...homeHero, title2: e.target.value })} /></div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="grid gap-2"><label className={label}>Accroche (avant le nombre)</label><Input value={homeHero.leadPre} onChange={(e) => setHomeHero({ ...homeHero, leadPre: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Mot après le nombre</label><Input value={homeHero.leadMembers} onChange={(e) => setHomeHero({ ...homeHero, leadMembers: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Accroche (suite)</label><Input value={homeHero.leadPost} onChange={(e) => setHomeHero({ ...homeHero, leadPost: e.target.value })} /></div>
              </div>
              <p className="text-[11px] text-muted-foreground">Le nombre d'adhérents s'insère automatiquement entre les deux premiers champs d'accroche.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2"><label className={label}>Bouton 1 (produits)</label><Input value={homeHero.ctaProducts} onChange={(e) => setHomeHero({ ...homeHero, ctaProducts: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Bouton 2 (adhésion)</label><Input value={homeHero.ctaJoin} onChange={(e) => setHomeHero({ ...homeHero, ctaJoin: e.target.value })} /></div>
              </div>
              <Button onClick={() => save.mutate({ key: "homeHero", value: homeHero })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer le hero</Button>
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

          {/* Pourquoi nous choisir (accueil) */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> « Pourquoi nous choisir » (accueil)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] text-muted-foreground">Textes et chiffres de la section « Pourquoi nous choisir » de la page d'accueil.</p>
              <div className="grid gap-2"><label className={label}>Sur-titre</label><Input value={whyUs.kicker} onChange={(e) => setWhyUs({ ...whyUs, kicker: e.target.value })} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2"><label className={label}>Titre (début)</label><Input value={whyUs.titleStart} onChange={(e) => setWhyUs({ ...whyUs, titleStart: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Titre (partie colorée)</label><Input value={whyUs.titleEm} onChange={(e) => setWhyUs({ ...whyUs, titleEm: e.target.value })} /></div>
              </div>
              <div className="grid gap-2"><label className={label}>Accroche</label><Input value={whyUs.lead} onChange={(e) => setWhyUs({ ...whyUs, lead: e.target.value })} /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2"><label className={label}>Atout 1 — titre</label><Input value={whyUs.feat1Title} onChange={(e) => setWhyUs({ ...whyUs, feat1Title: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Atout 1 — description</label><Input value={whyUs.feat1Desc} onChange={(e) => setWhyUs({ ...whyUs, feat1Desc: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Atout 2 — titre</label><Input value={whyUs.feat2Title} onChange={(e) => setWhyUs({ ...whyUs, feat2Title: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Atout 2 — description</label><Input value={whyUs.feat2Desc} onChange={(e) => setWhyUs({ ...whyUs, feat2Desc: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="grid gap-2"><label className={label}>Chiffre 1</label><Input value={whyUs.stat1Value} onChange={(e) => setWhyUs({ ...whyUs, stat1Value: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Libellé 1</label><Input value={whyUs.stat1Label} onChange={(e) => setWhyUs({ ...whyUs, stat1Label: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Chiffre 2</label><Input value={whyUs.stat2Value} onChange={(e) => setWhyUs({ ...whyUs, stat2Value: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Libellé 2</label><Input value={whyUs.stat2Label} onChange={(e) => setWhyUs({ ...whyUs, stat2Label: e.target.value })} /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2"><label className={label}>Libellé croissance</label><Input value={whyUs.growthLabel} onChange={(e) => setWhyUs({ ...whyUs, growthLabel: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Valeur croissance</label><Input value={whyUs.growthValue} onChange={(e) => setWhyUs({ ...whyUs, growthValue: e.target.value })} /></div>
              </div>
              <Button onClick={() => save.mutate({ key: "whyUs", value: whyUs })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer la section</Button>
            </CardContent>
          </Card>

          {/* Bloc Président (accueil) */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Quote className="h-5 w-5 text-primary" /> Bloc Président (accueil)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2"><label className={label}>Citation</label>
                <textarea value={president.quote} onChange={(e) => setPresident({ ...president, quote: e.target.value })} rows={3} className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2"><label className={label}>Nom</label><Input value={president.name} onChange={(e) => setPresident({ ...president, name: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Fonction</label><Input value={president.role} onChange={(e) => setPresident({ ...president, role: e.target.value })} /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 items-end">
                <div className="grid gap-2"><label className={label}>Couleur de fond</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={president.bgColor || "#0a2540"} onChange={(e) => setPresident({ ...president, bgColor: e.target.value, bgImage: "" })} className="h-10 w-12 shrink-0 rounded border border-input" />
                    <Input value={president.bgColor} onChange={(e) => setPresident({ ...president, bgColor: e.target.value })} placeholder="vide = couleur par défaut" />
                  </div>
                </div>
                <div className="grid gap-2"><label className={label}>Image de fond (prioritaire)</label>
                  <div className="flex items-center gap-2">
                    <input ref={bgRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBg(f); e.target.value = ""; }} />
                    <Button type="button" variant="outline" size="sm" disabled={uploadingBg} onClick={() => bgRef.current?.click()} className="rounded-full gap-2"><Upload className="h-4 w-4" /> {uploadingBg ? "Envoi…" : "Téléverser"}</Button>
                    {president.bgImage && <button type="button" onClick={() => setPresident({ ...president, bgImage: "" })} className="text-xs text-muted-foreground hover:text-destructive">Retirer</button>}
                  </div>
                </div>
              </div>
              {president.bgImage && <img src={president.bgImage} alt="" className="max-h-32 w-auto rounded-lg border border-border" />}
              <p className="text-[11px] text-muted-foreground">Si une image est définie, elle prime sur la couleur (un voile sombre garde le texte lisible).</p>
              <Button onClick={() => save.mutate({ key: "presidentQuote", value: president })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer le bloc</Button>
            </CardContent>
          </Card>

        </TabsContent>

        {/* ============================ À PROPOS ============================ */}
        <TabsContent value="apropos" className="space-y-6 mt-0">

          {/* À propos — citation & mission */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Quote className="h-5 w-5 text-primary" /> À propos — citation & mission</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2"><label className={label}>Citation du fondateur</label>
                <textarea value={aboutContent.founderQuote} onChange={(e) => setAboutContent({ ...aboutContent, founderQuote: e.target.value })} rows={3} className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="grid gap-2"><label className={label}>Mention (au-dessus)</label><Input value={aboutContent.founderVision} onChange={(e) => setAboutContent({ ...aboutContent, founderVision: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Nom du fondateur</label><Input value={aboutContent.founderName} onChange={(e) => setAboutContent({ ...aboutContent, founderName: e.target.value })} /></div>
                <div className="grid gap-2"><label className={label}>Fonction</label><Input value={aboutContent.founderRole} onChange={(e) => setAboutContent({ ...aboutContent, founderRole: e.target.value })} /></div>
              </div>
              <div className="h-px bg-border/60" />
              <p className="text-[11px] text-muted-foreground">Les 3 missions affichées sur « À propos ».</p>
              {[1, 2, 3].map((n) => (
                <div key={n} className="grid sm:grid-cols-2 gap-4">
                  <div className="grid gap-2"><label className={label}>Mission {n} — titre</label><Input value={aboutContent[`mission${n}Title`]} onChange={(e) => setAboutContent({ ...aboutContent, [`mission${n}Title`]: e.target.value })} /></div>
                  <div className="grid gap-2"><label className={label}>Mission {n} — description</label><Input value={aboutContent[`mission${n}Desc`]} onChange={(e) => setAboutContent({ ...aboutContent, [`mission${n}Desc`]: e.target.value })} /></div>
                </div>
              ))}
              <Button onClick={() => save.mutate({ key: "aboutContent", value: aboutContent })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer les textes</Button>
            </CardContent>
          </Card>

          {/* Frise historique (À propos + accueil) */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Network className="h-5 w-5 text-primary" /> Frise historique</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] text-muted-foreground">Une seule frise pour tout le site : enregistrée ici, elle se met à jour automatiquement sur l'accueil <strong>et</strong> sur « À propos » (année + titre + description).</p>
              {milestones.map((m, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-start rounded-xl border border-border/50 p-3">
                  <div className="col-span-4 sm:col-span-2 grid gap-1"><label className={label}>Année</label><Input value={m.year} onChange={(e) => updateMs(i, "year", e.target.value)} /></div>
                  <div className="col-span-8 sm:col-span-9 grid gap-2">
                    <Input value={m.title} onChange={(e) => updateMs(i, "title", e.target.value)} placeholder="Titre de l'étape" />
                    <Input value={m.desc} onChange={(e) => updateMs(i, "desc", e.target.value)} placeholder="Description" />
                  </div>
                  <div className="col-span-12 sm:col-span-1 flex sm:justify-center">
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeMs(i)} disabled={milestones.length <= 1} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addMs} className="w-fit rounded-full gap-2"><Plus className="h-4 w-4" /> Ajouter une étape</Button>
              <div><Button onClick={saveMs} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer la frise</Button></div>
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

        </TabsContent>

        {/* ============================ GÉNÉRAL ============================ */}
        <TabsContent value="general" className="space-y-6 mt-0">

          {/* Flash infos (bandeau) */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> Flash infos (bandeau)</CardTitle>
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input type="checkbox" checked={flashInfos.enabled} onChange={(e) => setFlashInfos({ ...flashInfos, enabled: e.target.checked })} className="h-4 w-4 accent-primary" />
                Affiché
              </label>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] text-muted-foreground">Plusieurs messages possibles : ils défilent en continu dans le bandeau en haut du site. URL optionnelle par message (page interne « /adhesion » ou lien « https://… »).</p>
              <div className="grid gap-2 max-w-xs">
                <label className={label}>Vitesse (secondes par défilement — plus petit = plus rapide)</label>
                <Input type="number" min={5} max={120} value={flashInfos.speed} onChange={(e) => setFlashInfos({ ...flashInfos, speed: Number(e.target.value) || 25 })} />
              </div>
              {flashInfos.items.map((it, i) => (
                <div key={i} className="grid gap-2 rounded-xl border border-border/50 p-3">
                  <Input value={it.text} onChange={(e) => updateInfo(i, "text", e.target.value)} placeholder="Message de l'info…" />
                  <div className="flex gap-2">
                    <Input value={it.url} onChange={(e) => updateInfo(i, "url", e.target.value)} placeholder="URL au clic (optionnel) — /adhesion ou https://…" />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeInfo(i)} disabled={flashInfos.items.length <= 1} className="shrink-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addInfo} className="w-fit rounded-full gap-2"><Plus className="h-4 w-4" /> Ajouter une info</Button>
              <div><Button onClick={saveInfos} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer les flash infos</Button></div>
            </CardContent>
          </Card>

          {/* Splash / Pop-up d'accueil */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Splash / Pop-up d'accueil</CardTitle>
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                <input type="checkbox" checked={splash.enabled} onChange={(e) => setSplash({ ...splash, enabled: e.target.checked })} className="h-4 w-4 accent-primary" />
                Activé
              </label>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] text-muted-foreground">Image affichée une fois par session au 1er chargement du site. Désactivée : aucune pop-up.</p>
              <div className="grid gap-2">
                <label className={label}>Image (chemin ou URL)</label>
                <Input value={splash.image} onChange={(e) => setSplash({ ...splash, image: e.target.value })} placeholder="/images/splash-accueil.png" />
              </div>
              <div className="grid gap-2">
                <label className={label}>Lien au clic (optionnel)</label>
                <Input value={splash.link} onChange={(e) => setSplash({ ...splash, link: e.target.value })} placeholder="/adhesion ou https://…" />
              </div>
              {splash.image && <img src={splash.image} alt="" className="max-h-40 w-auto rounded-lg border border-border" />}
              <Button onClick={() => save.mutate({ key: "splash", value: splash })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer la pop-up</Button>
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

          {/* Langues du site */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader><CardTitle className="text-lg font-bold flex items-center gap-2"><Languages className="h-5 w-5 text-primary" /> Langues du site</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-[11px] text-muted-foreground">Le français est la langue source (non supprimable). Avec 2 langues, le sélecteur s'affiche en bascule ; au-delà, il passe automatiquement en menu déroulant. La traduction est assurée par Google.</p>
              <div className="flex flex-wrap gap-2">
                {languages.map((l) => (
                  <span key={l.code} className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/30 pl-3 pr-1.5 py-1 text-sm">
                    <span className="font-semibold">{l.label}</span>
                    <span className="text-[10px] uppercase text-muted-foreground">{l.code}</span>
                    {l.code !== BASE_LANG && (
                      <button type="button" onClick={() => removeLanguage(l.code)} className="h-5 w-5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center" aria-label={`Retirer ${l.label}`}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={addCode} onChange={(e) => setAddCode(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">Ajouter une langue…</option>
                  {LANGUAGE_PRESETS.filter((p) => !languages.some((l) => l.code === p.code)).map((p) => (
                    <option key={p.code} value={p.code}>{p.label} ({p.code})</option>
                  ))}
                </select>
                <Button type="button" variant="outline" size="sm" onClick={addLanguage} disabled={!addCode} className="rounded-full gap-2"><Plus className="h-4 w-4" /> Ajouter</Button>
              </div>
              <div><Button onClick={saveLanguages} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer les langues</Button></div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* ============================ INTERACTIONS ============================ */}
        <TabsContent value="interactions" className="space-y-6 mt-0">

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
                <p className="text-[11px] text-muted-foreground">La page doit autoriser l'intégration en iframe.</p>
                <Button onClick={() => save.mutate({ key: "chatbot", value: chatbot })} className="rounded-full gap-2"><Save className="h-4 w-4" /> Enregistrer l'assistant</Button>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* ============================ TECHNIQUE ============================ */}
        <TabsContent value="technique" className="space-y-6 mt-0">

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

        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManager;
