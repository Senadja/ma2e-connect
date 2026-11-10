import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/lib/content";
import { DcpNotice, FreeTextHint, useFormsDcp } from "@/components/forms/DcpNotice";
import { FormClosed, useFormsPublic } from "@/components/forms/FormClosed";

// Prerequis P8 (retour SD_PDCP, novembre 2026) : permettre d'exercer ses droits DEPUIS le site.
// L'option ci-dessous est ajoutee au champ « Objet » ; sa selection fait apparaitre un second
// menu listant les droits exercables. Le libelle est celui ecrit par SD_PDCP, en capitales.
const EXERCICE_DES_DROITS = "EXERCICE DES DROITS";

// Droits proposes : ordre et libelles EXACTS demandes par SD_PDCP (prerequis P8) — ne pas reformuler.
// ⚠️ Le droit a la LIMITATION du traitement ne figure pas dans cette liste : c'est la liste
// livree par SD_PDCP. Ce droit n'est pas outille cote site (reserve deja signalee a MA2E) ; une
// demande de limitation passe par l'option « Autre » et le traitement manuel du correspondant DCP.
const DCP_RIGHTS = [
  "Accès à mes données personnelles",
  "Rectification / mise à jour de mes données personnelles",
  "Effacement de mes données personnelles",
  "Portabilité de mes données personnelles",
  "Retrait de mon Consentement au traitement de mes données personnelles",
  "Opposition au traitement de mes données personnelles",
];

