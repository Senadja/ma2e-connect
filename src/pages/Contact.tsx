import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { MapPin, Phone, Mail, Clock, Send, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDcp, setShowDcp] = useState(false);
  const [subject, setSubject] = useState("Adhésion");
  const [otherSubject, setOtherSubject] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    // Si « Autre » est choisi, l'objet réel est le texte saisi par l'utilisateur.
    const finalSubject = subject === "Autre" ? otherSubject.trim() || "Autre" : subject;
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
                      <div className="text-sm text-white/80">Avenue Houdaille, Immeuble SIDAM<br />6ème étage, Plateau<br />18 BP 1210 Abidjan 18</div>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 text-accent shrink-0"><Phone className="h-5 w-5" /></span>
                    <div>
                      <div className="font-semibold">{t("contact.phone")}</div>
                      <a href="tel:+22527212364887" className="text-sm text-white/80 hover:text-accent">(+225) 27 21 23 64 87</a>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 text-accent shrink-0"><Mail className="h-5 w-5" /></span>
                    <div>
                      <div className="font-semibold">{t("contact.email")}</div>
                      <a href="mailto:contact@ma2e.ci" className="text-sm text-white/80 hover:text-accent block">contact@ma2e.ci</a>
                      <a href="mailto:privacyMA2E@ma2e.ci" className="text-xs text-white/60 hover:text-accent">DCP : privacyMA2E@ma2e.ci</a>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent/20 text-accent shrink-0"><Clock className="h-5 w-5" /></span>
                    <div>
                      <div className="font-semibold">{t("contact.hours")}</div>
                      <div className="text-sm text-white/80">Lun – Ven : 8h00 — 17h00<br />Sam : 9h00 — 12h00</div>
                    </div>
                  </li>
                </ul>

                <div className="mt-8 rounded-xl overflow-hidden border border-white/10">
                  <iframe
                    title={t("common.mapLabel")}
                    src="https://www.openstreetmap.org/export/embed.html?bbox=-4.030%2C5.315%2C-4.005%2C5.335&layer=mapnik&marker=5.325%2C-4.018"
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
              ) : (
                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
                        <option>Autre</option>
                      </select>
                    </div>
                  </div>
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
                    <textarea id="msg" name="message" rows={5} required className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <label className="flex gap-2 items-start text-sm text-muted-foreground">
                    <input type="checkbox" required className="mt-1 accent-primary" />
                    <span>{t("contact.accept")} *</span>
                  </label>
                  <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold text-accent-foreground px-5 py-3.5 font-semibold shadow-gold hover:scale-[1.01] transition-bounce disabled:opacity-60">
                    <Send className="h-4 w-4" /> {loading ? t("contact.sending") : t("contact.send")}
                  </button>

                  <button type="button" onClick={() => setShowDcp(!showDcp)} className="w-full text-xs text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1">
                    Notice DCP <ChevronDown className={`h-3 w-3 transition-transform ${showDcp ? "rotate-180" : ""}`} />
                  </button>
                  {showDcp && (
                    <p className="text-xs text-muted-foreground bg-secondary/40 rounded-lg p-3 leading-relaxed">
                      Les données collectées via ce formulaire sont utilisées exclusivement pour répondre à votre demande. Conformément à la loi ivoirienne n° 2013-450, vous disposez d'un droit d'accès, de rectification et de suppression. Contact DCP : privacyMA2E@ma2e.ci
                    </p>
                  )}
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