const Contact = () => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const { dcp, fill } = useFormsDcp();
  const formsPublic = useFormsPublic();
  const c = settings?.contact;
  // Carte OpenStreetMap (gratuite, sans clé API) centrée sur la position éditable au CMS.
  const mapLat = parseFloat(String(c?.mapLat ?? "")) || 5.325;
  const mapLng = parseFloat(String(c?.mapLng ?? "")) || -4.018;
  const dLat = 0.01, dLng = 0.0125;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${(mapLng - dLng).toFixed(4)}%2C${(mapLat - dLat).toFixed(4)}%2C${(mapLng + dLng).toFixed(4)}%2C${(mapLat + dLat).toFixed(4)}&layer=mapnik&marker=${mapLat.toFixed(4)}%2C${mapLng.toFixed(4)}`;
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [subject, setSubject] = useState("Adhésion");
  const [otherSubject, setOtherSubject] = useState("");
  const [rightKind, setRightKind] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // « Autre » : l'objet réel est le texte saisi. « EXERCICE DES DROITS » : l'objet porte le
    // droit choisi, afin que la demande soit identifiable et routable dès la réception (P8).
    const finalSubject =
      subject === "Autre"
        ? otherSubject.trim() || "Autre"
        : subject === EXERCICE_DES_DROITS
          ? `${EXERCICE_DES_DROITS} — ${rightKind}`
          : subject;
    setLoading(true);
    try {
      await api("/contact", {
        method: "POST",
        body: {
          name: String(fd.get("name") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          subject: finalSubject,
          message: String(fd.get("message") || ""),
          consent: true,
        },
      });
      setSent(true);
    } catch (err: any) {
      toast.error(err?.message || "Échec de l'envoi. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <PageHero
        title={t("contact.heroTitle")}
        subtitle={t("contact.heroSubtitle")}
        breadcrumb={[{ label: t("nav.home"), href: "/" }, { label: t("nav.contact") }]}
      />

      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 rounded-3xl overflow-hidden shadow-elegant border border-border bg-card">
            {/* Info */}
            <aside className="bg-primary-dark text-white p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 grid-pattern-light opacity-40" aria-hidden />
              <div className="relative">
                <h2 className="font-display text-3xl font-bold">{t("contact.coordinates")}</h2>
                <p className="mt-2 text-white/70 text-sm">{t("contact.head")}</p>

                <ul className="mt-8 space-y-5">
                  <li className="flex gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 text-accent shrink-0"><MapPin className="h-5 w-5" /></span>
                    <div>
                      <div className="font-semibold">{t("contact.address")}</div>
                      <div className="text-sm text-white/80 whitespace-pre-line">{c?.address || "Avenue Houdaille, Immeuble SIDAM, 6ème étage, Plateau, 18 BP 1210 Abidjan 18"}</div>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 text-accent shrink-0"><Phone className="h-5 w-5" /></span>
                    <div>
                      <div className="font-semibold">{t("contact.phone")}</div>
                      <a href={`tel:${(c?.phone || "+225 27 21 23 64 87").replace(/[^0-9+]/g, "")}`} className="text-sm text-white/80 hover:text-accent">{c?.phone || "(+225) 27 21 23 64 87"}</a>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 text-accent shrink-0"><Mail className="h-5 w-5" /></span>
                    <div>
                      <div className="font-semibold">{t("contact.email")}</div>
                      <a href={`mailto:${c?.email || "info@ma2e.ci"}`} className="text-sm text-white/80 hover:text-accent block">{c?.email || "info@ma2e.ci"}</a>
                      <a href={`mailto:${c?.dcpEmail || "privacyMA2E@ma2e.ci"}`} className="text-xs text-white/60 hover:text-accent">DCP : {c?.dcpEmail || "privacyMA2E@ma2e.ci"}</a>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 text-accent shrink-0"><Clock className="h-5 w-5" /></span>
                    <div>
                      <div className="font-semibold">{t("contact.hours")}</div>
                      <div className="text-sm text-white/80 whitespace-pre-line">{c?.hours || "Lun – Ven : 8h00 — 17h00"}</div>
                    </div>
                  </li>
                </ul>

                <div className="mt-8 rounded-xl overflow-hidden border border-white/10">
                  <iframe
                    title={t("common.mapLabel")}
                    src={mapSrc}
                    className="w-full h-48 border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            </aside>

            {/* Form */}
            <div className="p-8 md:p-12">
              <h2 className="font-display text-3xl font-bold">{t("contact.sendTitle")}</h2>
              <p className="mt-2 text-muted-foreground text-sm">{t("contact.replyTime")}</p>

              {sent ? (
                <div className="mt-8 rounded-xl bg-primary/10 border border-primary/20 p-6 text-center animate-scale-in">
                  <div className="font-display text-xl font-bold text-primary">{t("contact.sentTitle")}</div>
                  <p className="text-sm text-muted-foreground mt-2">{t("contact.sentText")}</p>
                </div>
              ) : !formsPublic.contact ? (
                // Formulaire fermé au back-office : les coordonnées et la carte ci-contre restent
                // affichées, seul l'envoi du message est retiré.
                <FormClosed className="mt-8" />
              ) : (
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                  <DcpNotice form="contact" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="nom">{t("contact.fullName")} *</label>
                      <input id="nom" name="name" required className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="email">{t("contact.email")} *</label>
                      <input id="email" name="email" type="email" required className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="tel">{t("contact.phone")}</label>
                      <input id="tel" name="phone" className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5" htmlFor="objet">{t("contact.subject")}</label>
                      <select id="objet" name="subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>Adhésion</option>
                        <option>Épargne</option>
                        <option>Crédit</option>
                        <option>Immobilier</option>
                        <option>{EXERCICE_DES_DROITS}</option>
                        <option>Autre</option>
                      </select>
                    </div>
                  </div>
                  {subject === EXERCICE_DES_DROITS && (
                    <div className="animate-in fade-in slide-in-from-top-1">
                      <label className="block text-sm font-medium mb-1.5" htmlFor="droit">
                        Droit que vous souhaitez exercer *
                      </label>
                      <select
                        id="droit"
                        value={rightKind}
                        onChange={(e) => setRightKind(e.target.value)}
                        required
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Sélectionnez le droit à exercer…</option>
                        {DCP_RIGHTS.map((right) => (
                          <option key={right} value={right}>{right}</option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                        Votre demande sera transmise au correspondant à la protection des données de la MA2E
                        ({c?.dcpEmail || "privacyMA2E@ma2e.ci"}). Indiquez dans le message ci-dessous tout
                        élément utile à son traitement.
                      </p>
                    </div>
                  )}
                  {subject === "Autre" && (
                    <div className="animate-in fade-in slide-in-from-top-1">
                      <label className="block text-sm font-medium mb-1.5" htmlFor="objet-autre">{t("contact.otherSubject")} *</label>
                      <input
                        id="objet-autre"
                        value={otherSubject}
                        onChange={(e) => setOtherSubject(e.target.value)}
                        required
                        autoFocus
                        placeholder={t("contact.otherSubject")}
                        className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1.5" htmlFor="msg">{t("contact.message")} *</label>
                    <FreeTextHint className="mb-1.5" />
                    <textarea id="msg" name="message" rows={5} required className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="flex gap-2 items-start text-sm text-muted-foreground">
                      <input
                        type="checkbox"
                        required
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-1 accent-primary"
                      />
                      <span>{dcp.consentLabel} *</span>
                    </label>
                    <p className="pl-6 text-[11px] text-muted-foreground">{fill(dcp.withdrawNote)}</p>
                  </div>
                  <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold text-accent-foreground px-5 py-3.5 font-semibold shadow-gold hover:scale-[1.01] transition-bounce disabled:opacity-60">
                    <Send className="h-4 w-4" /> {loading ? t("contact.sending") : t("contact.send")}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
